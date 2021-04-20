import React, {useState, useEffect} from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { DisplayBoard } from './DisplayBoard';
import { EditBoard } from './EditBoard';
import { BasicTextFields } from './AddLayer'
import { FileNav } from './Tree';
import { AppTitleTest } from './AppTitle'

const drawerWidth = 240;
const drawerNavWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  divider:{
    background: "white"
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: '#282c34',
    color: 'white'
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarShiftLeft: {
    width: `calc(100% - ${drawerNavWidth}px)`,
    marginRight: drawerNavWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarShiftBoth: {
    width: `calc(100% - ${drawerWidth + drawerNavWidth}px)`,
    marginRight: drawerNavWidth,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButtonLeft: {
    marginRight: theme.spacing(2),
  },
  menuButtonRight: {
    marginLeft: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawerNav: {
    width: drawerNavWidth,
    flexShrink: 0,
  },
  drawerPaperNav: {
    width: drawerNavWidth,
    background: '#282c34',
    color: 'white'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    background: '#282c34',
    color: 'white'
  },
  drawerNavHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    // justifyContent: 'flex-end',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const ToolBelt = ({
  classList,
  displayOnSwitch,
  editOnRadioChange,
  resetSlide,
  resetInit,
  addLayer
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleNavDrawerOpen = () => {
    setNavOpen(true);
  }

  const handleNavDrawerClose = () => {
    setNavOpen(false);
  }

  useEffect(() => {
    // console.log("Debug ToolBelt: ");
    // console.log("-----------");
    // console.log("Provided annotations: ", classList);
    // console.log("re-render ToolBelt");
    // console.log("-----------\n\n");
  });

  return (
    <div>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
          [classes.appBarShiftLeft]: navOpen,
          [classes.appBarShiftBoth]: open && navOpen,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButtonLeft, open && classes.hide)}
          >
            <ChevronRightIcon />
          </IconButton>
          <AppTitleTest />
         <IconButton
           color="inherit"
           aria-label="open drawer right"
           onClick={handleNavDrawerOpen}
           edge="start"
           className={clsx(classes.menuButtonRight, navOpen && classes.hide)}
         >
           <ChevronLeftIcon />
         </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography gutterBottom variant="h4">
              Tools
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon style={{fill: "white"}}/> : <ChevronRightIcon style={{fill: "white"}}/>}
          </IconButton>
        </div>

        <Divider
          classes={{
            root: classes.divider,
          }} />


        <div style={{marginTop: "35px"}}>
          <Typography gutterBottom variant="h6">
              Display
          </Typography>
        </div>

        <Divider
          variant="middle"
          classes={{
            root: classes.divider,
          }} />

        <DisplayBoard classList={classList} onSwitch={displayOnSwitch} />


        <div style={{marginTop: "35px"}}>
          <Typography gutterBottom variant="h6">
              Edit
          </Typography>
        </div>

        <Divider
          variant="middle"
          classes={{
            root: classes.divider,
          }} />

        <EditBoard classList={classList} onRadioChange={editOnRadioChange} />

        <BasicTextFields addLayer={addLayer}/>

      </Drawer>


      <Drawer
        className={classes.drawerNav}
        variant="persistent"
        anchor="right"
        open={navOpen}
        classes={{
          paper: classes.drawerPaperNav,
        }}
      >
        <div className={classes.drawerNavHeader}>
          <IconButton onClick={handleNavDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronRightIcon style={{fill: "white"}}/> : <ChevronLeftIcon style={{fill: "white"}}/>}
          </IconButton>
          <Typography gutterBottom variant="h4">
              Navigation
          </Typography>
        </div>

        <Divider
          classes={{
            root: classes.divider,
          }} />

        <div style={{marginTop: "35px", marginLeft: "15px"}}>
          <FileNav onFileClick={resetSlide} reset={resetInit}/>
        </div>

      </Drawer>

    </div>
  );
}

export {
  ToolBelt
};
