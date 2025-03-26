import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">Car Rental Service</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name || 'User'}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to our Car Rental Platform</h2>
          <p className="text-gray-600 mb-6">
            This is a simple home page for non-admin users. Here you can view and manage your reservations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">My Reservations</h3>
              <p className="text-sm text-gray-500 mb-3">View and manage your current reservations</p>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                View Reservations
              </button>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">My Profile</h3>
              <p className="text-sm text-gray-500 mb-3">Update your personal information</p>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Edit Profile
              </button>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Car Rental Service. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
