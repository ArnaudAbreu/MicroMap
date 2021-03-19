import yaml
import openslide
import os
from flask import Flask, make_response
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS
from io import BytesIO
from wsi import slides_in_folder, slide_info_to_dict
from hand_annotation import get_annotation_from_slide_id, set_annotation_to_slide_id
from tqdm import tqdm
from openslide.deepzoom import DeepZoomGenerator
import argparse
import ast

# server argument parser
script_arg_parser = argparse.ArgumentParser()
script_arg_parser.add_argument(
    "--config",
    type=str,
    help="yaml configuration file of the server.",
    default="config.yml",
)
script_args = script_arg_parser.parse_args()
with open(script_args.config, "r") as f:
    cfg = yaml.load(f, Loader=yaml.FullLoader)

app = Flask(__name__)
CORS(app)
api = Api(app)

SLIDE_DIR = "."
SLIDE_CACHE_SIZE = 10
DEEPZOOM_FORMAT = "jpeg"
DEEPZOOM_TILE_SIZE = 254
DEEPZOOM_OVERLAP = 1
DEEPZOOM_LIMIT_BOUNDS = False
DEEPZOOM_TILE_QUALITY = 75
ROOT_WSI = cfg["root_wsi"]
ROOT_ANNOTS = cfg["root_annots"]
IP = cfg["ip"]
PORT = cfg["port"]
SLIDES = dict()
for s in tqdm(iterable=slides_in_folder(ROOT_WSI), ascii=True):
    try:
        SLIDES[os.path.basename(s)] = openslide.OpenSlide(s)
    except (
        openslide.lowlevel.OpenSlideUnsupportedFormatError,
        openslide.lowlevel.OpenSlideError,
    ) as e:
        print(e)

TILERS = {
    slidename: DeepZoomGenerator(
        slide,
        tile_size=DEEPZOOM_TILE_SIZE,
        overlap=DEEPZOOM_OVERLAP,
        limit_bounds=DEEPZOOM_LIMIT_BOUNDS,
    )
    for slidename, slide in tqdm(SLIDES.items(), ascii=True)
}


def abort_if_slide_does_not_exist(slide_id):
    """Do nothing stupid if the requested slide does not exists."""
    if slide_id not in SLIDES:
        abort(
            404,
            message="Slide {} doesn't exist! See slidenames: {}".format(
                slide_id, SLIDES
            ),
        )


def abort_if_format_does_not_exist(fmt):
    """Do nothing stupid if the requested format does not exists."""
    if fmt != "jpeg" and fmt != "png":
        # Not supported by Deep Zoom
        abort(404, message="Format {} is not supported".format(fmt))


class PILBytesIO(BytesIO):
    """
    Turn pil image into bytesself.

    ******************************
    """

    def fileno(self):
        """Classic PIL doesn't understand io.UnsupportedOperation."""
        raise AttributeError("Not supported")


class Slide(Resource):
    """A class to handle slide info requests."""

    def get(self, slide_ID):
        """Answer GET requests."""
        print(slide_ID)
        print(type(slide_ID))
        # slide_id = slide_ID.encode("raw_unicode_escape").decode("utf-8")
        abort_if_slide_does_not_exist(slide_ID)
        slide = SLIDES[slide_ID]
        res = slide_info_to_dict(slide)
        res["source"]["Image"]["Url"] = "http://{}:{}/slides/{}/".format(
            IP, PORT, slide_ID
        )
        res["source"]["Image"]["xmlns"] = "http://schemas.microsoft.com/deepzoom/2008"
        return res


class SlideList(Resource):
    """A class to handle slide list requests."""

    def get(self):
        """Answer GET requests."""
        return list(SLIDES.keys())


class Tile(Resource):
    """A class to handle patch requests."""

    def get(self, slide_ID, level, col, row, fmt):
        """Answer GET requests."""
        print(
            "Received following request: level: {}, x: {}, y: {}, format: {}, slide: {}".format(
                level, col, row, fmt, slide_ID
            )
        )
        # slide_id = slide_ID.encode("raw_unicode_escape").decode("utf-8")
        abort_if_slide_does_not_exist(slide_ID)
        slide = TILERS[slide_ID]
        fmt = fmt.lower()
        abort_if_format_does_not_exist(fmt)
        try:
            tile = slide.get_tile(level, (col, row))
        except ValueError:
            # Invalid level or coordinates
            abort(
                404, "Invalid coords -> level: {}, x: {}, y: {}".format(level, col, row)
            )
        buf = PILBytesIO()
        tile.save(buf, fmt, quality=DEEPZOOM_TILE_QUALITY)
        resp = make_response(buf.getvalue())
        resp.mimetype = "image/{}".format(fmt)
        return resp


class SlideAnnotation(Resource):
    """A class to handle slide annotation requests."""

    def get(self, slide_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        return annot


class LayerList(Resource):
    """A class to handle list of layers request."""

    def get(self, slide_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        return list(annot["layers"].keys())


parser = reqparse.RequestParser()
parser.add_argument("annotation", location="json")


class Layer(Resource):
    """A class to handle list of layers request."""

    def get(self, slide_id, layer_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        if layer_id in annot["layers"]:
            return annot["layers"][layer_id]
        else:
            annot["layers"][layer_id] = dict()
            set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
            return annot["layers"][layer_id]


class Annotation(Resource):
    """A class to handle Annotation requests."""

    def post(self, slide_id, layer_id):
        """Answer POST requests."""
        args = parser.parse_args()
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        print(args["annotation"])
        new_idx = 0
        if len(annot["layers"][layer_id]) > 0:
            new_idx = max([int(idx) for idx in annot["layers"][layer_id].keys()]) + 1
        print("adding to layer : ", layer_id)
        print("annotation index : ", new_idx)
        print("annotation type : ", type(args["annotation"]))
        annot_sent = ast.literal_eval(args["annotation"])
        annot["layers"][layer_id][new_idx] = annot_sent
        print("annotation sent has id: ", annot_sent.id)
        set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
        return annot["layers"][layer_id][new_idx], 201

    def delete(self, slide_id, layer_id):
        """Answer DELETE requests."""
        args = parser.parse_args()
        print(args)
        to_delete = ast.literal_eval(args["annotation"])
        to_delete_id = to_delete["id"]
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        was_deleted = False
        new_layer = dict()
        for idx, polygon in annot["layers"][layer_id].items():
            if polygon["id"] != to_delete_id:
                new_layer[idx] = polygon
            else:
                was_deleted = True
        if was_deleted:
            print("Annotation: {} has been deleted!".format(to_delete))
            annot["layers"][layer_id] = new_layer
            set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
        else:
            print(
                "Could not find annotation id: {} in following annotations:".format(
                    to_delete_id
                )
            )
            for idx, polygon in annot["layers"][layer_id].items():
                print("- ID: {}".format(polygon["id"]))
        return "", 204


api.add_resource(SlideList, "/slides")
api.add_resource(Slide, "/slides/<slide_ID>")
api.add_resource(Tile, "/slides/<slide_ID>/<int:level>/<int:col>_<int:row>.<fmt>")
api.add_resource(LayerList, "/layers/<slide_id>")
api.add_resource(Layer, "/layers/<slide_id>/<layer_id>")
api.add_resource(SlideAnnotation, "/annotations/<slide_id>")
api.add_resource(Annotation, "/annotations/<slide_id>/<layer_id>")


if __name__ == "__main__":
    app.run(debug=True, host=IP, port=PORT)
