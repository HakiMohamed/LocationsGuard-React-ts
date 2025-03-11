import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ReservationStatus } from '../../types/reservation.types';
import SearchInput from '../ui/SearchInput';

interface ReservationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
}) => {
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.values(ReservationStatus).map(status => ({
      value: status,
      label: status
    }))
  ];

  const dateOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' }
  ];

  // Clear all filters
  const clearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('');
    onDateFilterChange('');
  };

  // Get label from value
  const getStatusLabel = () => {
    const option = statusOptions.find(opt => opt.value === statusFilter);
    return option ? option.label : '';
  };

  const getDateLabel = () => {
    const option = dateOptions.find(opt => opt.value === dateFilter);
    return option ? option.label : '';
  };

  const hasActiveFilters = searchTerm || statusFilter || dateFilter;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-800">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <XMarkIcon className="h-4 w-4" />
            Effacer tout
          </button>
        )}
      </div>
      
      {/* Search Section */}
      <div className="px-6 py-4">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par client, véhicule..."
          className="w-full"
        />
      </div>
      
      {/* Filter Pills */}
      <div className="px-6 pt-2 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Status Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Statut
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 pl-4 pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {statusFilter && (
              <button 
                onClick={() => onStatusFilterChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Période
          </label>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 pl-4 pr-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {dateFilter && (
              <button 
                onClick={() => onDateFilterChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Recherche: {searchTerm}
              <button 
                onClick={() => onSearchChange('')}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          
          {statusFilter && (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              Statut: {getStatusLabel()}
              <button 
                onClick={() => onStatusFilterChange('')}
                className="ml-1 text-purple-500 hover:text-purple-700"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          
          {dateFilter && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Période: {getDateLabel()}
              <button 
                onClick={() => onDateFilterChange('')}
                className="ml-1 text-green-500 hover:text-green-700"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationFilters;