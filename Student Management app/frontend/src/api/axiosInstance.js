import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to server. Check if the backend is running.';
    } else if (error.response?.status === 0 || error.message?.includes('CORS')) {
      error.message = 'CORS error: Backend is not allowing requests from this origin.';
    }
    return Promise.reject(error);
  }
);

export default api;
