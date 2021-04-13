import openslide
import os
from flask import Flask, make_response, request
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS
from io import BytesIO
from wsi import slides_in_folder, slide_info_to_dict
from hand_annotation import get_annotation_from_slide_id, set_annotation_to_slide_id
from tqdm import tqdm
from openslide.deepzoom import DeepZoomGenerator
import ast
from util import children, annots_from_slide

app = Flask(__name__)
CORS(app)
api = Api(app)

colorCycle = [
    "#f44336", "#8bc34a", "#ffeb3b", "#673ab7", "#e91e63", "#cddc39", "#9c27b0",
    "#ffc107", "#3f51b5", "#ff9800", "#2196f3", "#ff5722", "#03a9f4", "#795548",
    "#00bcd4", "#607d8b", "#009688", "#4caf50"
]

SLIDE_DIR = "."
SLIDE_CACHE_SIZE = 10
DEEPZOOM_FORMAT = "jpeg"
DEEPZOOM_TILE_SIZE = 254
DEEPZOOM_OVERLAP = 1
DEEPZOOM_LIMIT_BOUNDS = False
DEEPZOOM_TILE_QUALITY = 75
ROOT_WSI = "/data/slides"
ROOT_ANNOTS = "/data/annots"
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
        res["source"]["Image"]["Url"] = "http://{}/slides/{}/".format(
            request.host, slide_ID
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
        return [{"id": ann["id"], "color": ann["color"]} for ann in annot["layers"]]


parser = reqparse.RequestParser()
parser.add_argument("annotation", location="json")


class Layer(Resource):
    """A class to handle list of layers request."""

    def get(self, slide_id, layer_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        for layer in annot["layers"]:
            if layer_id == layer["id"]:
                return layer
        new_layer = {
            "id": layer_id,
            "color": colorCycle[int((len(annot["layers"]) + 1) % len(colorCycle))],
            "shapes": []
        }
        annot["layers"].append(new_layer)
        set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
        return new_layer


class Annotation(Resource):
    """A class to handle Annotation requests."""

    def post(self, slide_id, layer_id):
        """Answer POST requests."""
        args = parser.parse_args()
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)

        print(args["annotation"])

        annot_sent = ast.literal_eval(args["annotation"])

        for layer in annot["layers"]:
            if layer_id == layer["id"]:
                layer["shapes"].append(annot_sent)

                # print("annotation sent has id: ", annot_sent.id)

                set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
                return annot_sent, 201

    def delete(self, slide_id, layer_id):
        """Answer DELETE requests."""
        args = parser.parse_args()
        print(args)
        to_delete = ast.literal_eval(args["annotation"])
        to_delete_id = to_delete["id"]
        annot = get_annotation_from_slide_id(ROOT_ANNOTS, slide_id)
        was_deleted = False
        new_layer = dict()
        layer_idx = 0
        for layer in annot["layers"]:
            if layer_id == layer["id"]:
                new_layer["id"] = layer_id
                new_layer["color"] = layer["color"]
                new_layer["shapes"] = []
                for shape in layer["shapes"]:
                    if shape["id"] != to_delete_id:
                        new_layer["shapes"].append(shape)
                    else:
                        print("Annotation: {} has been deleted!".format(to_delete))
            layer_idx += 1
        if was_deleted:
            annot["layers"][layer_idx] = new_layer
            set_annotation_to_slide_id(ROOT_ANNOTS, slide_id, annot)
        else:
            print(
                "Could not find annotation id: {} in following annotations:".format(
                    to_delete_id
                )
            )
        return "", 204


class SlideTree(Resource):
    """A class to handle file navigation requests."""

    def get(self, path):
        """Answer GET requests."""
        wsi_path = os.path.join(ROOT_WSI, path)
        folders, slides = children(wsi_path)
        annots = annots_from_slide(slides, ROOT_WSI, ROOT_ANNOTS)
        res = []
        for slide, annot in zip(slides, annots):
            res.append(
                {
                    "type": "file",
                    "name": os.path.basename(slide),
                    "path": os.path.relpath(slide, ROOT_WSI),
                    "annotated": os.path.exists(annot)
                }
            )
        return res


api.add_resource(SlideTree, "/nav/<path>")
api.add_resource(SlideList, "/slides")
api.add_resource(Slide, "/slides/<slide_ID>")
api.add_resource(Tile, "/slides/<slide_ID>/<int:level>/<int:col>_<int:row>.<fmt>")
api.add_resource(LayerList, "/layers/<slide_id>")
api.add_resource(Layer, "/layers/<slide_id>/<layer_id>")
api.add_resource(SlideAnnotation, "/annotations/<slide_id>")
api.add_resource(Annotation, "/annotations/<slide_id>/<layer_id>")


if __name__ == "__main__":
    app.run(debug=True)
