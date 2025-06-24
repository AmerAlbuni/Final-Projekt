import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5080/api',
  withCredentials: true,
});

// ✅ Automatically attach token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use AuthContext if needed
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
