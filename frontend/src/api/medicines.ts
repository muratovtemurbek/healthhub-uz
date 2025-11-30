// src/api/medicines.ts
import apiClient from './client';
import type { Medicine } from '../types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const medicinesApi = {
  // Get all medicines
  getMedicines: async (search?: string): Promise<Medicine[]> => {
    const response = await apiClient.get<PaginatedResponse<Medicine>>('/api/medicines/', {
      params: { search }
    });
    return response.data.results;
  },

  // Get medicine prices (comparison)
  getMedicinePrices: async (medicineId: string) => {
    const response = await apiClient.get(`/api/medicines/${medicineId}/prices/`);
    return response.data;
  },

  // Get nearby pharmacies
  getNearbyPharmacies: async (latitude: number, longitude: number) => {
    const response = await apiClient.get('/api/pharmacies/nearby/', {
      params: { latitude, longitude }
    });
    return response.data;
  },
};