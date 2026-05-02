import axios from 'axios';

export const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pasobet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // Devolver la respuesta completa para que los callers accedan a .data.success
  (error) => {
    return Promise.reject(
      error.response?.data || { success: false, message: 'Error de red. Intenta más tarde.' }
    );
  }
);

export default api;

