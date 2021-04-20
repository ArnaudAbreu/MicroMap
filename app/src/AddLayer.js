import React, { useState } from 'react';
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import AddCircle from '@material-ui/icons/AddCircle';
import Button from '@material-ui/core/Button';
import { grey, blueGrey } from '@material-ui/core/colors';


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
  button: {
    margin: theme.spacing(1),
  },
  floatingLabelFocusStyle: {
    color: 'white',
  },
  input: {
    color: 'white',
  },
  label: {
    color: 'white',
  }
}));

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: blueGrey
  },
  input: {
    color: 'white',
  },
});

const BasicTextFields = ({addLayer}) => {
  const classes = useStyles();
  const [layerName, setLayerName] = useState("");

  const changeInputStr = (evt) => {
    setLayerName(evt.target.value);
  }
  const changeLayerName = () => {
    const name = layerName;
    addLayer(name);
  }

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <ThemeProvider theme={theme}>
            <TextField id="filled-basic" label="New Layer" variant="filled"
              InputProps={{
                className: classes.input,
              }}
              InputLabelProps={{
                className: classes.label,
              }}
              onChange={changeInputStr} />
            </ThemeProvider>
          </Grid>
          <Grid item>
            <ThemeProvider theme={theme}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<AddCircle />}
              onClick={changeLayerName}
            >
            Add Layer
            </Button>
            </ThemeProvider>
          </Grid>
        </Grid>
    </form>
  );
}

export {
  BasicTextFields
};
