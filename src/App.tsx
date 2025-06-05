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
import { MaintenanceProvider } from './contexts/MaintenanceContext';
import MaintenancesPage from './pages/admin/MaintenancesPage';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/admin/ExpensesPage';
import { ExpenseProvider } from './contexts/ExpenseContext';
import StatisticsPage from './pages/admin/StatisticsPage';
import { StatsProvider } from './contexts/StatsContext';
import LocationsPage from './pages/admin/LocationsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import MessagesPage from './pages/admin/MessagesPage';
import SettingsPage from './pages/admin/SettingsPage';
import WhatsAppPage from './pages/admin/WhatsAppPage';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
// Composant pour protéger les routes admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access_token');

  console.log('AdminRoute - Loading:', loading, 'Token exists:', !!token, 'User exists:', !!user, 'Role:', user?.role);

  if (loading) {
    return <LoadingScreen />;
  }

  // Vérifier si l'utilisateur est connecté et a le rôle admin
  if (token && user && user.role === 'admin') {
    return <>{children}</>;
  }
  
  // Rediriger vers /home si l'utilisateur n'est pas admin
  return <Navigate to="/home" replace />;
};

// Route privée standard pour les utilisateurs connectés
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access_token');

  if (loading) {
    return <LoadingScreen />;
  }

  return token && user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Composant pour rediriger en fonction du rôle
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  return user?.role === 'admin' ? 
    <Navigate to="/admin" replace /> : 
    <Navigate to="/home" replace />;
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
                  <MaintenanceProvider>
                    <ExpenseProvider>
                      <WhatsAppProvider>
                        <Routes>
                          {/* Redirection de la racine vers /home ou /admin selon le rôle */}
                          <Route path="/" element={<PrivateRoute><RoleBasedRedirect /></PrivateRoute>} />
                          
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/verify-email" element={<VerifyEmail />} />
                          <Route path="/auth/verify-email" element={<EmailVerification />} />
                          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                          <Route path="auth/reset-password" element={<ResetPassword />} />
                          
                          {/* Page d'accueil pour les utilisateurs non-admin */}
                          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                          
                          {/* Routes admin protégées */}
                          <Route path="/admin" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="clients" element={<ClientsPage />} />
                            <Route path="automobiles" element={<AutomobilesPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="reservations" element={<ReservationsPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="maintenances" element={<MaintenancesPage />} />
                            <Route path="depenses" element={<ExpensesPage />} />
                            <Route path="statistics" element={
                              <StatsProvider>
                                <StatisticsPage />
                              </StatsProvider>
                            } />
                            <Route path="locations" element={<LocationsPage />} />
                            <Route path="payments" element={<PaymentsPage />} />
                            <Route path="messages" element={<MessagesPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="whatsapp" element={<WhatsAppPage />} />
                          </Route>
                          
                          {/* Route 404 */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </WhatsAppProvider>
                    </ExpenseProvider>
                  </MaintenanceProvider>
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
