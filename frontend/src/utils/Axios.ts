import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials : true
});

// Optional: Add a request interceptor (e.g. to add auth tokens)
api.interceptors.request.use(
  (config) => {
    // Example of adding a token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add a response interceptor (e.g. for global error handling)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle or log error globally here.
//     return Promise.reject(error);
//   }
// );

export default api;
