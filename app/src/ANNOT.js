import axios from "axios";

const ANNOT_URL = process.env.REACT_APP_FLASK_SERVER_IP + ":" + process.env.REACT_APP_FLASK_SERVER_PORT;

const AnnotationAPI = axios.create({
  baseURL: ANNOT_URL,
  responseType: "json"
});

const getLayers = (slidename) => {
  return AnnotationAPI.get("/layers/" + slidename);
}

const createLayersGetter = (slidename) => {
  return (() => {getLayers(slidename)});
}

const getLayer = (slidename, layername) => {
  return AnnotationAPI.get("/layers/" + slidename + "/" + layername);
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

const setLayer = (slidename, layername, shape) => {
  const annotation = {annotation: shape};
  return AnnotationAPI.post("/annotations/" + slidename + "/" + layername, annotation);
}

const createSlideSetter = (slidename) => {
  return ((layername, shape) => {setLayer(slidename, layername, shape)});
}

const createLayerSetter = (setter, layername) => {
  return ((shape) => {setter(layername, shape)})
}

const removeFromLayer = (slidename, layername, shape) => {
  const annotation = {annotation: shape};
  return AnnotationAPI.delete("/annotations/" + slidename + "/" + layername, {data: annotation});
}

const createSlideRemover = (slidename) => {
  return ((layername, shape) => {removeFromLayer(slidename, layername, shape)});
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
