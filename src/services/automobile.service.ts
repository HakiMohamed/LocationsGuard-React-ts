import api from './api.service';
import { Automobile, ReservationStats } from '../types/automobile.types';

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

interface CountResponse {
  data: {
    data: {
      count: number;
    };
    message: string;
    success: boolean;
    statusCode: number;
    timestamp: string;
  };
}



interface StatsResponse {
  data: {
    success: boolean;
    data: ReservationStats[];
  };
  statusCode: number;
  timestamp: string;
}

export const automobileService = {
  getAll: async (): Promise<Automobile[]> => {
    const response = await api.get<ApiResponse<Automobile[]>>('/automobiles');
    return response.data.data;
  },

  getOne: async (id: string): Promise<Automobile> => {
    const response = await api.get<ApiResponse<Automobile>>(`/automobiles/${id}`);
    return response.data.data;
  },

  create: async (formData: FormData): Promise<Automobile> => {
    const response = await api.post<ApiResponse<Automobile>>('/automobiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Created Automobile:', response.data.data);
    return response.data.data;
  },

  update: async (id: string, formData: FormData): Promise<Automobile> => {
    try {
      const response = await api.put<ApiResponse<Automobile>>(`/automobiles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating automobile:', error.response?.data);
      throw error; // Rethrow the error for further handling
    }
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/automobiles/${id}`);
  },

  updateAvailability: async (id: string, isAvailable: boolean): Promise<Automobile> => {
    const response = await api.put<ApiResponse<Automobile>>(`/automobiles/${id}/availability`, { isAvailable });
    return response.data.data;
  },

  getCountByCategory: async (categoryId: string): Promise<number> => {
    try {
      const response = await api.get<CountResponse>(`/automobiles/category/${categoryId}/count`);
      return response.data.data.data.count;
    } catch (error) {
      console.error('Error fetching category count:', error);
      return 0;
    }
  },

  getAutomobilesByCategory: async (categoryId: string): Promise<Automobile[]> => {
    const response = await api.get<ApiResponse<Automobile[]>>(`/automobiles/category/${categoryId}`);
    return response.data.data;
  },

  getMostReserved: async (limit: number): Promise<ReservationStats[]> => {
    const response = await api.get<StatsResponse>(`/automobiles/stats/most-reserved?limit=${limit}`);
    return response.data.data.data;
  },

  getLeastReserved: async (limit: number): Promise<ReservationStats[]> => {
    const response = await api.get<StatsResponse>(`/automobiles/stats/least-reserved?limit=${limit}`);
    return response.data.data.data;
  },
};