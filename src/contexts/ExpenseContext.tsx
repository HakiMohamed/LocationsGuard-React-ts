import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Expense, ExpenseType } from '../types/expense.types';
import * as expenseService from '../services/expense.service';

interface ExpenseContextType {
  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
  createExpense: (expense: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = async (expense: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense = await expenseService.createExpense(expense);
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const updated = await expenseService.updateExpense(id, expense);
    setExpenses((prev) => prev.map(e => e._id === id ? updated : e));
    return updated;
  };

  const deleteExpense = async (id: string) => {
    await expenseService.deleteExpense(id);
    setExpenses((prev) => prev.filter(e => e._id !== id));
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <ExpenseContext.Provider value={{ expenses, fetchExpenses, createExpense, updateExpense, deleteExpense, loading }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpense must be used within an ExpenseProvider');
  return context;
}; 