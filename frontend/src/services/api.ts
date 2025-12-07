// src/services/api.ts - TO'LIQ ISHLAYDIGAN VERSIYA
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token yangilash
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ============== AUTH ==============
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login/', data),

  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => api.post('/auth/register/', data),

  logout: () => api.post('/auth/logout/'),
  getMe: () => api.get('/auth/me/'),
  updateProfile: (data: any) => api.patch('/auth/me/', data),
};

// ============== DOCTORS (PUBLIC) ==============
export const doctorsApi = {
  getAll: (params?: {
    specialization?: string;
    search?: string;
    min_rating?: number;
    hospital?: string;
  }) => api.get('/doctors/list/', { params }),

  getById: (id: string) => api.get(`/doctors/list/${id}/`),

  getAvailableSlots: (id: string, date: string) =>
    api.get(`/doctors/list/${id}/available_slots/`, { params: { date } }),

  getSpecializations: () => api.get('/doctors/specializations/'),
};

// ============== APPOINTMENTS ==============
export const appointmentsApi = {
  getAll: (params?: { status?: string; date?: string }) =>
    api.get('/appointments/', { params }),

  getById: (id: string) => api.get(`/appointments/${id}/`),

  create: (data: {
    doctor: string;
    date: string;
    time: string;
    reason?: string;
    symptoms?: string;
  }) => api.post('/appointments/', data),

  cancel: (id: string) => api.post(`/appointments/${id}/cancel/`),
};