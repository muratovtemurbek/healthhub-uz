// src/services/adminApi.ts - TO'LIQ ISHLAYDIGAN VERSIYA
import api from './api';

// ============== DASHBOARD ==============
export const adminDashboardApi = {
  getStats: () => api.get('/admin-panel/dashboard/stats/'),
  getRecentActivity: () => api.get('/admin-panel/dashboard/activity/'),
  getTopDoctors: () => api.get('/admin-panel/dashboard/top-doctors/'),
};

// ============== DOCTORS ==============
export const adminDoctorsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get('/admin-panel/doctors/', { params }),

  getById: (id: string) => api.get(`/admin-panel/doctors/${id}/`),

  getStats: () => api.get('/admin-panel/doctors/stats/'),

  activate: (id: string) => api.post(`/admin-panel/doctors/${id}/activate/`),

  deactivate: (id: string) => api.post(`/admin-panel/doctors/${id}/deactivate/`),
};

// ============== PATIENTS ==============
export const adminPatientsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get('/admin-panel/patients/', { params }),

  getById: (id: string) => api.get(`/admin-panel/patients/${id}/`),

  getStats: () => api.get('/admin-panel/patients/stats/'),

  activate: (id: string) => api.post(`/admin-panel/patients/${id}/activate/`),

  deactivate: (id: string) => api.post(`/admin-panel/patients/${id}/deactivate/`),
};

// ============== APPOINTMENTS ==============
export const adminAppointmentsApi = {
  getAll: (params?: {
    status?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => api.get('/admin-panel/appointments/', { params }),

  getStats: () => api.get('/admin-panel/appointments/stats/'),

  confirm: (id: string) => api.post(`/admin-panel/appointments/${id}/confirm/`),

  cancel: (id: string) => api.post(`/admin-panel/appointments/${id}/cancel/`),
};

// ============== HOSPITALS ==============
export const adminHospitalsApi = {
  getAll: () => api.get('/admin-panel/hospitals/'),
};

// ============== SETTINGS ==============
export const adminSettingsApi = {
  get: () => api.get('/admin-panel/settings/'),
  update: (data: AdminSettingsUpdate) => api.put('/admin-panel/settings/update/', data),
};

// ============== TYPES ==============
export interface AdminDashboardStats {
  total_patients: number;
  new_patients_month: number;
  total_doctors: number;
  active_doctors: number;
  total_appointments: number;
  today_appointments: number;
  today_completed: number;
  today_pending: number;
  today_cancelled: number;
  week_appointments: number;
  month_appointments: number;
  total_revenue: number;
  month_revenue: number;
  today_revenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'appointment' | 'registration' | 'payment';
  title: string;
  description: string;
  time: string;
  status: string;
}

export interface TopDoctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string | null;
  patients: number;
  appointments: number;
  rating: number;
}

export interface AdminDoctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  specialization: string;
  hospital: string;
  experience: number;
  rating: number;
  patients_count: number;
  status: 'active' | 'inactive';
  joined: string;
}

export interface AdminDoctorDetail {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar: string | null;
  specialization: string;
  specialization_id: number;
  hospital: string;
  hospital_id: string;
  experience_years: number;
  education: string;
  bio: string;
  license_number: string;
  consultation_price: number;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  languages: string[];
  created_at: string;
}

export interface AdminDoctorsStats {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;
}

export interface AdminPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  age: number | null;
  gender: string;
  address: string;
  total_visits: number;
  last_visit: string | null;
  status: 'active' | 'inactive';
  registered: string;
}

export interface AdminPatientDetail {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar: string | null;
  age: number | null;
  birth_date: string | null;
  gender: string;
  blood_type: string;
  address: string;
  allergies: string[];
  chronic_diseases: string[];
  emergency_contact: string;
  is_active: boolean;
  is_verified: boolean;
  visits: {
    id: string;
    date: string;
    doctor: string;
    reason: string;
    status: string;
  }[];
  total_visits: number;
  registered: string;
}

export interface AdminPatientsStats {
  total: number;
  active: number;
  inactive: number;
  new_this_week: number;
  new_this_month: number;
}

export interface AdminAppointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  is_paid: boolean;
  payment_amount: number | null;
}

export interface AdminAppointmentsStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  today_total: number;
  today_completed: number;
  total_revenue: number;
}

export interface AdminHospital {
  id: string;
  name: string;
  type: string;
  type_display: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  is_24_7: boolean;
  has_emergency: boolean;
  doctors_count: number;
  image: string | null;
}

export interface AdminSettings {
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  working_hours: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  maintenance_mode: boolean;
}

export interface AdminSettingsUpdate {
  clinic_name?: string;
  clinic_email?: string;
  clinic_phone?: string;
  clinic_address?: string;
  working_hours?: string;
  language?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  maintenance_mode?: boolean;
}