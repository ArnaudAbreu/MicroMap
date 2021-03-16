import React, { useState, useEffect } from 'react';
import { OpenSeaDragonViewer } from './OpenSeaDragonViewer';
import { ToolBelt } from './ToolBelt';
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green, // middle
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from '@material-ui/core/colors';

// const colorCycle = [
//   red, lightGreen, yellow, deepPurple, pink, lime, purple, amber,
//   indigo, orange, blue, deepOrange, lightBlue, brown, cyan,
//   blueGrey, teal, green
// ];

const colorCycle = [
  "#f44336", "#8bc34a", "#ffeb3b", "#673ab7", "#e91e63", "#cddc39", "#9c27b0", "#ffc107",
  "#3f51b5", "#ff9800", "#2196f3", "#ff5722", "#03a9f4", "#795548", "#00bcd4",
  "#607d8b", "#009688", "#4caf50"
]

const addNoneAnnotation = (annotations) => {
  const ann = annotations.slice();
  ann.push({index: ann.length,
               label: "None",
               visibility: false,
               color: "#9e9e9e",
               disabled: false,
               editing: false});
  return ann;
}

const initAnnotations = (ann) => {
  const annotations = ann.map((category, idx) => {
    const col = colorCycle[idx]
    const annotState = {
      index: idx,
      label: category,
      visibility: false,
      color: col,
      disabled: false,
      editing: false
    };
    return annotState;
  })
  return addNoneAnnotation(annotations);

}

const addLayerAnnotation = (ann, name) => {
  const annotations = ann.slice();
  const noneAnnot = annotations.pop();
  annotations.push({index: ann.length,
                    label: name,
                    visibility: false,
                    color: colorCycle[ann.length-1],
                    disabled: false,
                    editing: false});
  annotations.push(noneAnnot);
  return annotations;
}

const AnnotViewer = ({img, x, y,
                      overlay, slides,
                      foundAnnots,
                      annots,
                      resetSlide,
                      layergetter,
                      annotSetter,
                      annotRemover}) => {

  const [layerList, setLayerList] = useState([]);
  const [isInit, setIsInit] = useState(false);
  const [displayNone, setDisplayNone] = useState(false);
  const [editNone, setEditNone] = useState(true);
  const [provided, setProvided] = useState(annots);

  const changeAnnotVisibleToNone = () => {
    const annotations = layerList.map((annot, idx) => {
      if (annot.label === "None"){
        const annotState = {
          index: annot.index,
          label: annot.label,
          visibility: true,
          color: annot.color,
          disabled: false,
          editing: false
        };
        return annotState;
      } else {
        const annotState = {
          index: annot.index,
          label: annot.label,
          visibility: false,
          color: annot.color,
          disabled: true,
          editing: annot.editing
        };
        return annotState;
      }

    });
    setDisplayNone(true);
    setLayerList(annotations);
  }

  const changeAnnotVisibleFromNone = () => {
    const annotations = layerList.map((annot, idx) => {
      const annotState = {
        index: annot.index,
        label: annot.label,
        visibility: false,
        color: annot.color,
        disabled: false,
        editing: annot.editing
      };
      return annotState;

    });
    setDisplayNone(false);
    setLayerList(annotations);
  }

  const changeDisplay = (evt) => {
    // console.log("Before changing state: ", annotVisible);
    if (evt.target.name === "None"){
      if (displayNone) {
        changeAnnotVisibleFromNone();
      } else {
        changeAnnotVisibleToNone();
      }
    } else {
      if (displayNone === false) {
        const annotations = layerList.map((annot, idx) => {
          if (evt.target.name !== annot.label){
            const annotState = {
              index: annot.index,
              label: annot.label,
              visibility: annot.visibility,
              color: annot.color,
              disabled: false,
              editing: annot.editing
            };
            return annotState;
          } else {
            const annotState = {
              index: annot.index,
              label: annot.label,
              visibility: !annot.visibility,
              color: annot.color,
              disabled: false,
              editing: annot.editing
            };
            return annotState;
          }

        });
        setLayerList(annotations);
      }
    }
  }

  const changeEditModeToNone = () => {
    const annotations = layerList.map((annot, idx) => {
      if (annot.label === "None"){
        const annotState = {
          index: annot.index,
          label: annot.label,
          visibility: annot.visibility,
          color: annot.color,
          disabled: annot.disabled,
          editing: true
        };
        return annotState;
      } else {
        const annotState = {
          index: annot.index,
          label: annot.label,
          visibility: annot.visibility,
          color: annot.color,
          disabled: annot.disabled,
          editing: false
        };
        return annotState;
      }
    });
    setLayerList(annotations);
    setEditNone(true);
  }

  const changeEdit = (evt) => {
    if (evt.target.name === "None"){
      changeEditModeToNone();
    } else {
      const annotations = layerList.map((annot, idx) => {
        if (annot.label === evt.target.name){
          console.log("setting edit mode for: ", evt.target.name);
          const annotState = {
            index: annot.index,
            label: annot.label,
            visibility: true,
            color: annot.color,
            disabled: annot.disabled,
            editing: true
          };
          return annotState;
        } else {
          const annotState = {
            index: annot.index,
            label: annot.label,
            visibility: annot.visibility,
            color: annot.color,
            disabled: annot.disabled,
            editing: false
          };
          return annotState;
        }
      });
      setLayerList(annotations);
      setEditNone(false);
    }
  }

  const addLayer = (name) => {
    console.log("adding layer: ", name);
    const annots = addLayerAnnotation(layerList, name);
    setLayerList(annots);
  }

  useEffect(() => {
    if ((foundAnnots === true && isInit === false) || (provided !== annots)){
      // console.log("re-initialize annotations in annotviewer !");
      setProvided(annots);
      setLayerList(initAnnotations(annots));
      setIsInit(true);
    }
    console.log("Debug AnnotViewer: ");
    console.log("-----------");
    console.log("Provided annotations: ", annots);
    console.log("Found annotations: ", foundAnnots);
    console.log("Annotation state: ", layerList);
    console.log("re-render AnnotViewer");
    console.log("-----------\n\n");
  });

  const reInit = () => {
    setIsInit(false);
  }

  return(
    <div>
      <div>
        <ToolBelt classList={layerList}
                  displayOnSwitch={changeDisplay}
                  editOnRadioChange={changeEdit}
                  slides={slides}
                  resetSlide={resetSlide}
                  resetInit={reInit}
                  addLayer={addLayer}
                  />
      </div>
      <OpenSeaDragonViewer
        image={img}
        x={x}
        y={y}
        overlay={!displayNone}
        drawing={!editNone}
        layers={layerList}
        layergetter={layergetter}
        annotSetter={annotSetter}
        annotRemover={annotRemover}
      />
    </div>
  );

}

export {
  AnnotViewer
};
