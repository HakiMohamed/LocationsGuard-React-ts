import api from './api.service';

export interface WhatsAppStatus {
  connected: boolean;
  hasQr: boolean;
  qr: string | null;
}

export interface WhatsAppQr {
  qr: string | null;
}

export interface WhatsAppLogs {
  logs: string[];
}

export interface SendMessagePayload {
  number: string;
  message: string;
}

export interface WhatsAppConversation {
  chatId: string;
  name?: string;
  lastMessage?: string;
}

export interface WhatsAppMessage {
  id: string;
  fromMe: boolean;
  timestamp: number;
  content: string;
  type: 'text' | 'other';
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export const whatsappService = {
  getStatus: async (): Promise<WhatsAppStatus> => {
    const response = await api.get<ApiResponse<WhatsAppStatus>>('/whatsapp/status');
    return response.data.data;
  },

  getQr: async (): Promise<WhatsAppQr> => {
    const response = await api.get<ApiResponse<WhatsAppQr>>('/whatsapp/qr');
    return response.data.data;
  },

  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/whatsapp/disconnect');
    return response.data.data;
  },

  getLogs: async (): Promise<WhatsAppLogs> => {
    const response = await api.get<ApiResponse<WhatsAppLogs>>('/whatsapp/logs');
    return response.data.data;
  },

  sendMessage: async (payload: SendMessagePayload): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/whatsapp/send', payload);
    return response.data.data;
  },

  getConversations: async (): Promise<WhatsAppConversation[]> => {
    const response = await api.get<ApiResponse<WhatsAppConversation[]>>('/whatsapp/conversations');
    return response.data.data;
  },

  getMessages: async (chatId: string): Promise<{ chatId: string; messages: WhatsAppMessage[] }> => {
    const response = await api.get<ApiResponse<{ chatId: string; messages: WhatsAppMessage[] }>>(`/whatsapp/conversations/${chatId}`);
    return response.data.data;
  },
}; 