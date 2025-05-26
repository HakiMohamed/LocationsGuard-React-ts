import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as statsService from '../services/stats.service';

interface StatsContextType {
  expensesStats: any;
  reservationsStats: any;
  automobilesStats: any;
  clientsStats: any;
  fetchExpensesStats: (params?: { startDate?: string; endDate?: string; period?: string }) => Promise<void>;
  fetchReservationStats: (params?: { startDate?: string; endDate?: string; period?: string }) => Promise<void>;
  fetchAutomobileStats: (params?: { startDate?: string; endDate?: string; period?: string }) => Promise<void>;
  fetchClientStats: (params?: { startDate?: string; endDate?: string; period?: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [expensesStats, setExpensesStats] = useState<any>(null);
  const [reservationsStats, setReservationsStats] = useState<any>(null);
  const [automobilesStats, setAutomobilesStats] = useState<any>(null);
  const [clientsStats, setClientsStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpensesStats = useCallback(async (params?: { startDate?: string; endDate?: string; period?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getExpensesStats(params);
      setExpensesStats(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques de dépenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservationStats = useCallback(async (params?: { startDate?: string; endDate?: string; period?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getReservationStats(params);
      setReservationsStats(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques de réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAutomobileStats = useCallback(async (params?: { startDate?: string; endDate?: string; period?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getAutomobileStats(params);
      setAutomobilesStats(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques automobiles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientStats = useCallback(async (params?: { startDate?: string; endDate?: string; period?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getClientStats(params);
      setClientsStats(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques clients');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <StatsContext.Provider value={{
      expensesStats,
      reservationsStats,
      automobilesStats,
      clientsStats,
      fetchExpensesStats,
      fetchReservationStats,
      fetchAutomobileStats,
      fetchClientStats,
      loading,
      error
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) throw new Error('useStats must be used within a StatsProvider');
  return context;
}; 