import axios from "axios";
import { parseCookies } from "nookies";
import * as AxiosLogger from 'axios-logger';


const apiClient = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(AxiosLogger.requestLogger);


apiClient.interceptors.request.use(
  (config) => {
    const cookies = parseCookies(); 
    const token = cookies.token; 

    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
