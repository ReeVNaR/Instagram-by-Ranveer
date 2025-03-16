import axios from 'axios';

export const API_URL = "https://instagram-by-ranveer.onrender.com/api"; // Updated to include /api path

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
