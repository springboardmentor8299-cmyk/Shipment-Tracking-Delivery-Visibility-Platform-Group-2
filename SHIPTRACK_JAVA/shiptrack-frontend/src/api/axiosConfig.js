import axios from "axios";

const api = axios.create({
  baseURL: "https://shiptrack-backend-tiul.onrender.com/api",
});

export default api;
