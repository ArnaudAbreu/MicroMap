import React, { useState } from 'react';
import { reduce } from 'lodash';
import './Annotation.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';

const Annotation = ({shape, status, remove, edit}) => {

  const [anchorEl, setAnchorEl] = useState(null);

  const polygonPoints = reduce(
      shape.points,
      (sum, point) => {
        return sum + `${point.x},${point.y} `;
      },
      ''
    );

  const display = (annotobj) => {
    const strdisp =
      `id: ${annotobj.id}
       label: ${annotobj.label}
       color: ${annotobj.color}
       author: ${annotobj.author}
       date: ${annotobj.date}
       info: ${annotobj.text}`;
    return strdisp;
  }

  const handleClick = (e) => {
    if (status !== "flying"){
      e.preventDefault();
      e.stopPropagation();
      console.log('The link was clicked!!!');
      setAnchorEl(e.currentTarget);
    }
  }

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    remove(shape);
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(null);
  };

  return(

    <a href="#" onClick={handleClick}>
      <polygon
        className="annotation"
        points={polygonPoints}
        stroke="black"
        strokeWidth="3px"
        fill={shape.color}
        fillOpacity="0.3">
        <title>{display(shape)}</title>
      </polygon>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleCancel}>
          <ListItemIcon>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          Cancel
        </MenuItem>

      </Menu>

    </a>

  );

}

export {
  Annotation
};
