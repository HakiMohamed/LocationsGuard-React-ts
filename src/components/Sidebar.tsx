import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CarIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TagIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import LocationGuardLogo from '../assets/LocationGuard.png';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Tableau de bord' },
    { path: '/automobiles', icon: CarIcon, label: 'Automobiles' },
    { path: '/categories', icon: TagIcon, label: 'Catégories' },
    { path: '/reservations', icon: DocumentDuplicateIcon, label: 'Réservations' },
    { path: '/users', icon: UserGroupIcon, label: 'Utilisateurs' },
    { path: '/statistics', icon: ChartBarIcon, label: 'Statistiques' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Paramètres' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64 fixed left-0 top-0">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <img 
          src={LocationGuardLogo} 
          alt="LocationGuard" 
          className="h-12 object-contain"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <item.icon 
                className={`w-5 h-5 mr-3 transition-colors
                  ${isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                  }`}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 