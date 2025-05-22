import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Maintenance, MaintenanceWithNextDetails } from '../types/maintenance.types';
import { maintenanceService, CreateMaintenancePayload } from '../services/maintenance.service';

interface MaintenanceContextProps {
  maintenances: MaintenanceWithNextDetails[];
  loading: boolean;
  error: string | null;
  fetchMaintenances: () => Promise<void>;
  createMaintenance: (data: CreateMaintenancePayload) => Promise<Maintenance>;
  updateMaintenance: (id: string, data: CreateMaintenancePayload) => Promise<Maintenance>;
  deleteMaintenance: (id: string) => Promise<void>;
  getMaintenancesByAutomobile: (automobileId: string) => Promise<Maintenance[]>;
  getMaintenanceAlerts: () => Promise<any[]>;
  getDueMaintenances: () => Promise<MaintenanceWithNextDetails[]>;
  getUpcomingMaintenances: () => Promise<MaintenanceWithNextDetails[]>;
  completeMaintenance: (id: string, date?: string, mileage?: number) => Promise<Maintenance>;
}

const MaintenanceContext = createContext<MaintenanceContextProps | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenances, setMaintenances] = useState<MaintenanceWithNextDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getAll();
      setMaintenances(data as MaintenanceWithNextDetails[]);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      setError('Erreur lors du chargement des maintenances');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMaintenance = async (data: CreateMaintenancePayload): Promise<Maintenance> => {
    try {
      const createdMaintenance = await maintenanceService.create(data);
      await fetchMaintenances();
      return createdMaintenance;
    } catch (error) {
      console.error('Error creating maintenance:', error);
      throw error;
    }
  };

  const updateMaintenance = async (id: string, data: CreateMaintenancePayload): Promise<Maintenance> => {
    try {
      const updatedMaintenance = await maintenanceService.update(id, data);
      await fetchMaintenances();
      return updatedMaintenance;
    } catch (error) {
      console.error('Error updating maintenance:', error);
      throw error;
    }
  };

  const deleteMaintenance = async (id: string): Promise<void> => {
    try {
      await maintenanceService.delete(id);
      await fetchMaintenances();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      throw error;
    }
  };

  const getMaintenancesByAutomobile = async (automobileId: string): Promise<Maintenance[]> => {
    try {
      return await maintenanceService.getByAutomobile(automobileId);
    } catch (error) {
      console.error('Error fetching maintenances by automobile:', error);
      throw error;
    }
  };

  const getMaintenanceAlerts = async (): Promise<any[]> => {
    try {
      return await maintenanceService.getMaintenanceAlerts();
    } catch (error) {
      console.error('Error fetching maintenance alerts:', error);
      throw error;
    }
  };

  const getDueMaintenances = async (): Promise<MaintenanceWithNextDetails[]> => {
    try {
      return await maintenanceService.getDueMaintenances();
    } catch (error) {
      console.error('Error fetching due maintenances:', error);
      throw error;
    }
  };

  const getUpcomingMaintenances = async (): Promise<MaintenanceWithNextDetails[]> => {
    try {
      return await maintenanceService.getUpcomingMaintenances();
    } catch (error) {
      console.error('Error fetching upcoming maintenances:', error);
      throw error;
    }
  };

  const completeMaintenance = async (id: string, date?: string, mileage?: number): Promise<Maintenance> => {
    try {
      const updated = await maintenanceService.completeMaintenance(id, date, mileage);
      await fetchMaintenances();
      return updated;
    } catch (error) {
      console.error('Error completing maintenance:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const value = {
    maintenances,
    loading,
    error,
    fetchMaintenances,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getMaintenancesByAutomobile,
    getMaintenanceAlerts,
    getDueMaintenances,
    getUpcomingMaintenances,
    completeMaintenance
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = (): MaintenanceContextProps => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};