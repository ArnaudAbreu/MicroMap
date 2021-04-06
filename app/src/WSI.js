import axios from "axios";

const WSI_URL = "http://"+process.env.REACT_APP_FLASK_SERVER_IP + ":" + process.env.REACT_APP_FLASK_SERVER_PORT;
console.log(WSI_URL);

const WSIAPI = axios.create({
  baseURL: WSI_URL,
  responseType: "json",
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
});

const getSlides = () => {
  return WSIAPI.get("/slides")
}

const getSlide = (slidename) => {
  return WSIAPI.get("/slides/" + slidename)
}

export {
  WSIAPI,
  getSlides,
  getSlide
}
