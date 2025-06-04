import api from './api.service';

export const getExpensesStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const response = await api.get('/stats/expenses', { params });
  return response.data.data;
};

export const getReservationStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const response = await api.get('/stats/reservations', { params });
  return response.data.data;
};

export const getAutomobileStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const response = await api.get('/stats/automobiles', { params });
  return response.data.data;
};

export const getClientStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const response = await api.get('/stats/clients', { params });
  return response.data.data;
};

export const getBenefitsStats = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get('/stats/benefits', { params });
  return response.data.data;
}; 