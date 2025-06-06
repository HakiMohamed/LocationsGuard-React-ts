import React, { createContext, useContext, useState, useCallback } from 'react';
import { reservationService } from '../services/reservation.service';
import { Reservation, ReservationStatus } from '../types/reservation.types';
import { CreateReservationI, UpdateReservationI } from '../types/reservation.types';

interface ReservationContextType {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  fetchReservations: () => Promise<void>;
  createReservation: (data: CreateReservationI) => Promise<void>;
  updateReservation: (id: string, data: UpdateReservationI) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  getReservationsByAutomobile: (automobileId: string) => Promise<Reservation[]>;
  getReservationsByClient: (clientId: string, status?: string) => Promise<Reservation[]>;
  getReservationsByCategory: (categoryId: string, status?: string) => Promise<Reservation[]>;
  cancelReservation: (id: string, reason: string) => Promise<void>;
  confirmReservation: (id: string) => Promise<void>;
  completeReservation: (id: string) => Promise<void>;
  setPendingReservation: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  setPaymentStatus: (id: string, isPaid: boolean) => Promise<void>;
  getClientReservationCount: (clientId: string) => Promise<number>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data: CreateReservationI) => {
    setLoading(true);
    try {
      const newReservation = await reservationService.create(data);
      setReservations(prev => [...prev, newReservation]);
      setError(null);
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id: string, data: UpdateReservationI) => {
    setLoading(true);
    console.log(data);
    try {
      const updatedReservation = await reservationService.update(id, data);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
      setError(null);
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await reservationService.delete(id);
      setReservations(prev => prev.filter(reservation => reservation._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservationsByAutomobile = async (automobileId: string) => {
    return await reservationService.getByAutomobile(automobileId);
  };

  const getReservationsByClient = useCallback(async (clientId: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      return await reservationService.getByClient(clientId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservationsByCategory = useCallback(async (categoryId: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      return await reservationService.getByCategory(categoryId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.cancel(id, reason);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || "Une erreur est survenue lors de l'annulation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.confirm(id);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la confirmation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.complete(id);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la finalisation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservationStatus = useCallback(async (id: string, status: ReservationStatus) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.updateStatus(id, status);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la mise à jour du statut');
      throw err;
    } finally { 
      setLoading(false);
    }
  }, []);

  const setPendingReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.setPending(id);
      setReservations(prev => 
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la mise en attente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPaymentStatus = useCallback(async (id: string, isPaid: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReservation = await reservationService.updatePaymentStatus(id, isPaid);
      setReservations(prev =>
        prev.map(reservation => reservation._id === id ? updatedReservation : reservation)
      );
    } catch (err: any) {
      const backendErrorMessage = err.response?.data?.error?.message;
      setError(backendErrorMessage || err.message || 'Une erreur est survenue lors de la mise à jour du statut de paiement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClientReservationCount = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await reservationService.getClientReservationCount(clientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    reservations,
    loading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsByAutomobile,
    getReservationsByClient,
    getReservationsByCategory,
    cancelReservation,
    confirmReservation,
    completeReservation,
    setPendingReservation,
    updateReservationStatus,
    setPaymentStatus,
    getClientReservationCount,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}; 