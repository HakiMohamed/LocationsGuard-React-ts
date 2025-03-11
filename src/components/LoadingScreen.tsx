import React from 'react';
import logo from '../assets/LocationGuard.png'; // Assurez-vous d'avoir le logo dans ce chemin

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="LocationGuard Logo"
          className="w-50 h-24 animate-bounce"
        />
       
        <div className="mt-4 flex space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 