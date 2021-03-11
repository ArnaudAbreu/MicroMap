import React, {
  useState
} from "react";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Switch from '@material-ui/core/Switch';
import './AnnotationSwitch.css';

const AnnotationSwitch = (props) => {
  const [check, setCheck] = useState(false);

  const handleChange = (evt) => {
    setCheck(!check);
    props.handleSwitch();
  }

  const GreySwitch = withStyles({
    switchBase: {
      color: grey[300],
      '&$checked': {
        color: grey[500],
      },
      '&$checked + $track': {
        backgroundColor: grey[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);

  return(
      <div className="annotation-switch">
        <FormControlLabel
          control={<GreySwitch checked={check} onChange={handleChange} name="checkAnnotation" />}
          label="Show Annotations"
        />
      </div>
  );

}

const DrawingModeSwitch = (props) => {
  const [check, setCheck] = useState(false);

  const handleChange = (evt) => {
    setCheck(!check);
    props.handleSwitch();
  }

  const GreySwitch = withStyles({
    switchBase: {
      color: grey[300],
      '&$checked': {
        color: grey[500],
      },
      '&$checked + $track': {
        backgroundColor: grey[500],
      },
    },
    checked: {},
    track: {},
  })(Switch);

  return(
      <div className="drawing-mode-switch">
        <FormControlLabel
          control={<GreySwitch checked={check} onChange={handleChange} name="enterDrawingMode" />}
          label="Enter Drawing Mode"
        />
      </div>
  );

}

export {
  AnnotationSwitch,
  DrawingModeSwitch
};
