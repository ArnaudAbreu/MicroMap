import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';


const DisplayBoard = ({classList, onSwitch}) => {

  const createSwitch = (elem) => {
    return (withStyles({
      switchBase: {
        color: elem.color,
        '&$checked': {
          color: elem.color,
        },
        '&$checked + $track': {
          backgroundColor: elem.color,
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
          <ListItem key={idx}>
            <ListItemText id={"switch-" + category.label} primary={category.label} />
            <ListItemSecondaryAction>
              <ColoredSwitch checked={category.visibility}
                                      onChange={onSwitch}
                                      name={category.label}
                                      disabled={category.disabled}
                                      />
            </ListItemSecondaryAction>
          </ListItem>
        );
      }
    );
    return listItems;
  }

  return(
    <List>
      {switchList(classList)}
    </List>
  );
}

export {
  DisplayBoard
};
