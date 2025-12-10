// src/api/client.ts
import axios from 'axios';

// API URL - production uchun window.location.origin ishlatamiz
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

console.log('🌐 API_BASE_URL =', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Token olish - bir necha joydan tekshirish
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('📤 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 xatosi va qayta urinilmagan bo'lsa - token yangilash
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh') || localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('access', newAccessToken);
          localStorage.setItem('access_token', newAccessToken);

          // Yangi token bilan qayta so'rov
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh ham ishlamasa - logout
          console.error('Token refresh failed, logging out');
          localStorage.removeItem('access');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    console.error(
      '📥 Response error:',
      error.response?.status || error.code,
      error.config?.url
    );
    return Promise.reject(error);
  }
);

export default apiClient;
