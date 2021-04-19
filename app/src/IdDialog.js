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

  useEffect(() => {
    console.log("Debug Dialog Id: ");
    console.log("-----------");
    console.log("Provided boolean: ", personName);
    console.log("-----------\n\n");
  });

  return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Who are you ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To be able to write this annotation, please enter your name here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Enter your name or nickname plz"
            fullWidth
            onChange={changeInputStr}
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
