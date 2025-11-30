import apiClient from './client';

export const doctorsApi = {
  // Shifokorlar
  getDoctors: async (params?: any) => {
    const response = await apiClient.get('/api/doctors/', { params });
    return response.data.results || response.data;
  },

  getDoctor: async (id: string) => {
    const response = await apiClient.get(`/api/doctors/${id}/`);
    return response.data;
  },

  // Mutaxassisliklar - TO'G'RI URL
  getSpecializations: async () => {
    const response = await apiClient.get('/api/doctors/specializations/');
    return response.data.results || response.data;
  },

  // Shifoxonalar
  getHospitals: async () => {
    const response = await apiClient.get('/api/doctors/hospitals/');
    return response.data.results || response.data;
  },

  // Bo'sh vaqtlar
  getAvailableSlots: async (doctorId: string, date: string) => {
    const response = await apiClient.get(`/api/doctors/${doctorId}/available_slots/`, {
      params: { date }
    });
    return response.data;
  },
};