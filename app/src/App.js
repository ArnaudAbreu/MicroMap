import React, { useState, useEffect } from 'react';
import './App.css';
import { AnnotViewer } from './AnnotViewer';
import { WSIAPI, getSlide, getSlides } from "./WSI";
import { FileNav } from './Tree';
import {
  AnnotationAPI,
  getLayer,
  getLayers,
  createLayerGetter,
  createSlideSetter,
  setLayer,
  createSlideRemover
} from "./ANNOT";


function App() {

  const x = 1200;
  const y = 800;
  const [selectedSrvImage, setSelectedSrvImage] = useState();
  const [annotLayers, setAnnotLayers] = useState([]);
  const [foundAnnotations, setFoundAnnotations] = useState(false);
  const [slideName, setSlideName] = useState("");
  const [slidePath, setSlidePath] = useState("");

  const getSrvImage = async (slidepath, slidename) => {
    const response = await getSlide(slidepath, slidename);
    let srv_slide_info = await response.data;
    const annotresponse = await getLayers(slidepath, slidename);
    let srv_annot_layers = await annotresponse.data;
    // console.log("annot_layers: ", srv_annot_layers)
    setSlidePath(slidepath);
    setSelectedSrvImage(srv_slide_info);
    setAnnotLayers(srv_annot_layers);
    setFoundAnnotations(true);
    setSlideName(slidename);
  }

  useEffect(() => {
    console.log("Debug App: ");
    console.log("-----------");
    console.log("Annotation layers: ", annotLayers);
    console.log("-----------\n\n");
  });

  const layerGetter = (path, name) => {
    return ((lb) => {
      return getLayer(path, name, lb)
    })
  }


  return (
    <div className="App" style={{ display: "flex", justifyContent:'space-between' }}>
      <div>
        <AnnotViewer img={selectedSrvImage}
                     x={x}
                     y={y}
                     annots={annotLayers}
                     foundAnnots={foundAnnotations}
                     resetSlide={getSrvImage}
                     layergetter={layerGetter(slidePath, slideName)}
                     annotSetter={createSlideSetter(slidePath, slideName)}
                     annotRemover={createSlideRemover(slidePath, slideName)}
                     />
      </div>
    </div>
  );
}

export default App;
