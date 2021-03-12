#!/usr/bin/env python
#
# deepzoom_multiserver - Example web application for viewing multiple slides
#
# Copyright (c) 2010-2015 Carnegie Mellon University
#
# This library is free software; you can redistribute it and/or modify it
# under the terms of version 2.1 of the GNU Lesser General Public License
# as published by the Free Software Foundation.
#
# This library is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
# License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this library; if not, write to the Free Software Foundation,
# Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#

from flask import Flask, make_response
from flask_restful import abort, Api, Resource
from flask_cors import CORS
from io import BytesIO
import yaml
import openslide
from openslide.deepzoom import DeepZoomGenerator
import os
import argparse
from tqdm import tqdm

# server argument parser
script_arg_parser = argparse.ArgumentParser()
script_arg_parser.add_argument(
    "--config", type=str, help="yaml configuration file of the server."
)
script_args = script_arg_parser.parse_args()
with open(script_args.config, "r") as f:
    cfg = yaml.load(f, Loader=yaml.FullLoader)


def slides_in_folder(folder, extensions=(".mrxs",)):
    """
    Return slide files inside a folder for a given extension.

    Args:
        folder (str): absolute path to a directory containing slides.
        extension (list or tuple of str): file extensions of the slides.
    Returns:
        list of str: list of absolute path of slide files.

    """
    abspathlist = []
    for name in os.listdir(folder):

        if not name.startswith("."):
            for extension in extensions:
                if name.endswith(extension):
                    abspathlist.append(os.path.join(folder, name))
    return abspathlist


def slide_info_to_dict(slide):
    """Return a dictionary of info about slide."""
    res = dict()
    info = {
        k: v for k, v in openslide.__dict__.items() if "PROPERTY" in k
    }
    for prop, long_name in info.items():
        name = long_name.split(".")[-1]
        propkey = getattr(openslide, prop)
        if propkey in slide.properties:
            res[name] = slide.properties[propkey]
    src = dict()
    src["Image"] = dict()
    src["Image"]["Format"] = "jpeg"
    src["Image"]["Overlap"] = 1
    src["Image"]["TileSize"] = 254
    src["Image"]["Size"] = {
        "Height": slide.dimensions[1],
        "Width": slide.dimensions[0]
    }
    res["source"] = src
    return res


SLIDE_DIR = '.'
SLIDE_CACHE_SIZE = 10
DEEPZOOM_FORMAT = 'jpeg'
DEEPZOOM_TILE_SIZE = 254
DEEPZOOM_OVERLAP = 1
DEEPZOOM_LIMIT_BOUNDS = False
DEEPZOOM_TILE_QUALITY = 75
ROOT = cfg["root"]
IP = cfg["ip"]
PORT = cfg["port"]
SLIDES = dict()
for s in tqdm(iterable=slides_in_folder(ROOT), ascii=True):
    try:
        SLIDES[os.path.basename(s)] = openslide.OpenSlide(s)
    except (openslide.lowlevel.OpenSlideUnsupportedFormatError, openslide.lowlevel.OpenSlideError) as e:
        print(e)

TILERS = {
    slidename:
        DeepZoomGenerator(
            slide,
            tile_size=DEEPZOOM_TILE_SIZE,
            overlap=DEEPZOOM_OVERLAP,
            limit_bounds=DEEPZOOM_LIMIT_BOUNDS) for slidename, slide in tqdm(SLIDES.items(), ascii=True)
}


def abort_if_slide_does_not_exist(slide_id):
    """Do nothing stupid if the requested slide does not exists."""
    if slide_id not in SLIDES:
        abort(404, message="Slide {} doesn't exist! See slidenames: {}".format(slide_id, SLIDES))


def abort_if_format_does_not_exist(fmt):
    """Do nothing stupid if the requested format does not exists."""
    if fmt != 'jpeg' and fmt != 'png':
        # Not supported by Deep Zoom
        abort(404, message="Format {} is not supported".format(fmt))


app = Flask(__name__)
CORS(app)
api = Api(app)


class PILBytesIO(BytesIO):
    """
    Turn pil image into bytesself.

    ******************************
    """

    def fileno(self):
        """Classic PIL doesn't understand io.UnsupportedOperation."""
        raise AttributeError('Not supported')


class Slide(Resource):
    """A class to handle slide info requests."""

    def get(self, slide_ID):
        """Answer GET requests."""
        slide_id = slide_ID.encode("raw_unicode_escape").decode("utf-8")
        abort_if_slide_does_not_exist(slide_id)
        slide = SLIDES[slide_id]
        res = slide_info_to_dict(slide)
        res["source"]["Image"]["Url"] = "http://{}:{}/patch/{}/".format(IP, PORT, slide_id)
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
            "Received following request: level: {}, x: {}, y: {}, format: {}".format(level, col, row, fmt)
        )
        slide_id = slide_ID.encode("raw_unicode_escape").decode("utf-8")
        abort_if_slide_does_not_exist(slide_id)
        slide = TILERS[slide_id]
        fmt = fmt.lower()
        abort_if_format_does_not_exist(fmt)
        try:
            tile = slide.get_tile(level, (col, row))
        except ValueError:
            # Invalid level or coordinates
            abort(
                404,
                "Invalid coords -> level: {}, x: {}, y: {}".format(level, col, row)
            )
        buf = PILBytesIO()
        tile.save(buf, fmt, quality=DEEPZOOM_TILE_QUALITY)
        resp = make_response(buf.getvalue())
        resp.mimetype = "image/{}".format(fmt)
        return resp


api.add_resource(SlideList, '/slides')
api.add_resource(Slide, '/slides/<slide_ID>')
api.add_resource(
    Tile,
    '/patch/<slide_ID>/<int:level>/<int:col>_<int:row>.<fmt>'
)


if __name__ == '__main__':
    app.run(debug=True, host=IP, port=PORT)
