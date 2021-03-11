import axios from "axios";

const WSI_URL = process.env.REACT_APP_SLIDE_SERVER_URL;

const WSIAPI = axios.create({
  baseURL: WSI_URL,
  responseType: "json"
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
