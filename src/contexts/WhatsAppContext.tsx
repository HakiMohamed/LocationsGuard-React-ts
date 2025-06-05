import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { whatsappService, WhatsAppStatus, WhatsAppLogs } from '../services/whatsapp.service';
import { toast } from 'react-hot-toast';

interface WhatsAppContextType {
  status: WhatsAppStatus | null;
  logs: string[];
  isLoading: boolean;
  refreshStatus: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (number: string, message: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      const newStatus = await whatsappService.getStatus();
      console.log('WhatsApp Status:', newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      toast.error('Failed to fetch WhatsApp status');
    }
  }, []);

  const refreshLogs = useCallback(async () => {
    try {
      const response = await whatsappService.getLogs();
      console.log('WhatsApp Logs:', response);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Error fetching WhatsApp logs:', error);
      toast.error('Failed to fetch WhatsApp logs');
      setLogs([]);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const response = await whatsappService.disconnect();
      console.log('Disconnect response:', response);
      if (response.success) {
        toast.success('WhatsApp disconnected successfully');
        await refreshStatus();
      } else {
        toast.error(response.message || 'Failed to disconnect WhatsApp');
      }
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Failed to disconnect WhatsApp');
    }
  }, [refreshStatus]);

  const sendMessage = useCallback(async (number: string, message: string) => {
    try {
      console.log('Sending message to:', number);
      const response = await whatsappService.sendMessage({ number, message });
      console.log('Send message response:', response);
      if (response.success) {
        toast.success('Message sent successfully');
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        console.log('Initializing WhatsApp...');
        await Promise.all([refreshStatus(), refreshLogs()]);
      } catch (error) {
        console.error('Error initializing WhatsApp:', error);
        toast.error('Failed to initialize WhatsApp');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Set up polling for status and logs
    const statusInterval = setInterval(refreshStatus, 6000); // Poll every 50 seconds
    const logsInterval = setInterval(refreshLogs, 5000); // Poll logs every 10 seconds

    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, [refreshStatus, refreshLogs]);

  return (
    <WhatsAppContext.Provider
      value={{
        status,
        logs,
        isLoading,
        refreshStatus,
        refreshLogs,
        disconnect,
        sendMessage,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}; 