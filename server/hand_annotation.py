"""
Sserver for a todo rest API.

Basic data structures in flask_restful (it's a tuto).
"""
import os
import json


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
