import api from './api.service';

export const getExpensesStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const { data } = await api.get('/stats/expenses', { params });
  return data;
};

export const getReservationStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const { data } = await api.get('/stats/reservations', { params });
  return data;
};

export const getAutomobileStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const { data } = await api.get('/stats/automobiles', { params });
  return data;
};

export const getClientStats = async (params?: { startDate?: string; endDate?: string; period?: string }) => {
  const { data } = await api.get('/stats/clients', { params });
  return data;
}; 