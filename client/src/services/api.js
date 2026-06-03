import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', // Uses env var in prod, fallback to local
  timeout: 15000, // Timeout after 15 seconds to handle cold starts
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      // If we are already on the admin page, reload to show login screen
      if (window.location.pathname.includes('/admin')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
