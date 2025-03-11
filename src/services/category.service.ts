import api from './api.service';
import { Category } from '../types/automobile.types';

interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface UpdateCategoryDto {
  name?: string;
  description?: string;
  imageUrl?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getOne: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
}; 