import React, { useState, useEffect } from 'react';
import { OpenSeaDragonViewer } from './OpenSeaDragonViewer';
import { ToolBelt } from './ToolBelt';

const AnnotViewer = ({img, x, y,
                      overlay,
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

  const addNewLayer = async (ann, name) => {
    const annotations = ann.slice();
    const noneAnnot = annotations.pop();

    const response = await layergetter(name);
    let srv_layer = await response.data;
    console.log("requested layer: ", srv_layer);
    console.log("ask to add layer: ", name);

    if (srv_layer.shapes.length === 0) {
      annotations.push({index: srv_layer.id,
                        label: name,
                        visibility: false,
                        color: srv_layer.color,
                        disabled: false,
                        editing: false});
    }

    annotations.push(noneAnnot);
    setLayerList(annotations);
  }

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
    addNewLayer(layerList, name);
  }

  useEffect(() => {

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
      console.log("init annotation with: ", ann);
      const annotations = ann.map((category, idx) => {
        const annotState = {
          index: category.id,
          label: category.id,
          visibility: false,
          color: category.color,
          disabled: false,
          editing: false
        };
        return annotState;
      })
      return addNoneAnnotation(annotations);

    }

    if ((foundAnnots === true && isInit === false) || (provided !== annots)){
      // console.log("re-initialize annotations in annotviewer !");
      setProvided(annots);
      setLayerList(initAnnotations(annots));
      setIsInit(true);
    }
    // console.log("Debug AnnotViewer: ");
    // console.log("-----------");
    // console.log("Provided annotations: ", annots);
    // console.log("Found annotations: ", foundAnnots);
    // console.log("Annotation state: ", layerList);
    // console.log("re-render AnnotViewer");
    // console.log("-----------\n\n");
  }, [foundAnnots, isInit, provided, annots]);

  const reInit = () => {
    setIsInit(false);
  }

  return(
    <div style={{display: "flex"}}>
      <div>
        <ToolBelt classList={layerList}
                  displayOnSwitch={changeDisplay}
                  editOnRadioChange={changeEdit}
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
