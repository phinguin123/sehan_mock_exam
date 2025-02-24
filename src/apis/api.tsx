import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL2,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default api;
