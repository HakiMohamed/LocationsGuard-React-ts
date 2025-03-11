import React, { createContext, useContext, useState, useCallback } from 'react';
import { automobileService } from '../services/automobile.service';
import { Automobile } from '../types/automobile.types';

interface AutomobileContextType {
  automobiles: Automobile[];
  loading: boolean;
  error: string | null;
  fetchAutomobiles: () => Promise<void>;
  createAutomobile: (data: FormData) => Promise<void>;
  updateAutomobile: (id: string, data: FormData) => Promise<void>;
  deleteAutomobile: (id: string) => Promise<void>;
  updateAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  getAutomobilesByCategory: (categoryId: string) => Promise<Automobile[]>;
  countAutomobilesByCategory: (categoryId: string) => Promise<number>;
}

const AutomobileContext = createContext<AutomobileContextType | undefined>(undefined);

export const AutomobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [automobiles, setAutomobiles] = useState<Automobile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomobiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automobileService.getAll();
      console.log('Fetched data:', response);
      if (Array.isArray(response.data)) {
        setAutomobiles(response.data);
      } else {
        throw new Error('Data fetched is not an array');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomobile = useCallback(async (data: FormData) => {
    setLoading(true);
    try {
      const newAutomobile = await automobileService.create(data);
      if (newAutomobile && typeof newAutomobile === 'object') {
        setAutomobiles(prev => [...prev, newAutomobile]);
      } else {
        throw new Error('Created automobile is not valid');
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAutomobile = useCallback(async (id: string, data: FormData) => {
    setLoading(true);
    try {
      const updatedAutomobile = await automobileService.update(id, data);
      setAutomobiles(prev => 
        prev.map(auto => auto._id === id ? updatedAutomobile : auto)
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAutomobile = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await automobileService.delete(id);
      setAutomobiles(prev => prev.filter(auto => auto._id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    setLoading(true);
    try {
      await automobileService.updateAvailability(id, isAvailable);
      await fetchAutomobiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [fetchAutomobiles]);

  const getAutomobilesByCategory = useCallback(async (categoryId: string) => {
    try {
      const automobiles = await automobileService.getAutomobilesByCategory(categoryId);
      return automobiles || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const countAutomobilesByCategory = useCallback(async (categoryId: string) => {
    try {
      const count = await automobileService.getCountByCategory(categoryId);
      return count || 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);
  


  return (
    <AutomobileContext.Provider
      value={{
        automobiles,
        loading,
        error,
        fetchAutomobiles,
        createAutomobile,
        updateAutomobile,
        deleteAutomobile,
        updateAvailability,
        getAutomobilesByCategory,
        countAutomobilesByCategory,
      }}
    >
      {children}
    </AutomobileContext.Provider>
  );
};

export const useAutomobile = () => {
  const context = useContext(AutomobileContext);
  if (context === undefined) {
    throw new Error('useAutomobile must be used within an AutomobileProvider');
  }
  return context;
};