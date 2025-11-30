// src/api/appointments.ts
import apiClient from './client';
import type { Appointment } from '../types';

interface CreateAppointmentData {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
}

export const appointmentsApi = {
  // Create appointment
  createAppointment: async (data: CreateAppointmentData): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>('/api/appointments/', data);
    return response.data;
  },

  // Get my appointments
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<{ results: Appointment[] }>('/api/appointments/');
    return response.data.results;
  },

  // Get upcoming appointments
  getUpcoming: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/api/appointments/upcoming/');
    return response.data;
  },

  // Get appointment history
  getHistory: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/api/appointments/history/');
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/appointments/${id}/`);
  },
};