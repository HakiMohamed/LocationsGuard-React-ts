import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className = ''
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon 
          className="h-5 w-5 text-gray-400" 
          aria-hidden="true" 
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          text-sm text-gray-900 placeholder:text-gray-500"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput; 