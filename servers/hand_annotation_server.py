"""
Sserver for a todo rest API.

Basic data structures in flask_restful (it's a tuto).
"""
from flask import Flask
from flask_restful import reqparse, Api, Resource
from flask_cors import CORS
import yaml
import argparse
import os
import json
import ast

app = Flask(__name__)
CORS(app)
api = Api(app)


# server argument parser
script_arg_parser = argparse.ArgumentParser()
script_arg_parser.add_argument(
    "--config", type=str, help="yaml configuration file of the server."
)
script_args = script_arg_parser.parse_args()
with open(script_args.config, "r") as f:
    cfg = yaml.load(f, Loader=yaml.FullLoader)


ROOT = cfg["root"]
IP = cfg["ip"]
PORT = cfg["port"]


class Error(Exception):
    pass


class ExistingLayerError(Error):
    pass


def get_annotation_path(folder, slide_id):
    """
    Return annotation file associated to slide_id in folder.

    Args:
        folder (str): absolute path to a directory containing slides.
        slide_id (str): slide file basename.
    Returns:
        str: associated slide_id annotation file path.

    """
    slide_base, _ = os.path.splitext(slide_id)
    return os.path.join(folder, "{}.json".format(slide_base))


def get_annotation_from_json_path(jsonpath, slide_id):
    """
    Read a dictionary from jsonpath.

    Args:
        jsonpath (str): path to json file.
        slide_id (str): slide file basename.
    Returns:
        dict: associated annotation dictionary.

    """
    if os.path.exists(jsonpath):
        with open(jsonpath, "r") as f:
            return json.load(f)
    annot = {"slide_id": slide_id, "layers": {}}
    with open(jsonpath, "w") as f:
        json.dump(annot, f)
    return annot


def set_annotation_to_json_path(jsonpath, annot):
    """
    Write a dictionary to jsonpath.

    Args:
        jsonpath (str): path to json file.
        annot (dict): annotation dictionary.
    Returns:
        dict: associated annotation dictionary.

    """
    with open(jsonpath, "w") as f:
        json.dump(annot, f)


def set_annotation_to_slide_id(folder, slide_id, annot):
    """
    Read a dictionary from jsonpath associated to slide_id.

    Args:
        folder (str): absolute path to a directory containing slides.
        slide_id (str): slide file basename.

    """
    jsonpath = get_annotation_path(folder, slide_id)
    set_annotation_to_json_path(jsonpath, annot)


def get_annotation_from_slide_id(folder, slide_id):
    """
    Read a dictionary from jsonpath associated to slide_id.

    Args:
        folder (str): absolute path to a directory containing slides.
        slide_id (str): slide file basename.
    Returns:
        dict: associated annotation dictionary.

    """
    jsonpath = get_annotation_path(folder, slide_id)
    return get_annotation_from_json_path(jsonpath, slide_id)


class SlideAnnotation(Resource):
    """A class to handle slide annotation requests."""

    def get(self, slide_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT, slide_id)
        return annot


class LayerList(Resource):
    """A class to handle list of layers request."""

    def get(self, slide_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT, slide_id)
        return list(annot["layers"].keys())


parser = reqparse.RequestParser()
parser.add_argument('annotation', location='json')


class Layer(Resource):
    """A class to handle list of layers request."""

    def get(self, slide_id, layer_id):
        """Answer GET requests."""
        annot = get_annotation_from_slide_id(ROOT, slide_id)
        if layer_id in annot["layers"]:
            return annot["layers"][layer_id]
        else:
            annot["layers"][layer_id] = dict()
            set_annotation_to_slide_id(ROOT, slide_id, annot)
            return annot["layers"][layer_id]


class Annotation(Resource):
    """A class to handle Annotation requests."""

    def post(self, slide_id, layer_id):
        """Answer POST requests."""
        args = parser.parse_args()
        annot = get_annotation_from_slide_id(ROOT, slide_id)
        print(args['annotation'])
        new_idx = 0
        if len(annot["layers"][layer_id]) > 0:
            new_idx = max([int(idx) for idx in annot["layers"][layer_id].keys()]) + 1
        print("adding to layer : ", layer_id)
        print("annotation index : ", new_idx)
        print("annotation type : ", type(args["annotation"]))
        annot["layers"][layer_id][new_idx] = ast.literal_eval(args["annotation"])
        # print("first annotation in this layer : ", annot["layers"][layer_id]["0"])
        set_annotation_to_slide_id(ROOT, slide_id, annot)
        return annot["layers"][layer_id][new_idx], 201


# Actually setup the Api resource routing here


api.add_resource(SlideAnnotation, '/slide/<slide_id>')
api.add_resource(LayerList, '/layers/<slide_id>')
api.add_resource(Layer, '/layer/<slide_id>/<layer_id>')
api.add_resource(Annotation, '/annotation/<slide_id>/<layer_id>')

# GET a single task:
# curl http://host:port/slide/CS_TheseCharlotte-BF_19T002025.mrxs

# GET the list:
# curl http://host:5000/todos

# DELETE a task:
# curl http://host:5000/todos/todo2 -X DELETE -v

# Add a new task:
# curl http://host:5000/todos -d "task=something new" -X POST -v

# Update a task:
# curl http://host:5000/todos/todo3 -d "task=something different" -X PUT -v


if __name__ == '__main__':
    app.run(debug=True, host=IP, port=PORT)
