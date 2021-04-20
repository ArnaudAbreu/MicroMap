import React, {
  useEffect,
  useState
} from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';

const users = [
  "Camille Franchet",
  "Camille Laurent",
  "Charlotte Syrykh",
  "Kévin Cortacero",
  "Marine Caranana",
  "Pauline Gorez",
  "Pierre Brousset",
  "Pilar Ortega",
  "Robin Schwob",
  "Nathalie Van Acker",
  "FX Frenois",
  "Arnaud Abreu",
  "John Wick",
  "Luke Skywalker",
  "Darth Vader"
];


const IdDialog = ({trigger, keepOpen, opened}) => {
  const [open, setOpen] = useState(opened)
  const [personName, setPersonName] = useState("");

  const changeInputStr = (evt) => {
    setPersonName(evt.target.value);
  }

  const handleClose = (evt) => {
    evt.preventDefault();
    trigger(personName);
    keepOpen(false);
    setOpen(false);
  }

  const handleSelect = (evt, val, reason) => {
    setPersonName(val);
  }

  useEffect(() => {
    console.log("Debug Dialog Id: ");
    console.log("-----------");
    console.log("Provided str: ", personName);
    console.log("-----------\n\n");
  });

  return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Who are you ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To be able to write this annotation, please enter your name here.
          </DialogContentText>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            autoComplete
            autoHighlight
            autoSelect
            options={users}
            onChange={handleSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                autoFocus
                margin="dense"
                id="name"
                fullWidth
                label="Enter your name or nickname plz"
                variant="outlined"
                InputProps={{ ...params.InputProps, type: 'search' }}
                onChange={changeInputStr}
                />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export {
  IdDialog
};
