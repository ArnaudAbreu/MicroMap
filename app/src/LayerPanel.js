import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';


const LayerPanel = ({classList, onSwitchChanged}) => {

  const createSwitch = (elem) => {
    return (withStyles({
      switchBase: {
        color: elem.color[300],
        '&$checked': {
          color: elem.color[500],
        },
        '&$checked + $track': {
          backgroundColor: elem.color[500],
        },
      },
      checked: {},
      track: {}
    })(Switch));
  }

  const switchList = (elements) => {
    const listItems = elements.map((category, idx) => {
        const ColoredSwitch = createSwitch(category);
        return(
          <FormControlLabel
            control={<ColoredSwitch checked={category.visibility}
                                    onChange={onSwitchChanged}
                                    name={category.label}/>}
            label={category.label}
            style={{marginLeft: "10px"}}
            key={idx}
          />
        );
      }
    );
    console.log("After setting/changing state: ", classList);
    return listItems;
  }

  return(
    <div className="layer-panel" style={{marginTop: "50px"}}>
      <FormControl component="fieldset" style={{marginTop: "30px"}}>
        <FormLabel component="legend" style={{color: "white", fontSize: "30px"}}>Display classes</FormLabel>
        <FormGroup>
          {switchList(classList)}
        </FormGroup>
      </FormControl>
    </div>
  );
}

export {
  LayerPanel
};
