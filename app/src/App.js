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

  const [srvSlideList, setSrvSlideList] = useState([]);
  const x = 1200;
  const y = 800;
  const [selectedSrvImage, setSelectedSrvImage] = useState();
  const [annotLayers, setAnnotLayers] = useState([]);
  const [foundAnnotations, setFoundAnnotations] = useState(false);
  const [slideName, setSlideName] = useState("");

  const getSrvSlides = async () => {
    const response = await getSlides();
    let srv_image = await response.data;
    setSrvSlideList(srv_image);
  }

  useEffect(() => {
    getSrvSlides();
  }, []);

  const getSrvImageInfo = async (slidename) => {
    const response = await getSlide(slidename);
    let srv_slide_info = await response.data;
    const annotresponse = await getLayers(slidename);
    let srv_annot_layers = await annotresponse.data;
    // console.log("annot_layers: ", srv_annot_layers)
    setSelectedSrvImage(srv_slide_info);
    setAnnotLayers(srv_annot_layers);
    setFoundAnnotations(true);
    setSlideName(slidename);
  }

  const selectSrvImageByName = (name) => {
    let selected = null;
    for (const s in srvSlideList) {
      if (srvSlideList[s] === name) {
        selected = srvSlideList[s];
      }
    }
    getSrvImageInfo(selected);
  }

  useEffect(() => {
    console.log("Debug App: ");
    console.log("-----------");
    console.log("Annotation layers: ", annotLayers);
    console.log("-----------\n\n");
  });

  const layerGetter = (name) => {
    return ((lb) => {
      return getLayer(name, lb)
    })
  }


  return (
    <div className="App" style={{ display: "flex", justifyContent:'space-between' }}>
      <div>
        <AnnotViewer img={selectedSrvImage}
                     x={x}
                     y={y}
                     slides={srvSlideList}
                     annots={annotLayers}
                     foundAnnots={foundAnnotations}
                     resetSlide={selectSrvImageByName}
                     layergetter={layerGetter(slideName)}
                     annotSetter={createSlideSetter(slideName)}
                     annotRemover={createSlideRemover(slideName)}
                     />
      </div>
    </div>
  );
}

export default App;
