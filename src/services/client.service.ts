import api from './api.service';
import { Client, UpdateReservationPossibilityDto } from '../types/client.types';

interface ApiResponse<T> {
  data: {
    data: T;
    statusCode: number;
    timestamp: string;
  };
  status: number;
  statusText: string;
}

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    try {
      const response = await api.get<ApiResponse<Client[]>>('/clients');
      console.log('Response:', response);
      // La structure est response.data.data
      const clients = response.data.data;
      console.log('Clients data:', clients);
      return clients || []; // Retourne le tableau de clients ou un tableau vide
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getOne: async (id: string): Promise<Client> => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  create: async (formData: FormData): Promise<Client> => {
    // Convertir FormData en objet JSON
    const jsonData = Object.fromEntries(formData.entries());
    
    console.log('Data being sent to API:', jsonData); 

    const response = await api.post<ApiResponse<Client>>('/clients', jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  update: async (id: string, formData: FormData): Promise<Client> => {
    const jsonData = Object.fromEntries(formData.entries());
    
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  updateReservationPossibility: async (id: string, data: UpdateReservationPossibilityDto): Promise<Client> => {
    const response = await api.patch<ApiResponse<Client>>(`/clients/${id}/reservationPoussibilite`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
}; 