"""
A module with useful functions for file exploration.

Find slide files in folders and all.
"""
import os

AUTH_FILE_EXT = [
    ".mrxs",
    ".svs",
    ".tif",
    ".tiff"
]


def filtered_paths(paths):
    """Get only authorized files."""
    res = []
    for path in paths:
        _, ext = os.path.splitext(path)
        if ext in AUTH_FILE_EXT:
            res.append(path)
    return res


def children(folder):
    """Find authorized children of a folder."""
    folders = []
    files = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if os.path.isdir(path):
            folders.append(path)
        else:
            files.append(path)
    return folders.sort(), files.sort()


def _annot_from_slide(slide, slide_root, annot_root):
    """Get annotation file path from slide file path."""
    rel_slide = os.path.relpath(slide, slide_root)
    rel, _ = os.path.splitext(rel_slide)
    return os.path.join(annot_root, rel + ".json")


def annots_from_slide(slides, slide_root, annot_root):
    """Get annotation file paths from slide file paths."""
    return [
        _annot_from_slide(slide, slide_root, annot_root) for slide in slides
    ]
