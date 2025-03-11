import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth.service';

interface Device {
  deviceId: string;
  name: string;
  type: string;
  ip: string;
  isActive: boolean;
  lastLogin: string;
  fingerprint: string;
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  city?: string;
  address?: string;
  drivingLicenseNumber?: string;
  drivingLicenseDate?: string;
  drivingLicenseExpirationDate?: string;
  drivingLicenseImage?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: string;
  devices?: Device[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await AuthService.getCurrentUser();
          if (response?.data) {
            console.log('User data:', response.data);
            setUser(response.data);
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
              ...currentUser,
              role: response.data.role
            }));
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        // Si l'erreur est due à un token expiré, nettoyer le stockage
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };
  
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('Attempting login...');
      const response = await AuthService.login({ email, password });
      console.log('Login response:', response);
      
      const userResponse = await AuthService.getCurrentUser();
      setUser(userResponse.data);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      await AuthService.register(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred during registration');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      localStorage.removeItem('access_token');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred during logout');
    }
  };

  const clearError = () => setError(null);

  const updateProfile = (newUser: User) => {
    setUser(newUser);
  };

  return (<AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 