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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LayersIcon from '@material-ui/icons/Layers';

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

const defaultFile = {
  authors: [""],
  shapes: 0,
  layers: [{id: ""}]
}


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

  const [tree, setTree] = useState(initialData);
  const [isInit, setIsInit] = useState(false);
  const [ctxt, setCtxt] = useState(null);
  const [ctxtItem, setCtxtItem] = useState(defaultFile);

  const handleSlideClick = (file) => {
    console.log("Changing slide: ", file.path);
    reset();
    onFileClick(file.path, file.name);
  }

  const handleContextMenu = (file, evt) => {
    console.log("Slide context: ", file);
    setCtxt(evt.currentTarget);
    setCtxtItem(file);
  }

  const handleCloseCtxt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxt(null);
    setCtxtItem(defaultFile);
  };

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

  const listLayers = (layers) => {
    const listItems = layers.map((layer) => {
      return (
        ` ${layer.id}`
      );
    });
    return (`Layers: ${listItems}`);
  }

  const listAuthors = (authors) => {
    const listItems = authors.map((author) => {
      return (
        `  ${author}`
      );
    });
    return (`Authors: ${listItems}`);
  }

  const writeCtxtLayers = (file) => {
    return (
      <div style={{overflow: "auto", textOverflow: "auto"}}>
        <MuiThemeProvider theme={theme}>
          <Typography noWrap color='secondary'>
            {listLayers(file.layers)}
          </Typography>
        </MuiThemeProvider>
      </div>

    );
  }

  const writeCtxtAnnotations = (file) => {
    return (
      <div style={{overflow: "auto", textOverflow: "auto"}}>
        <MuiThemeProvider theme={theme}>
          <Typography noWrap color='secondary'>
            {`Annotations: ${file.shapes}`}
          </Typography>
        </MuiThemeProvider>
      </div>

    );
  }

  const writeCtxtAuthors = (file) => {
    return (
      <div style={{overflow: "auto", textOverflow: "auto"}}>
        <MuiThemeProvider theme={theme}>
          <Typography noWrap color='secondary'>
            {listAuthors(file.authors)}
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
    const onRightClickLeaf = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      handleContextMenu(file, evt);
    }
    if (file.annotated) {
      return (
        <TreeItem
          key={file.path}
          nodeId={file.path}
          label={writeVisitedLabel(file.name, file.path)}
          onLabelClick={onClickLeaf}
          onContextMenu={onRightClickLeaf}
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
    <div>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<FolderIcon />}
        defaultExpandIcon={<FolderOpenIcon />}
        onNodeToggle={handleChange}
      >
        {renderTree(tree.root)}
      </TreeView>

      <Menu
        anchorEl={ctxt}
        keepMounted
        open={Boolean(ctxt)}
        onClose={handleCloseCtxt}>

        <MenuItem onClick={handleCloseCtxt}>
          <ListItemIcon>
            <LayersIcon fontSize="small" />
          </ListItemIcon>
          {writeCtxtLayers(ctxtItem)}
        </MenuItem>
        <MenuItem onClick={handleCloseCtxt}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          {writeCtxtAnnotations(ctxtItem)}
        </MenuItem>
        <MenuItem onClick={handleCloseCtxt}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          {writeCtxtAuthors(ctxtItem)}
        </MenuItem>

      </Menu>

    </div>
  );
}

export {
  FileNav
};
