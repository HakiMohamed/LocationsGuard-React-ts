import React, { createContext, useContext, useState, useCallback } from 'react';
import { categoryService } from '../services/category.service';
import { Category } from '../types/automobile.types';

interface CategoryError {
  message: string;
  status?: number;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: CategoryError | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: FormData) => Promise<void>;
  updateCategory: (id: string, data: FormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CategoryError | null>(null);

  const handleError = (err: any) => {
    if (err.response) {
      const status = err.response.status;
      switch (status) {
        case 400:
          return { message: 'Requête invalide', status };
        case 401:
          return { message: 'Non autorisé', status };
        case 403:
          return { message: 'Accès interdit', status };
        case 404:
          return { message: 'Ressource non trouvée', status };
        case 500:
          return { message: 'Erreur serveur', status };
        case 409:
          return { message: 'Une catégorie avec ce nom existe déjà', status };
        case 422:
          return { message: 'Données invalides', status };
        default:
          return { message: 'Une erreur est survenue', status };
      }
    }
    // Erreur sans réponse du serveur (network error, etc.)
    return { message: err instanceof Error ? err.message : 'Une erreur est survenue' };
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.create(data);
      await fetchCategories();
    } catch (err) {
      const error = handleError(err);
      setError({ ...error, message: `Erreur lors de la création: ${error.message}` });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.update(id, data);
      await fetchCategories();
    } catch (err) {
      const error = handleError(err);
      setError({ ...error, message: `Erreur lors de la mise à jour: ${error.message}` });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.delete(id);
      await fetchCategories();
    } catch (err) {
      const error = handleError(err);
      setError({ ...error, message: `Erreur lors de la suppression: ${error.message}` });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}; 