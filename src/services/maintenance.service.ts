import api from './api.service';
import { Maintenance, MaintenanceType } from '../types/maintenance.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T;
    statusCode: number;
    timestamp: string;
  };
}

export const maintenanceService = {
  getAll: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances');
    return response.data.data.data;
  },

  getOne: async (id: string): Promise<Maintenance> => {
    const response = await api.get<ApiResponse<Maintenance>>(`/maintenances/${id}`);
    return response.data.data.data;
  },

  create: async (formData: FormData): Promise<Maintenance> => {
    const response = await api.post<ApiResponse<Maintenance>>('/maintenances', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.data;
  },

  update: async (id: string, formData: FormData): Promise<Maintenance> => {
    try {
      const response = await api.put<ApiResponse<Maintenance>>(`/maintenances/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.data;
    } catch (error) {
      console.error('Error updating maintenance:', error.response?.data);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenances/${id}`);
  },

  getByAutomobile: async (automobileId: string): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>(`/maintenances/automobile/${automobileId}`);
    return response.data.data.data;
  },

  getDueMaintenances: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances/due');
    return response.data.data.data;
  },

  getUpcomingMaintenances: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances/upcoming');
    return response.data.data.data;
  },

  getMaintenanceStats: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/maintenances/stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data.data;
  },

  getApplicableMaintenanceTypes: async (automobileId: string): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/maintenances/applicable-types/${automobileId}`);
    return response.data.data.data;
  },

  suggestMaintenanceSchedule: async (automobileId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/maintenances/suggest-schedule/${automobileId}`);
    return response.data.data.data;
  }
};