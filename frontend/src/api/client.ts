// src/api/client.ts
import axios from 'axios';

// 🔧 Backend URL ni moslashuvchan qilamiz:
//
// 1) Agar VITE_API_URL berilgan bo'lsa – o'shani olamiz
// 2) Aks holda, agar frontend localhost'da bo'lsa – http://localhost:8000
// 3) Aks holda (Render, prod) – window.location.origin (masalan https://healthhub-uz-1.onrender.com)
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : window.location.origin);

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
    console.error('📥 Response error:', error.response?.status, error.config?.url);

    if (error.response?.status === 401) {
      console.log('🔒 Token expired, clearing storage');
      localStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
