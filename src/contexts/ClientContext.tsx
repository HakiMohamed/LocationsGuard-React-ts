import React, { createContext, useContext, useState, useCallback } from 'react';
import { clientService } from '../services/client.service';
import { Client, CreateClientDto, UpdateClientDto } from '../types/client.types';

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (data: FormData) => Promise<void>;
  updateClient: (id: string, data: FormData) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientService.getAll();
      setClients(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const newClient = await clientService.create(data);
      setClients(prevClients => [...(prevClients || []), newClient]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id: string, data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClient = await clientService.update(id, data);
      setClients(prevClients => 
        (prevClients || []).map(client => 
          client._id === id ? updatedClient : client
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await clientService.delete(id);
      setClients(prevClients => 
        (prevClients || []).filter(client => client._id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        error,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}; 