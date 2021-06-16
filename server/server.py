import openslide
import os
from flask import Flask, make_response, request
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS
from io import BytesIO
from wsi import slides_in_folder, slide_info_to_dict
from hand_annotation import (
    get_annotation_from_slide_id,
    set_annotation_to_slide_id,
    get_annotation_from_json_path,
    set_annotation_to_json_path
)
from tqdm import tqdm
from openslide.deepzoom import DeepZoomGenerator
import ast
from util import children, annots_from_slide
import logging
import pandas as pd


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
c_handler = logging.StreamHandler()
f_handler = logging.FileHandler('micromap_server.log')
c_handler.setLevel(logging.DEBUG)
f_handler.setLevel(logging.DEBUG)
c_format = logging.Formatter('%(name)s - [%(levelname)s] - %(message)s')
f_format = logging.Formatter(
    '%(asctime)s - %(name)s - [%(levelname)s] - %(message)s'
)
c_handler.setFormatter(c_format)
f_handler.setFormatter(f_format)
logger.addHandler(c_handler)
logger.addHandler(f_handler)


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
        logger.info(e)

TILERS = {
    slidename: DeepZoomGenerator(
        slide,
        tile_size=DEEPZOOM_TILE_SIZE,
        overlap=DEEPZOOM_OVERLAP,
        limit_bounds=DEEPZOOM_LIMIT_BOUNDS,
    )
    for slidename, slide in tqdm(SLIDES.items(), ascii=True)
}

path_parser = reqparse.RequestParser()
path_parser.add_argument("path", location="json")

annot_parser = reqparse.RequestParser()
annot_parser.add_argument("annotation", location="json")

annot_and_path_parser = reqparse.RequestParser()
annot_and_path_parser.add_argument("path", location="json")
annot_and_path_parser.add_argument("annotation", location="json")


def get_slide(slide_path):
    """Create openslide slide from slide_path."""
    base = os.path.basename(slide_path)
    if base in SLIDES:
        return SLIDES[base], TILERS[base]
    # slide_path does not know the actual roots on server
    full_path = os.path.join(ROOT_WSI, slide_path)
    try:
        slide = openslide.OpenSlide(full_path)
        tiler = DeepZoomGenerator(
            slide,
            tile_size=DEEPZOOM_TILE_SIZE,
            overlap=DEEPZOOM_OVERLAP,
            limit_bounds=DEEPZOOM_LIMIT_BOUNDS
        )
        SLIDES[base] = slide
        TILERS[base] = tiler
    except (
        openslide.lowlevel.OpenSlideUnsupportedFormatError,
        openslide.lowlevel.OpenSlideError,
    ) as e:
        logger.info(e)
    return slide, tiler


def get_annotation(slide_path):
    """Return (and create if necessary) annotation file for a slide."""
    rel_folder = os.path.dirname(slide_path)
    slide_id = os.path.basename(slide_path)
    slide_prefix, _ = os.path.splitext(slide_id)
    # slide_path does not know the actual roots on server
    annot_folder = os.path.join(ROOT_ANNOTS, rel_folder)
    annot_file = os.path.join(annot_folder, "{}.json".format(slide_prefix))
    annot, existed = get_annotation_from_json_path(annot_file, slide_id)
    return annot, existed


def set_annotation(slide_path, annot):
    """Return (and create if necessary) annotation file for a slide."""
    logger.info("Getting inside annotation writing function")
    rel_folder = os.path.dirname(slide_path)
    slide_id = os.path.basename(slide_path)
    slide_prefix, _ = os.path.splitext(slide_id)
    # slide_path does not know the actual roots on server
    annot_folder = os.path.join(ROOT_ANNOTS, rel_folder)
    annot_file = os.path.join(annot_folder, "{}.json".format(slide_prefix))
    logger.info("Going to write annotations in file: {}".format(annot_file))
    set_annotation_to_json_path(annot_file, annot)


def abort_if_format_does_not_exist(fmt):
    """Do nothing stupid if the requested format does not exists."""
    if fmt != "jpeg" and fmt != "png":
        # Not supported by Deep Zoom
        abort(404, message="Format {} is not supported".format(fmt))


def get_annot_info(annot_file, slide_id):
    """Get layers in the annotation."""
    logger.info("calling info on file: {}".format(annot_file))
    annot, existed = get_annotation_from_json_path(
        annot_file, slide_id, write_permission=False
    )
    layers = []
    shapes = 0
    authors = set()
    try:
        for layer in annot["layers"]:
            layer_info = {k: v for k, v in layer.items() if k != 'shapes'}
            layers.append(layer_info)
            shapes += len(layer["shapes"])
            layer_authors = set([shape["author"] for shape in layer["shapes"]])
            authors |= layer_authors
    except Exception:
        logger.warning("Found invalid annotation file!")
    return {"layers": layers, "shapes": shapes, "authors": list(authors)}


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

    def post(self, slide_ID):
        """Answer GET requests."""
        args = path_parser.parse_args()
        path = args.path
        logger.info("requested slide: {}".format(path))
        slide, _ = get_slide(path)
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
        logger.info(
            "Received following request: level: {}, x: {}, y: {}, format: {}, slide: {}".format(
                level, col, row, fmt, slide_ID
            ),
        )
        tiler = TILERS[slide_ID]
        fmt = fmt.lower()
        abort_if_format_does_not_exist(fmt)
        try:
            tile = tiler.get_tile(level, (col, row))
        except ValueError:
            # Invalid level or coordinates
            abort(
                404,
                "Invalid coords -> level: {}, x: {}, y: {}".format(
                    level, col, row
                )
            )
        buf = PILBytesIO()
        tile.save(buf, fmt, quality=DEEPZOOM_TILE_QUALITY)
        resp = make_response(buf.getvalue())
        resp.mimetype = "image/{}".format(fmt)
        return resp


class SlideAnnotation(Resource):
    """A class to handle slide annotation requests."""

    def post(self, slide_id):
        """Answer GET requests."""
        args = path_parser.parse_args()
        path = args.path
        logger.info("requested slide annotation: {}".format(path))
        annot, existed = get_annotation(path)
        return annot


class LayerList(Resource):
    """A class to handle list of layers request."""

    def post(self, slide_id):
        """Answer GET requests."""
        args = path_parser.parse_args()
        path = args.path
        annot, existed = get_annotation(path)
        return [{"id": ann["id"], "color": ann["color"]} for ann in annot["layers"]]


class Layer(Resource):
    """A class to handle list of layers request."""

    def post(self, slide_id, layer_id):
        """Answer GET requests."""
        args = path_parser.parse_args()
        path = args.path
        annot, existed = get_annotation(path)
        for layer in annot["layers"]:
            if layer_id == layer["id"]:
                return layer
        new_layer = {
            "id": layer_id,
            "color": colorCycle[int((len(annot["layers"]) + 1) % len(colorCycle))],
            "shapes": []
        }
        annot["layers"].append(new_layer)
        set_annotation(path, annot)
        return new_layer


class Annotation(Resource):
    """A class to handle Annotation requests."""

    def post(self, slide_id, layer_id):
        """Answer POST requests."""
        # logger.info("Layer ID requested: {}".format(layer_id))
        # logger.info("Slide requested: {}".format(slide_id))
        args = annot_and_path_parser.parse_args()
        path = args.path
        sent = args.annotation
        # logger.info("Annotation sent: {}".format(sent))
        # logger.info("Annotation type: {}".format(type(sent)))
        annot, existed = get_annotation(path)
        # logger.info(args["annotation"])
        annot_sent = ast.literal_eval(sent)
        # logger.info("Converted sent: {}".format(annot_sent))
        # logger.info("Converted sent has format: {}".format(type(annot_sent)))
        # logger.info("Existing annotation: {}".format(annot))
        for layer in annot["layers"]:
            if layer_id == layer["id"]:
                # logger.info("found the layer id !")
                # logger.info("matched layer: {}".format(layer))
                layer["shapes"].append(annot_sent)
                # logger.info("annotation sent has id: ", annot_sent["id"])
                set_annotation(path, annot)
                return annot_sent, 201

    def delete(self, slide_id, layer_id):
        """Answer DELETE requests."""
        args = annot_and_path_parser.parse_args()
        path = args.path
        sent = args.annotation
        # logger.info(args)
        to_delete = ast.literal_eval(sent)
        to_delete_id = to_delete["id"]
        annot, existed = get_annotation(path)
        was_deleted = False
        new_annot = {k: v for k, v in annot.items() if k != "layers"}
        new_annot["layers"] = []
        for layer in annot["layers"]:
            new_layer = {k: v for k, v in layer.items() if k != "shapes"}
            if layer["id"] != layer_id:
                new_layer["shapes"] = layer["shapes"]
            else:
                new_layer["shapes"] = []
                for shape in layer["shapes"]:
                    if shape["id"] != to_delete_id:
                        new_layer["shapes"].append(shape)
                    else:
                        logger.info("Annotation: {} has been deleted!".format(to_delete))
                        was_deleted = True
            new_annot["layers"].append(new_layer)

        set_annotation(path, new_annot)
        if was_deleted:
            logger.info("Successfully deleted annotation!")
        else:
            logger.warning(
                "Could not find annotation id: {} in following annotations:".format(
                    to_delete_id
                ),

            )
        return "", 204


class SlideTree(Resource):
    """A class to handle file navigation requests."""

    def post(self):
        """Answer POST requests."""
        args = path_parser.parse_args()
        path = args.path
        logger.info("requested path: {}".format(path))
        if path is None:
            return [], 201
        wsi_path = os.path.join(ROOT_WSI, path)
        folders, slides = children(wsi_path)
        annots = annots_from_slide(slides, ROOT_WSI, ROOT_ANNOTS)
        res = []
        for folder in folders:
            res.append(
                {
                    "type": "folder",
                    "name": os.path.basename(folder),
                    "path": os.path.relpath(folder, ROOT_WSI),
                    "annotated": False
                }
            )
        for slide, annot in zip(slides, annots):
            annot_info = get_annot_info(annot, os.path.basename(slide))
            res.append(
                {
                    "type": "file",
                    "name": os.path.basename(slide),
                    "path": os.path.relpath(slide, ROOT_WSI),
                    "annotated": (annot_info["shapes"] > 0),
                    "authors": annot_info["authors"],
                    "layers": annot_info["layers"],
                    "shapes": annot_info["shapes"]
                }
            )
        return res, 201


class Cohort(Resource):
    """A class to handle cohort csv requests."""

    def get(self):
        """Answer GET requests."""
        df = pd.read_csv(os.path.join(ROOT_ANNOTS, "cohort.csv"))
        row_count = df.shape[0]
        column_count = df.shape[1]
        column_names = df.columns.tolist()
        final_row_data = []
        for index, rows in df.iterrows():
            final_row_data.append(rows.to_dict())
        resp = {
            'rows': row_count,
            'cols': column_count,
            'columns': column_names,
            'rowData': final_row_data
        }
        return resp


api.add_resource(SlideTree, "/nav/")
api.add_resource(SlideList, "/slides")
api.add_resource(Slide, "/slides/<slide_ID>")
api.add_resource(Tile, "/slides/<slide_ID>/<int:level>/<int:col>_<int:row>.<fmt>")
api.add_resource(LayerList, "/layers/<slide_id>")
api.add_resource(Layer, "/layers/<slide_id>/<layer_id>")
api.add_resource(SlideAnnotation, "/annotations/<slide_id>")
api.add_resource(Annotation, "/annotations/<slide_id>/<layer_id>")
api.add_resource(Cohort, "/cohort")


if __name__ == "__main__":
    app.run(debug=True)
