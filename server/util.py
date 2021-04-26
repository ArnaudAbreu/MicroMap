"""
A module with useful functions for file exploration.

Find slide files in folders and all.
"""
import os


class NotADirectoryError(Exception):
    """Raise when expecting directory."""

    pass


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


def raw_children(folder):
    """Find authorized children of a folder."""
    folders = []
    files = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if os.path.isdir(path):
            folders.append(path)
        else:
            files.append(path)
    return sorted(folders), sorted(files)


def has_slides(folder):
    """Return True folder only if it leads to slide files."""
    folders, files = raw_children(folder)
    files = filtered_paths(files)
    if len(files) > 0:
        return True
    if len(folders) > 0:
        for subfolder in folders:
            has_slides_ = has_slides(subfolder)
            if has_slides_:
                return True
    return False


def children(folder):
    """Find authorized children of a folder."""
    folders = []
    files = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if os.path.isdir(path):
            if has_slides(path):
                folders.append(path)
        else:
            files.append(path)
    files = filtered_paths(files)
    return sorted(folders), sorted(files)


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
