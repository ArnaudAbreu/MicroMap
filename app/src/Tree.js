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
import { getFiles } from "./WSI";

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    marginLeft: 0,
    color: theme.palette.text.secondary,
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:focus > $content, &$selected > $content': {
      backgroundColor: `var(--tree-view-bg-color, '${theme.palette.grey[400]}')`,
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
    marginLeft: 0,
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
    // padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
    align: 'left'
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
    color: 'white',
    align: 'left'
  },
  parentNode: {
    "& ul li $content": {
      // child left padding
      paddingLeft: `calc(var(--node-depth) * ${theme.spacing(2)}px)`
    }
  },
}));

const StyledTreeItem = (props) => {
  const classes = useTreeItemStyles();
  const { children, labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, depth = 0, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={props.children ? classes.parentNode : undefined}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" align="left" className={classes.labelText}>
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
        "--node-depth": depth,
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
      >
      {React.Children.map(children, (child) => {
        // includ depht property to child element
        return React.cloneElement(child, { depth: depth + 1 });
      })}
    </TreeItem>
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  // labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400
  },
});


const FileNav = () => {
  const classes = useStyles();

  const initialData = {
    root: [
      {
        type: "folder",
        name: "Cohort",
        path: "Cohort",
        annotated: false
      }
    ],
  };

  const [tree, setTree] = useState(initialData);
  const [isInit, setIsInit] = useState(false);

  const getInitialData = async () => {
    const response = await getFiles("coucou");
    let root_folders = await response.data;
    setTree(
      {
        root: root_folders
      }
    );
  }

  const getNodeData = async (nodeId) => {
    const response = await getFiles(nodeId);
    let subfolders = await response.data;
    const newTree = {
      ...tree,
      [nodeId]: subfolders
    };
    setTree(newTree);
  }

  useEffect(() => {
    if (isInit === false){
      getInitialData();
      setIsInit(true);
    }
  }, []);

  const handleChange = (event, nodeId) => {
    getNodeData(nodeId[0]);
  };

  const renderLeaf = (file) => {
    return (
      <StyledTreeItem
        key={file.path}
        nodeId={file.path}
        label={file.name}
        bgColor={'white'}
        labelText={file.name}
        icon={<InsertDriveFileIcon/>}
      />
    )
  }

  const renderTree = (children) => {
    //console.log("Children: ", children);
    return children.map(child => {
      const childrenNodes =
        tree[child.path] && tree[child.path].length > 0
          ? renderTree(tree[child.path])
          : [<div />];
      if (child.type === "file") {
        return (renderLeaf(child));
      }
      else {
        return (
          <StyledTreeItem
            key={child.path}
            nodeId={child.path}
            label={child.name}
            labelText={child.name}
            bgColor={'white'}
            expandIcon={<FolderOpenIcon />}
            collapseIcon={<FolderIcon />}
          >
            {childrenNodes}
          </StyledTreeItem>
        );
      }
    });
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<FolderIcon />}
      defaultExpandIcon={<FolderOpenIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      onNodeToggle={handleChange}
    >
      {renderTree(tree.root)}
    </TreeView>
  );
}

export {
  FileNav
};
