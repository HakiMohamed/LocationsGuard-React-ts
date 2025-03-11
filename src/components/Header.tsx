import React from 'react';
import { Bars3Icon as MenuIcon, BellIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md lg:hidden hover:bg-gray-100"
          >
            <MenuIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">
            Auto Location Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <BellIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center">
            <img
              className="h-8 w-8 rounded-full"
              src="https://ui-avatars.com/api/?name=Admin"
              alt="User"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 