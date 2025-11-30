// src/api/ai.ts
import apiClient from './client';
import type { AIAnalysisRequest, AIAnalysisResponse } from '../types';

export const aiApi = {
  // Analyze symptoms
  analyzeSymptoms: async (data: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    const response = await apiClient.post<AIAnalysisResponse>(
      '/api/ai/consultations/analyze_symptoms/',
      data
    );
    return response.data;
  },

  // Get recent consultations
  getRecentConsultations: async (): Promise<AIAnalysisResponse[]> => {
    const response = await apiClient.get<AIAnalysisResponse[]>('/api/ai/consultations/recent/');
    return response.data;
  },
};