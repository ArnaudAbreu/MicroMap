import axios from "axios";

const ANNOT_URL = "http://"+process.env.REACT_APP_FLASK_SERVER_IP + ":" + process.env.REACT_APP_FLASK_SERVER_PORT;

const AnnotationAPI = axios.create({
  baseURL: ANNOT_URL,
  responseType: "json"
});

const getLayers = (slidepath, slidename) => {
  const p = {path: slidepath}
  return AnnotationAPI.post("/layers/" + slidename, p);
}

const createLayersGetter = (slidename) => {
  return (() => {getLayers(slidename)});
}

const getLayer = (slidepath, slidename, layername) => {
  const p = {path: slidepath}
  return AnnotationAPI.post("/layers/" + slidename + "/" + layername, p);
}

const createLayerGetter = (slidename) => {
  return ((layername) => {getLayer(slidename, layername)})
}

const createShapeGetter = (getter, layername) => {
  return (() => {getter(layername)})
}

// const setLayer = (slidename, layername, shape) => {
//   const annotation = {annotation:{points: shape,
//                                   text: "machin",
//                                   creator: "arnaud"}}
//   return AnnotationAPI.post("/annotation/" + slidename + "/" + layername, annotation);
// }

const setLayer = (slidepath, slidename, layername, shape) => {
  const annotation = {annotation: shape, path: slidepath};
  return AnnotationAPI.post("/annotations/" + slidename + "/" + layername, annotation);
}

const createSlideSetter = (slidepath, slidename) => {
  return ((layername, shape) => {setLayer(slidepath, slidename, layername, shape)});
}

const createLayerSetter = (setter, layername) => {
  return ((shape) => {setter(layername, shape)})
}

const removeFromLayer = (slidepath, slidename, layername, shape) => {
  const annotation = {annotation: shape, path: slidepath};
  return AnnotationAPI.delete("/annotations/" + slidename + "/" + layername, {data: annotation});
}

const createSlideRemover = (slidepath, slidename) => {
  return ((layername, shape) => {removeFromLayer(slidepath, slidename, layername, shape)});
}

const createLayerRemover = (remover, layername) => {
  return ((shape) => {remover(layername, shape)})
}


export {
  AnnotationAPI,
  getLayers,
  createLayersGetter,
  getLayer,
  createLayerGetter,
  createShapeGetter,
  setLayer,
  createSlideSetter,
  createLayerSetter,
  removeFromLayer,
  createSlideRemover,
  createLayerRemover
};
