import api from './api.service';
import { User, Device } from '../types/user.types';

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  city?: string;
  address?: string;
  drivingLicenseNumber?: string;
  drivingLicenseDate?: string;
  drivingLicenseExpirationDate?: string;
  drivingLicenseImage?: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  },

  getDevices: async (): Promise<{ devices: Device[]; total: number; active: number }> => {
    const response = await api.get<ApiResponse<{ devices: Device[]; total: number; active: number }>>('/auth/devices');
    return response.data.data;
  },

  updateProfile: async (formData: FormData): Promise<User> => {
    // Convertir FormData en objet JSON
    const jsonData: UpdateProfileData = {};
    formData.forEach((value, key) => {
      if (value !== null && value !== undefined && value !== '') {
        jsonData[key as keyof UpdateProfileData] = value.toString();
      }
    });

    console.log("Service - Données JSON à envoyer:", jsonData);

    const response = await api.put<ApiResponse<User>>('/users/profile', jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Service - Réponse du serveur:", response.data);
    return response.data.data;
  },

  deleteProfile: async (): Promise<void> => {
    await api.delete('/users/profile');
  },

  revokeDevice: async (deviceId: string): Promise<void> => {
    await api.delete(`/auth/devices/${deviceId}`);
  }
}; 