import React, { useState, useEffect } from 'react';
import './App.css';
import { AnnotViewer } from './AnnotViewer';
import { getSlide } from "./WSI";
import {
  getLayer,
  getLayers,
  createSlideSetter,
  createSlideRemover
} from "./ANNOT";
import { getCohort } from "./DATA";



function App() {

  const viewer_ratio = 60;
  const [isInit, setIsInit] = useState(false);
  const [cohort, setCohort] = useState();
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

  const getCohortCsv = async () => {
    const response = await getCohort();
    let csvData = await response.data;
    setCohort(csvData);
    console.log("requested csv: ", csvData);
  }

  useEffect(() => {
    if (isInit === false){
      getCohortCsv();
      setIsInit(true);
    }
    // console.log("Debug App: ");
    // console.log("-----------");
    // console.log("Annotation layers: ", annotLayers);
    // console.log("-----------\n\n");
  });

  const layerGetter = (path, name) => {
    return ((lb) => {
      return getLayer(path, name, lb)
    })
  }


  return (
    <div className="App" style={{ display: "flex", justifyContent:'space-between' }}>
        <AnnotViewer img={selectedSrvImage}
                     ratio={viewer_ratio}
                     annots={annotLayers}
                     foundAnnots={foundAnnotations}
                     resetSlide={getSrvImage}
                     layergetter={layerGetter(slidePath, slideName)}
                     annotSetter={createSlideSetter(slidePath, slideName)}
                     annotRemover={createSlideRemover(slidePath, slideName)}
                     cohortGetter={cohort}
                     />
    </div>
  );
}

export default App;
