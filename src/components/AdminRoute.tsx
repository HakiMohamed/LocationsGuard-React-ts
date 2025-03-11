import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access_token');

  if (loading) {
    return <LoadingScreen />;
  }

  // Vérifiez si l'utilisateur est connecté et a un rôle d'administrateur
  return token && user && user.role === 'admin' ? children : <Navigate to="/login" replace />;
};

export default AdminRoute; 