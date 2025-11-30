// src/api/client.ts
import axios from 'axios';

// Backend URL:
// - productionda: window.location.origin (ya'ni https://healthhub-uz-1.onrender.com)
// - agar xohlasang, .env orqali ham berish mumkin
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || window.location.origin;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - har bir so'rovga token qo'shish
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

// Response interceptor - xatolarni boshqarish
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
