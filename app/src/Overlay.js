import React from "react";
import { LayerTest } from './Layer';

const Overlay = ({hasposition, isVisible, isDrawing, layers, layergetter, annotSetter, annotRemover}) => {

  const switchDrawingMode = (isDrawingEnabled) => {
    if (isDrawingEnabled) {
      const st = {
        position: hasposition.position,
        display: hasposition.display,
        left: hasposition.left,
        top: hasposition.top,
        width: hasposition.width,
        height: hasposition.height,
        pointerEvents: 'auto',
      };
      return st;
    } else if (hasposition === null){

      return null;

    } else {
      const st = {
        position: hasposition.position,
        display: hasposition.display,
        left: hasposition.left,
        top: hasposition.top,
        width: hasposition.width,
        height: hasposition.height,
        pointerEvents: 'none',
      };
      return st;
    }
  }

  const draw = (elements) => {
    const listItems = elements.map((layer, idx) => {
        const sendLayer = (shapes) => {
          return annotSetter(layer.label, shapes);
        }
        const getlayer = () => {
          return layergetter(layer.label);
        }
        const remover = (shape) => {
          return annotRemover(layer.label, shape);
        }
        if (layer.visibility && isVisible) {
          if (layer.editing) {
            return(
              <LayerTest
                drawing={switchDrawingMode(true)}
                color={layer.color}
                label={layer.label}
                pos={hasposition}
                key={idx}
                send={sendLayer}
                request={getlayer}
                remove={remover}
              />);
          } else {
            return(
              <LayerTest
                drawing={switchDrawingMode(false)}
                color={layer.color}
                label={layer.label}
                pos={hasposition}
                key={idx}
                send={sendLayer}
                request={getlayer}
                remove={remover}
              />);
          }
        } else {
          return null;
        }
      }
    );
    return listItems;
  }

  return(
    <div>
        {draw(layers)}
    </div>
  );

}

export {
  Overlay
};
