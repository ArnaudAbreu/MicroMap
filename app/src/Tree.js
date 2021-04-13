import React, { useState, useEffect } from 'react';
import { reduce } from 'lodash';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { TreeView } from '@material-ui/lab';
import { TreeItem } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:focus > $content, &$selected > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: 'var(--tree-view-color)',
    },
    '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
      backgroundColor: 'transparent',
    },
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  group: {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2),
    },
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit',
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
  },
}));

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400,
  },
});


const FileNav = () => {
  const classes = useStyles();

  const initialData = {
    root: [
      {
        id: "1",
        label: "Cohort"
      }
    ],
    1: []
  };

  const [tree, setTree] = useState(initialData);

  const handleChange = (event, nodeId) => {
    console.log("toggle: ", nodeId);
    setTimeout(() => {
      const newTree = {
        ...tree,
        [nodeId]: [
          {
            id: "2",
            label: "Calendar"
          },
          {
            id: "3",
            label: "Settings"
          },
          {
            id: "4",
            label: "Music"
          }
        ]
      };

      setTree(newTree);
    }, 1000); // simulate xhr
  };

  const renderTree = (children) => {
    return children.map(child => {
      const childrenNodes =
        tree[child.id] && tree[child.id].length > 0
          ? renderTree(tree[child.id])
          : [<div />];

      return (
        <StyledTreeItem
          key={child.id}
          nodeId={child.id}
          label={child.label}
          labelIcon={<FolderIcon />}
          labelText={child.label}
        >
          {childrenNodes}
        </StyledTreeItem>
      );
    });
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<FolderIcon />}
      defaultExpandIcon={<FolderOpenIcon />}
      onNodeToggle={handleChange}
    >
      {renderTree(tree.root)}
    </TreeView>
  );
}

export {
  FileNav
};
