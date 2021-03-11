import OpenSeaDragon from "openseadragon";
import OpenSeadragon from "openseadragon";
import { Overlay } from "./Overlay"
import React, {
  useEffect,
  useState
} from "react";



const OpenSeaDragonViewer = ({image, x, y, overlay, drawing, layers, isNone, layergetter, annotSetter}) => {

  const [hasViewer, setHasViewer] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [overlayPos, setOverlayPos] = useState(null);

  useEffect(() => {
    if (image && viewer) {
      viewer.open(image.source);
      setHasViewer(true);
    }
  }, [image]);

  const openHandler = (evt) => {
    let tile = evt.eventSource.world.getItemAt(0);
    const imageOrigin = tile.imageToViewerElementCoordinates(new OpenSeadragon.Point(0, 0));
    const imageSize = tile.imageToViewerElementCoordinates(tile.getContentSize());
    const st = {
      position: 'absolute',
      display: 'block',
      left: imageOrigin.x,
      top: imageOrigin.y,
      width: imageSize.x - imageOrigin.x,
      height: imageSize.y - imageOrigin.y,
    };
    setOverlayPos(st);
  }

  const animationHandler = (evt) => {
    let tile = evt.eventSource.world.getItemAt(0);
    const imageOrigin = tile.imageToViewerElementCoordinates(new OpenSeadragon.Point(0, 0));
    const imageSize = tile.imageToViewerElementCoordinates(tile.getContentSize());
    const st = {
      position: 'absolute',
      display: 'block',
      left: imageOrigin.x,
      top: imageOrigin.y,
      width: imageSize.x - imageOrigin.x,
      height: imageSize.y - imageOrigin.y,
    };
    // console.log("img content dimensions: ", st);
    setOverlayPos(st);
  }

  const InitOpenseadragon = () => {
    viewer && viewer.destroy();
    const v = OpenSeaDragon({
                id: "openSeaDragon",
                prefixUrl: process.env.PUBLIC_URL,
                showNavigator: true,
                showRotationControl: false,
                navigatorPosition: "BOTTOM_RIGHT",
                animationTime: 0.5,
                blendTime: 0.1,
                constrainDuringPan: true,
                maxZoomPixelRatio: 2,
                minZoomLevel: 1,
                visibilityRatio: 1,
                zoomPerScroll: 2,
                timeout: 120000,
              })
    v.addHandler('open', openHandler);
    v.addHandler('animation', animationHandler);

    setViewer(v);
  };

  useEffect(() => {
    InitOpenseadragon();
    return () => {
      viewer && viewer.destroy();
    };
  }, []);

  const fmt = (dim) => {
    return (dim.toString() + "px");
  }

  return (
    <div style={{position: "relative", height: fmt(y), width: fmt(x), overflow: "hidden"}}>
      <div id="openSeaDragon" className = "viewer"
        style={{height: "100%", width: "100%"}} >
      </div>
      {hasViewer ? <Overlay
                    id="overlay"
                    hasposition={overlayPos}
                    isVisible={overlay}
                    isDrawing={drawing}
                    layers={layers}
                    layergetter={layergetter}
                    annotSetter={annotSetter}/> : null}
    </div>
  );
}

export {
  OpenSeaDragonViewer
};
