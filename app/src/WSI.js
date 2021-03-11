import axios from "axios";

const WSIAPI = axios.create({
  baseURL: "http://127.0.0.1:5000/",
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
