import { Client } from './client.types';
import { Automobile } from './automobile.types';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Reservation {
  _id: string;
  client: Client;
  automobile: Automobile;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: ReservationStatus;
  notes?: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
  paymentDate?: Date;
  cancellationReason?: string;
  category?: string;
} 

export interface CreateReservationI {
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  client: string;
  automobile: string;
  notes?: string;
  isPaid?: boolean;
} 
  



export interface UpdateReservationI {
  startDate?: string;
  endDate?: string;
  status?: ReservationStatus;
  client?: string;
  automobile?: string;
  notes?: string;
  isPaid?: boolean;
}