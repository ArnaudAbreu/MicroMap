import React, { useState, useEffect } from 'react';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { makeStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Typography from '@material-ui/core/Typography';
import { getFiles } from "./WSI";
import './Tree.css';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1
  },
});

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: '#3EB2E3'
    }
  }
});


const FileNav = ({onFileClick, reset}) => {
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

  const handleSlideClick = (file) => {
    console.log("Changing slide: ", file.path);
    reset();
    onFileClick(file.path, file.name);
  }

  const [tree, setTree] = useState(initialData);
  const [isInit, setIsInit] = useState(false);

  const getInitialData = async () => {
    const response = await getFiles("");
    let root_folders = await response.data;
    setTree(
      {
        root: root_folders
      }
    );
  }

  const writeLabel = (label, path) => {
    return (
      <div style={{overflow: "hidden", textOverflow: "ellipsis"}}>
        <Typography noWrap>
          {label}
        </Typography>
      </div>

    );
  }

  const writeVisitedLabel = (label, path) => {
    return (
      <div style={{overflow: "hidden", textOverflow: "ellipsis"}}>
        <MuiThemeProvider theme={theme}>
          <Typography noWrap color='secondary'>
            {label}
          </Typography>
        </MuiThemeProvider>
      </div>

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
  }, [isInit]);

  const handleChange = (event, nodeId) => {
    getNodeData(nodeId[0]);
  };

  const renderLeaf = (file) => {
    const onClickLeaf = (evt) => {
      evt.preventDefault();
      handleSlideClick(file);
    }
    if (file.annotated) {
      return (
        <TreeItem
          key={file.path}
          nodeId={file.path}
          label={writeVisitedLabel(file.name, file.path)}
          onLabelClick={onClickLeaf}
          icon={<InsertDriveFileIcon/>}>
        </TreeItem>
      );
    }
    else {
      return (
        <TreeItem
          key={file.path}
          nodeId={file.path}
          label={writeLabel(file.name, file.path)}
          onLabelClick={onClickLeaf}
          icon={<InsertDriveFileIcon/>}>
        </TreeItem>
      );
    }
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
          <TreeItem
            key={child.path}
            nodeId={child.path}
            label={writeLabel(child.name)}
            bgColor={'white'}
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
