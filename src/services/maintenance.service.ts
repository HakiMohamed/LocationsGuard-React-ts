import api from './api.service';
import { Maintenance } from '../types/maintenance.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface MaintenanceStats {
  totalCost: number;
  countByType: Record<string, number>;
  countByStatus: Record<string, number>;
}

interface MaintenanceType {
  type: string;
  recommendedInterval: number;
  lastMaintenanceDate?: Date;
}

interface MaintenanceSchedule {
  nextMaintenanceDate: Date;
  recommendedKilometers: number;
  type: string;
}

export interface CreateMaintenancePayload {
  automobile: string;
  type: string;
  description: string;
  date: string;
  cost?: number;
  technician?: string;
  notes?: string;
  client?: string;
}

export const maintenanceService = {
  getAll: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances');
    return response.data.data;
  },

  getOne: async (id: string): Promise<Maintenance> => {
    const response = await api.get<ApiResponse<Maintenance>>(`/maintenances/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMaintenancePayload): Promise<Maintenance> => {
    const response = await api.post<ApiResponse<Maintenance>>('/maintenances', data);
    return response.data.data;
  },

  update: async (id: string, data: CreateMaintenancePayload): Promise<Maintenance> => {
    const response = await api.put<ApiResponse<Maintenance>>(`/maintenances/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenances/${id}`);
  },

  getByAutomobile: async (automobileId: string): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>(`/maintenances/automobile/${automobileId}`);
    return response.data.data;
  },

  getMaintenanceAlerts: async (): Promise<unknown[]> => {
    const response = await api.get<ApiResponse<unknown[]>>('/maintenances/alerts/maintenance');
    return response.data.data;
  },

  getDueMaintenances: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances/due');
    return response.data.data;
  },

  getUpcomingMaintenances: async (): Promise<Maintenance[]> => {
    const response = await api.get<ApiResponse<Maintenance[]>>('/maintenances/upcoming');
    return response.data.data;
  },

  getMaintenanceStats: async (startDate: string, endDate: string): Promise<MaintenanceStats> => {
    const response = await api.get<ApiResponse<MaintenanceStats>>(`/maintenances/stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  getApplicableMaintenanceTypes: async (automobileId: string): Promise<MaintenanceType[]> => {
    const response = await api.get<ApiResponse<MaintenanceType[]>>(`/maintenances/applicable-types/${automobileId}`);
    return response.data.data;
  },

  suggestMaintenanceSchedule: async (automobileId: string): Promise<MaintenanceSchedule> => {
    const response = await api.get<ApiResponse<MaintenanceSchedule>>(`/maintenances/suggest-schedule/${automobileId}`);
    return response.data.data;
  },

  completeMaintenance: async (id: string, date?: string, mileage?: number): Promise<Maintenance> => {
    const response = await api.patch<ApiResponse<Maintenance>>(`/maintenances/${id}/complete`, { date, mileage });
    return response.data.data;
  }
};