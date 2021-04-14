import React, { useState, useEffect } from 'react';
import { reduce } from 'lodash';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
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
    color: 'white',
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
    color: 'white'
  },
}));

const StyledTreeItem = (props) => {
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
        type: "folder",
        name: "Cohort",
        path: "",
        annotated: false
      }
    ],
    1: []
  };

  const [tree, setTree] = useState(initialData);

  const handleChange = (event, nodeId) => {
    setTimeout(() => {
      const newTree = {
        ...tree,
        [nodeId]: [
          {
            id: "2",
            name: "Calendar",
            type: "file"
          },
          {
            id: "3",
            name: "Settings",
            type: "file"
          },
          {
            id: "4",
            name: "Music",
            type: "file"
          }
        ]
      };

      setTree(newTree);
    }, 100); // simulate xhr
  };

  const renderLeaf = (file) => {
    console.log("rendering: ", file);
    return (
      <TreeItem
        key={file.id}
        nodeId={file.id}
        label={file.name}
        labelIcon={InsertDriveFileIcon}
        labelText={file.name}
        icon={<InsertDriveFileIcon/>}
      />
    )
  }

  const renderTree = (children) => {
    return children.map(child => {
      const childrenNodes =
        tree[child.id] && tree[child.id].length > 0
          ? renderTree(tree[child.id])
          : [<div />];
      if (child.type === "file") {
        return (renderLeaf(child));
      }
      else {
        return (
          <TreeItem
            key={child.id}
            nodeId={child.id}
            label={child.name}
            labelText={child.name}
            expandIcon={<FolderOpenIcon />}
            collapseIcon={<FolderIcon />}
          >
            {childrenNodes}
          </TreeItem>
        );
      }
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
