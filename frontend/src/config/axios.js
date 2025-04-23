import axios from 'axios';

export const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://instagram-by-ranveer-0yvp.onrender.com/api" 
  : "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure CORS credentials are properly handled
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('CORS or Network Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
