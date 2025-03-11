import api from './api.service';
import { Reservation } from '../types/reservation.types';
import { CreateReservationI, UpdateReservationI } from '../types/reservation.types';

class ReservationService {
  private readonly baseUrl = '/reservations';

  async getAll(): Promise<Reservation[]> {
    try {
      const response = await api.get(this.baseUrl);
      return response.data?.data?.data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  async getOne(id: string): Promise<Reservation> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateReservationI): Promise<Reservation> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateReservationI): Promise<Reservation> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async getByAutomobile(automobileId: string): Promise<Reservation[]> {
    try {
      const response = await api.get(`${this.baseUrl}/automobile/${automobileId}`);
      return response.data?.data?.data || [];
    } catch (error) {
      console.error('Error fetching reservations by automobile:', error);
      return [];
    }
  }

  async getByClient(clientId: string, status?: string): Promise<Reservation[]> {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`${this.baseUrl}/client/${clientId}${query}`);
    return response.data;
  }

  async getByCategory(categoryId: string, status?: string): Promise<Reservation[]> {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`${this.baseUrl}/category/${categoryId}${query}`);
    return response.data;
  }

  async cancel(id: string, reason: string): Promise<Reservation> {
    const response = await api.put(`${this.baseUrl}/${id}/cancel`, { reason });
    return response.data;
  }

  async confirm(id: string): Promise<Reservation> {
    const response = await api.put(`${this.baseUrl}/${id}/confirm`, {});
    return response.data;
  }

  async complete(id: string): Promise<Reservation> {
    const response = await api.put(`${this.baseUrl}/${id}/complete`, {});
    return response.data;
  }

  async setPending(id: string): Promise<Reservation> {
    const response = await api.put(`${this.baseUrl}/${id}/pending`, {});
    return response.data;
  }
}

export const reservationService = new ReservationService(); 