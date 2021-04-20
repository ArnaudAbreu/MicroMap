import axios from "axios";

const WSI_URL = "http://"+process.env.REACT_APP_FLASK_SERVER_IP + ":" + process.env.REACT_APP_FLASK_SERVER_PORT;
console.log("WSI API running at: ", WSI_URL);

const WSIAPI = axios.create({
  baseURL: WSI_URL,
  responseType: "json",
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
});

const NavAPI = axios.create({
  baseURL: WSI_URL,
  responseType: "json"
});

const getSlides = () => {
  return WSIAPI.get("/slides")
}

// const getSlide = (slidename) => {
//   return WSIAPI.get("/slides/" + slidename)
// }

const getFiles = (path) => {
  const p = {path: path};
  return NavAPI.post("/nav/", p)
}

const getSlide = (slidepath, slidename) => {
  const p = {path: slidepath};
  return WSIAPI.post("/slides/" + slidename, p);
}

export {
  WSIAPI,
  NavAPI,
  getSlides,
  getSlide,
  getFiles
}
