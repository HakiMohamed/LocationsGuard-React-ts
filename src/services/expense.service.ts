import api from './api.service';
import { Expense } from '../types/expense.types';

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await api.get('/expenses');
  return data.data || data;
};

export const getExpense = async (id: string): Promise<Expense> => {
  const { data } = await api.get(`/expenses/${id}`);
  return data.data || data;
};

export const createExpense = async (expense: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
  const { data } = await api.post('/expenses', expense);
  return data.data || data;
};

export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data.data || data;
};

export const deleteExpense = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data.data || data;
}; 