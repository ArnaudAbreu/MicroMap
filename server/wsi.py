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

import openslide
import os


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
