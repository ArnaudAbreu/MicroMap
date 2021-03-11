import axios from "axios";

const ANNOT_URL = process.env.REACT_APP_ANNOT_SERVER_URL;

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
  return AnnotationAPI.get("/layer/" + slidename + "/" + layername);
}

const createLayerGetter = (slidename) => {
  return ((layername) => {getLayer(slidename, layername)})
}

const createShapeGetter = (getter, layername) => {
  return (() => {getter(layername)})
}

const setLayer = (slidename, layername, shape) => {
  const annotation = {annotation:{points: shape,
                                  text: "machin",
                                  creator: "arnaud"}}
  return AnnotationAPI.post("/annotation/" + slidename + "/" + layername, annotation);
}

const createSlideSetter = (slidename) => {
  return ((layername, shape) => {setLayer(slidename, layername, shape)});
}

const createLayerSetter = (setter, layername) => {
  return ((shape) => {setter(layername, shape)})
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
  createLayerSetter
};
