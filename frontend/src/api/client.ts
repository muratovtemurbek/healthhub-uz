// src/api/client.ts
import axios from 'axios';

// Development uchun localhost, production uchun Railway
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000/api'
  : (import.meta.env.VITE_API_URL || window.location.origin + '/api');

console.log('🌐 API_BASE_URL =', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('📤 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      '📥 Response error:',
      error.code || error.response?.status,
      error.config?.url
    );
    return Promise.reject(error);
  }
);

export default apiClient;
