import axios from "axios";

const WSI_URL = "http://"+process.env.REACT_APP_FLASK_SERVER_IP + ":" + process.env.REACT_APP_FLASK_SERVER_PORT;
console.log("DATA API running at: ", WSI_URL);

const DATAAPI = axios.create({
  baseURL: WSI_URL,
  responseType: "json",
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
});

const getCohort = () => {
  return DATAAPI.get("/cohort");
}

export {
  getCohort
}
