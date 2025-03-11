import axios, { AxiosError } from 'axios';
import AuthService from './auth.service';

// Étendre le type pour inclure _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:3000/api';

// Variables pour gérer le rafraîchissement et la file d'attente
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

// Fonction pour traiter la file d'attente
const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("config",config)
    } else {
      console.log('Request without token');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Pour le type de response.data
interface ErrorResponse {
  error: {
    message: string;
  };
}

// Response interceptor
api.interceptors.response.use(
    (response) => {
      console.log('Response:', response);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);
  
      if (
        error.response?.status === 401 &&
        (error.response?.data as ErrorResponse)?.error?.message === "Token_expired" &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // Si un rafraîchissement est en cours, mettre la requête en file d'attente
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }
  
        originalRequest._retry = true;
        isRefreshing = true;
  
        try {
          const response = await AuthService.refreshToken();
          console.log('Refresh token response:', response);
          const newToken = response.data.access_token;
          
          // Mettre à jour le token dans les headers par défaut
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          // Stocker le nouveau token dans le localStorage
          localStorage.setItem('access_token', newToken);
          
          // Traiter toutes les requêtes en attente
          processQueue(null, newToken);
          
          // Réessayer la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError: unknown) {
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          processQueue(refreshError, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
  
      return Promise.reject(error);
    }
  );
export default api;