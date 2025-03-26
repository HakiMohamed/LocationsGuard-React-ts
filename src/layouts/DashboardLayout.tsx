import { useState } from 'react';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
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

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200">
            <img src={LocationGuardLogo} alt="LocationGuard Logo" className="h-14 w-auto" />
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200`}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-20 items-center px-6 border-b border-gray-200">
            <img src={LocationGuardLogo} alt="LocationGuard Logo" className="h-14 w-auto" />
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200`}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Header */}
        <header className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la barre latérale</span>
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch justify-end">
            <div className="flex items-center gap-x-4">
              {/* Notifications */}
              <button type="button" className="relative p-2 text-gray-400 hover:text-gray-600">
                <span className="sr-only">Voir les notifications</span>
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                <button 
                  type="button" 
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden lg:block">Mon profil</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="px-2 py-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;