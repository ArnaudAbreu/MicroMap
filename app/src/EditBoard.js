import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';


const EditBoard = ({classList, onRadioChange}) => {

  const createRadio = (elem) => {
    return (withStyles({
        root: {
          color: elem.color[400],
          '&$checked': {
            color: elem.color[600],
          },
        },
        checked: {},
      })((props) => <Radio color="default" {...props} />)
    );
  }

  const radioList = (elements) => {
    const listItems = elements.map((category, idx) => {
        const ColoredRadio = createRadio(category);
        return(
          <ListItem key={idx}>
            <ListItemText id={"switch-" + category.label} primary={category.label} />
            <ListItemSecondaryAction>
              <ColoredRadio checked={category.editing}
                            onChange={onRadioChange}
                            name={category.label}/>
            </ListItemSecondaryAction>
          </ListItem>
        );
      }
    );
    return listItems;
  }

  return(
    <List>
      {radioList(classList)}
    </List>
  );
}

export {
  EditBoard
};
