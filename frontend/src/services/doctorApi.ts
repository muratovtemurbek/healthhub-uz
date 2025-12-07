// src/services/doctorApi.ts - TO'LIQ ISHLAYDIGAN VERSIYA
import api from './api';

// ============== DOCTOR PROFILE ==============
export const doctorApi = {
  // O'z ma'lumotlarini olish
  getMe: () => api.get('/doctors/me/'),

  // Profilni yangilash
  updateProfile: (data: DoctorProfileUpdate) =>
    api.patch('/doctors/me/update/', data),

  // Dashboard statistikasi
  getDashboardStats: () => api.get('/doctors/me/stats/'),

  // Bugungi jadval
  getTodaySchedule: () => api.get('/doctors/me/today/'),

  // So'nggi bemorlar
  getRecentPatients: () => api.get('/doctors/me/recent-patients/'),
};

// ============== APPOINTMENTS ==============
export const doctorAppointmentsApi = {
  // Qabullar ro'yxati
  getAll: (params?: {
    date?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => api.get('/doctors/my-appointments/', { params }),

  // Bitta qabul
  getById: (id: string) => api.get(`/doctors/my-appointments/${id}/`),

  // Tasdiqlash
  confirm: (id: string) => api.post(`/doctors/my-appointments/${id}/confirm/`),

  // Yakunlash
  complete: (id: string, data: {
    diagnosis?: string;
    description?: string;
    medications?: any[];
    instructions?: string;
    notes?: string;
  }) => api.post(`/doctors/my-appointments/${id}/complete/`, data),

  // Bekor qilish
  cancel: (id: string, reason?: string) =>
    api.post(`/doctors/my-appointments/${id}/cancel/`, { reason }),
};

// ============== PATIENTS ==============
export const doctorPatientsApi = {
  // Bemorlar ro'yxati
  getAll: (params?: { search?: string }) =>
    api.get('/doctors/my-patients/', { params }),

  // Bemor tafsilotlari
  getById: (id: string) => api.get(`/doctors/my-patients/${id}/`),
};

// ============== SCHEDULE ==============
export const doctorScheduleApi = {
  // Jadval olish
  get: () => api.get('/doctors/my-schedule/'),

  // Jadvalni yangilash
  update: (data: ScheduleUpdate) => api.put('/doctors/my-schedule/update/', data),
};

// ============== MEDICAL RECORDS ==============
export const doctorRecordsApi = {
  // Yozuvlar ro'yxati
  getAll: (params?: { type?: string; search?: string }) =>
    api.get('/doctors/my-records/', { params }),

  // Yangi yozuv
  create: (data: {
    patient_id: string;
    record_type: string;
    title: string;
    description?: string;
    vitals?: object;
    record_date?: string;
  }) => api.post('/doctors/my-records/create/', data),
};

// ============== REVIEWS ==============
export const doctorReviewsApi = {
  getAll: () => api.get('/doctors/my-reviews/'),
};

// ============== TYPES ==============
export interface DoctorStats {
  today_appointments: number;
  today_completed: number;
  today_pending: number;
  today_cancelled: number;
  total_patients: number;
  monthly_income: number;
  rating: number;
  total_reviews: number;
}

export interface DoctorProfile {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  specialization_id: number;
  hospital: string;
  hospital_id: string;
  experience_years: number;
  education: string;
  bio: string;
  rating: number;
  total_reviews: number;
  consultation_price: number;
  is_available: boolean;
  avatar: string | null;
  languages: string[];
  license_number: string;
}

export interface DoctorProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  education?: string;
  consultation_price?: number;
  is_available?: boolean;
  languages?: string[];
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient_name: string;
  patient_phone: string;
  patient_avatar: string | null;
  reason: string;
  symptoms: string | null;
  status: AppointmentStatus;
  is_paid: boolean;
}

export interface DoctorAppointment {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_age: number | null;
  patient_avatar: string | null;
  date: string;
  time: string;
  reason: string;
  symptoms: string | null;
  notes: string | null;
  status: AppointmentStatus;
  is_paid: boolean;
  payment_amount: number | null;
}

export interface AppointmentDetail extends DoctorAppointment {
  patient: {
    id: string | null;
    name: string;
    phone: string;
    email: string;
    birth_date: string | null;
    gender: string;
    blood_type: string;
    allergies: string[];
    chronic_diseases: string[];
  } | null;
  patient_history: {
    date: string;
    reason: string;
    status: AppointmentStatus;
  }[];
}

export interface DoctorPatient {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number | null;
  gender: string;
  blood_type: string;
  avatar: string | null;
  total_visits: number;
  last_visit: string | null;
}

export interface PatientDetail extends DoctorPatient {
  birth_date: string | null;
  address: string;
  allergies: string[];
  chronic_diseases: string[];
  emergency_contact: string;
  visits: {
    id: string;
    date: string;
    time: string;
    reason: string;
    status: AppointmentStatus;
  }[];
  medical_records: {
    id: string;
    date: string;
    type: string;
    title: string;
  }[];
}

export interface DoctorScheduleDay {
  day: string;
  day_name: string;
  day_index: number;
  start: string;
  end: string;
  is_working: boolean;
}

export interface ScheduleUpdate {
  monday?: { is_working: boolean; start?: string; end?: string };
  tuesday?: { is_working: boolean; start?: string; end?: string };
  wednesday?: { is_working: boolean; start?: string; end?: string };
  thursday?: { is_working: boolean; start?: string; end?: string };
  friday?: { is_working: boolean; start?: string; end?: string };
  saturday?: { is_working: boolean; start?: string; end?: string };
  sunday?: { is_working: boolean; start?: string; end?: string };
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  record_type: string;
  title: string;
  description: string;
  record_date: string;
  created_at: string;
}

export interface DoctorReview {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface RecentPatient {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  last_visit: string;
  last_diagnosis: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';