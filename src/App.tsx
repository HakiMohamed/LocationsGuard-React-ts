import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import { AutomobileProvider } from './contexts/AutomobileContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ClientProvider } from './contexts/ClientContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import EmailVerification from './pages/auth/EmailVerification';
import LoadingScreen from './components/LoadingScreen';
import DashboardLayout from './layouts/DashboardLayout';
import AutomobilesPage from './pages/admin/AutomobilesPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ToasterConfig from './components/ui/ToasterConfig';
import { ReservationProvider } from './contexts/ReservationContext';
import ReservationsPage from './pages/admin/ReservationsPage';
import Dashboard from './pages/admin/Dashboard';
import ClientsPage from './pages/admin/ClientsPage';
import ProfilePage from './pages/admin/ProfilePage';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';
// Composant pour protéger les routes privées
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access_token');

  console.log('PrivateRoute - Loading:', loading, 'Token exists:', !!token, 'User exists:', !!user);

  if (loading) {
    return <LoadingScreen />;
  }

  return token && user ? children : <Navigate to="/login" replace />;
};




function App() {
  const { isDark } = useTheme();

  return (
    <>
      <ToasterConfig />
      <div className={isDark ? 'dark' : ''}>
        <AuthProvider>
          <AutomobileProvider>
            <CategoryProvider>
              <ReservationProvider>
                <ClientProvider>
              <Routes>
                {/* Redirection de la racine vers /admin */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/verify-email" element={<EmailVerification />} />
                <Route path="/admin" element={ <PrivateRoute> <DashboardLayout />
                </PrivateRoute>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="automobiles" element={<AutomobilesPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="reservations" element={<ReservationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                <Route path="auth/reset-password" element={<ResetPassword />} />
                {/* Route 404 */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
              </ClientProvider>
              </ReservationProvider>
            </CategoryProvider>
          </AutomobileProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
