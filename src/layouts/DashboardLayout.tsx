import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon as CarIcon,
  TagIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import LocationGuardLogo from '../assets/LocationGuard.png';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Automobiles', href: '/admin/automobiles', icon: CarIcon },
  { name: 'Catégories', href: '/admin/categories', icon: TagIcon },
  { name: 'Clients', href: '/admin/clients', icon: UserGroupIcon },
  { name: 'Réservations', href: '/admin/reservations', icon: CalendarIcon },
  { name: 'Maintenances', href: '/admin/maintenances', icon: WrenchScrewdriverIcon },
  { name: 'Paiements', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Locations', href: '/admin/locations', icon: MapPinIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Mon Profil', href: '/admin/profile', icon: UserCircleIcon },
  { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

// Définition du type d'alerte de maintenance (adapté du backend)
type MaintenanceAlert = {
  automobileId: string;
  type: 'KILOMETER_ALERT' | 'DATE_ALERT' | 'NO_MAINTENANCE_HISTORY';
  maintenanceType: string;
  message: string;
  currentKilometers?: number;
  recommendedKilometers?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  recommendedDate?: string;
};

type MaintenanceAlertApiResponse = { success: boolean; data: MaintenanceAlert[] } | MaintenanceAlert[];

// Type Notification générique
export type Notification = {
  id: string;
  type: 'MAINTENANCE' | 'MESSAGE' | 'PAIEMENT' | string;
  title: string;
  message: string;
  date?: string;
  data?: unknown;
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getMaintenanceAlerts } = useMaintenance();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data: MaintenanceAlertApiResponse = await getMaintenanceAlerts();
        const alerts = Array.isArray(data) ? data : (data as { data: MaintenanceAlert[] }).data || [];
        // Transformer chaque alerte en notification
        const maintenanceNotifications: Notification[] = alerts.map((alert, idx) => ({
          id: `maintenance-${alert.automobileId}-${alert.maintenanceType}-${idx}`,
          type: 'MAINTENANCE',
          title: 'Alerte maintenance',
          message: alert.message,
          date: alert.nextMaintenanceDate || alert.lastMaintenanceDate || undefined,
          data: alert,
        }));
        setNotifications(maintenanceNotifications); // plus tard, concaténer d'autres types ici
      } catch {
        setNotifications([]);
      }
    };
    fetchAlerts();
  }, [getMaintenanceAlerts]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
            <img src={LocationGuardLogo} alt="LocationGuard Logo" className="h-14 w-auto" />
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-200 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`${
                  location.pathname === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                } mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200`} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-lg">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
            {!sidebarCollapsed && <img src={LocationGuardLogo} alt="LocationGuard Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,1.5)]" />}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-6 w-6" />
              ) : (
                <ChevronLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <item.icon className={`${
                  location.pathname === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                } h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  sidebarCollapsed ? 'mx-auto' : 'mr-3'
                }`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm ${
                sidebarCollapsed ? 'w-12' : 'w-full'
              }`}
              title={sidebarCollapsed ? 'Déconnexion' : ''}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8 shadow-sm">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la barre latérale</span>
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch justify-end">
            <div className="flex items-center gap-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <span className="sr-only">Voir les notifications</span>
                  <BellIcon className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>
                {/* Menu déroulant des notifications */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 font-semibold border-b">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500">Aucune notification</div>
                    ) : (
                      <ul>
                        {notifications.map((notif) => (
                          <li key={notif.id} className="p-4 border-b last:border-b-0">
                            <div className="font-medium">{notif.title}</div>
                            <div className="text-xs text-gray-500 mb-1">{notif.type === 'MAINTENANCE' && 'Maintenance'}{notif.date && ` | ${new Date(notif.date).toLocaleDateString()}`}</div>
                            <div>{notif.message}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                <button 
                  type="button" 
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors" />
                  <span className="hidden lg:block">Mon profil</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;