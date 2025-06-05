import api from './api.service';
import { Workflow } from '../types/workflow';

export interface Button {
  id: string;
  text: string;
  replyMessage?: string;
  nextWorkflowId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const workflowService = {
  create: async (workflow: Omit<Workflow, '_id'>): Promise<Workflow> => {
    const response = await api.post('/workflows', workflow);
    return response.data.data;
  },

  getAll: async (): Promise<Workflow[]> => {
    const response = await api.get('/workflows');
    return response.data.data;
  },

  getOne: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data.data;
  },

  update: async (id: string, workflow: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.put(`/workflows/${id}`, workflow);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },

  activate: async (id: string): Promise<Workflow> => {
    const response = await api.post(`/workflows/${id}/activate`);
    return response.data.data;
  },

  deactivate: async (id: string): Promise<Workflow> => {
    const response = await api.post(`/workflows/${id}/deactivate`);
    return response.data.data;
  },

  send: async (id: string, number: string): Promise<void> => {
    await api.post(`/workflows/${id}/send`, { number });
  }
}; 