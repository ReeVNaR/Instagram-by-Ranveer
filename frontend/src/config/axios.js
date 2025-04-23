import axios from 'axios';

export const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://instagram-by-reevnar.onrender.com" 
  : "http://localhost:5000/api";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
