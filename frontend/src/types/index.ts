// src/types/index.ts

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  blood_type?: string;
  is_verified: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export interface Doctor {
  id: string;
  user_name: string;
  specialization_name: string;
  hospital_name: string;
  consultation_price: string;
  rating: string;
  experience_years: number;
  is_available: boolean;
}

export interface Specialization {
  id: number;
  name: string;
  name_uz: string;
  description: string;
  icon: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'public' | 'private';
  address: string;
  city: string;
  phone: string;
  rating: string;
  is_24_7: boolean;
  has_emergency: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  form: string;
  strength: string;
  description: string;
  lowest_price: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  phone: string;
  is_24_7: boolean;
  rating: string;
}

export interface AIAnalysisRequest {
  symptoms: string;
  age?: number;
  gender?: 'male' | 'female';
  medical_history?: string[];
}

export interface AIAnalysisResponse {
  id: string;
  symptoms: string;
  possible_conditions: Array<{
    name: string;
    probability: number;
    key_symptoms: string[];
    description: string;
  }>;
  urgency: {
    level: number;
    category: 'routine' | 'urgent' | 'emergency';
    message: string;
    color: string;
  };
  recommended_specialist: {
    type: string;
    reason: string;
  };
  first_aid: string[];
  warnings: string[];
  tests_needed?: string[];
  created_at: string;
}

export interface Appointment {
  id: string;
  patient: User;
  doctor: Doctor;
  appointment_date: string;
  appointment_time: string;
  queue_number: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  symptoms: string;
  notes?: string;
}