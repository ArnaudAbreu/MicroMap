import React from 'react';
import { reduce } from 'lodash';
import './Annotation.css';

const Annotation = ({points, color}) => {

  const polygonPoints = reduce(
      points,
      (sum, point) => {
        return sum + `${point.x},${point.y} `;
      },
      ''
    );

  return(
    <polygon
      className="annotation"
      points={polygonPoints}
      stroke="black"
      strokeWidth="3px"
      fill={color}
      fillOpacity="0.3" />

  );

}

export {
  Annotation
};
