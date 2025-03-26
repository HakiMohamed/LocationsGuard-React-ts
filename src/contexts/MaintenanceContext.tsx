import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Maintenance, MaintenanceWithNextDetails, MaintenanceTypeInfo, MaintenanceSchedule } from '../types/maintenance.types';
import { maintenanceService } from '../services/maintenance.service';

interface MaintenanceContextProps {
  maintenances: MaintenanceWithNextDetails[];
  loading: boolean;
  error: string | null;
  fetchMaintenances: () => Promise<void>;
  createMaintenance: (formData: FormData) => Promise<Maintenance>;
  updateMaintenance: (id: string, formData: FormData) => Promise<Maintenance>;
  deleteMaintenance: (id: string) => Promise<void>;
  getMaintenancesByAutomobile: (automobileId: string) => Promise<Maintenance[]>;
  getDueMaintenances: () => Promise<Maintenance[]>;
  getUpcomingMaintenances: () => Promise<Maintenance[]>;
  getApplicableMaintenanceTypes: (automobileId: string) => Promise<MaintenanceTypeInfo[]>;
  suggestMaintenanceSchedule: (automobileId: string) => Promise<MaintenanceSchedule>;
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
      setMaintenances(data);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      setError('Erreur lors du chargement des maintenances');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMaintenance = async (formData: FormData): Promise<Maintenance> => {
    try {
      const createdMaintenance = await maintenanceService.create(formData);
      await fetchMaintenances();
      return createdMaintenance;
    } catch (error) {
      console.error('Error creating maintenance:', error);
      throw error;
    }
  };

  const updateMaintenance = async (id: string, formData: FormData): Promise<Maintenance> => {
    try {
      const updatedMaintenance = await maintenanceService.update(id, formData);
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

  const getDueMaintenances = async (): Promise<Maintenance[]> => {
    try {
      return await maintenanceService.getDueMaintenances();
    } catch (error) {
      console.error('Error fetching due maintenances:', error);
      throw error;
    }
  };

  const getUpcomingMaintenances = async (): Promise<Maintenance[]> => {
    try {
      return await maintenanceService.getUpcomingMaintenances();
    } catch (error) {
      console.error('Error fetching upcoming maintenances:', error);
      throw error;
    }
  };

  const getApplicableMaintenanceTypes = async (automobileId: string): Promise<MaintenanceTypeInfo[]> => {
    try {
      return await maintenanceService.getApplicableMaintenanceTypes(automobileId);
    } catch (error) {
      console.error('Error fetching applicable maintenance types:', error);
      throw error;
    }
  };

  const suggestMaintenanceSchedule = async (automobileId: string): Promise<MaintenanceSchedule> => {
    try {
      return await maintenanceService.suggestMaintenanceSchedule(automobileId);
    } catch (error) {
      console.error('Error fetching maintenance schedule suggestion:', error);
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
    getDueMaintenances,
    getUpcomingMaintenances,
    getApplicableMaintenanceTypes,
    suggestMaintenanceSchedule
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