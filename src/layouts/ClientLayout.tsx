import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ClientLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold">AutoLoc</span>
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/services" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Services
                </Link>
                <Link to="/vehicles" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Véhicules
                </Link>
                <Link to="/reservations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Mes Réservations
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                {user?.email}
              </Link>
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout; 