import React, { useEffect, useState, useRef } from 'react';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { Maintenance, MaintenanceStatus, MaintenanceType, MaintenanceWithNextDetails } from '../../types/maintenance.types';
import { toast } from 'react-hot-toast';
import MaintenanceModal from '../../components/Maintenances/MaintenanceModal';
import MaintenanceDetailsModal from '../../components/Maintenances/MaintenanceDetailsModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const Combobox = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  id,
  name,
  label 
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id: string;
  name: string;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 px-2 flex items-center"
        >
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Helper function to translate maintenance types
const translateMaintenanceType = (type: MaintenanceType): string => {
  const translations: Record<MaintenanceType, string> = {
    [MaintenanceType.OIL_CHANGE]: 'Vidange huile',
    [MaintenanceType.TIRE_CHANGE]: 'Changement pneus',
    [MaintenanceType.BRAKE_SERVICE]: 'Entretien freins',
    [MaintenanceType.FILTER_CHANGE]: 'Changement filtres',
    [MaintenanceType.BATTERY_REPLACEMENT]: 'Remplacement batterie',
    [MaintenanceType.GENERAL_INSPECTION]: 'Inspection générale',
    [MaintenanceType.COOLING_SYSTEM]: 'Système refroidissement',
    [MaintenanceType.TRANSMISSION_SERVICE]: 'Entretien transmission',
    [MaintenanceType.SUSPENSION_CHECK]: 'Vérification suspension',
    [MaintenanceType.ELECTRICAL_SYSTEM]: 'Système électrique',
    [MaintenanceType.AIR_CONDITIONING]: 'Climatisation',
    [MaintenanceType.OTHER]: 'Autre'
  };
  
  return translations[type] || type;
};

// Helper function to translate maintenance status
const translateMaintenanceStatus = (status: MaintenanceStatus): string => {
  const translations: Record<MaintenanceStatus, string> = {
    [MaintenanceStatus.SCHEDULED]: 'Planifiée',
    [MaintenanceStatus.IN_PROGRESS]: 'En cours',
    [MaintenanceStatus.COMPLETED]: 'Terminée',
    [MaintenanceStatus.CANCELLED]: 'Annulée'
  };
  
  return translations[status] || status;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'URGENT':
      return 'bg-orange-100 text-orange-800';
    case 'UPCOMING':
      return 'bg-yellow-100 text-yellow-800';
    case 'OK':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusTranslation = (status: string): string => {
  switch (status) {
    case 'OVERDUE':
      return 'En retard';
    case 'URGENT':
      return 'Urgent';
    case 'UPCOMING':
      return 'À venir';
    case 'OK':
      return 'OK';
    default:
      return status;
  }
};

const MaintenancePage: React.FC = () => {
  const { automobiles, fetchAutomobiles } = useAutomobile();
  const { 
    maintenances, 
    loading, 
    error, 
    fetchMaintenances, 
    createMaintenance, 
    updateMaintenance, 
    deleteMaintenance,
    getDueMaintenances,
    getUpcomingMaintenances 
  } = useMaintenance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithNextDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsMaintenance, setDetailsMaintenance] = useState<MaintenanceWithNextDetails | null>(null);
  const [filters, setFilters] = useState({
    automobileId: '',
    type: '',
    status: '',
    urgencyLevel: '',
  });
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  const [maintenancesWithAutomobiles, setMaintenancesWithAutomobiles] = useState<MaintenanceWithNextDetails[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<MaintenanceWithNextDetails | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'due' | 'upcoming'>('all');
  const [dueMaintenances, setDueMaintenances] = useState<any[]>([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<any[]>([]);
  const [isDueLoading, setIsDueLoading] = useState(false);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(false);
  const [selectedAutomobileForAdd, setSelectedAutomobileForAdd] = useState<string | null>(null);

  useEffect(() => {
    fetchMaintenances();
    fetchAutomobiles();
  }, [fetchMaintenances, fetchAutomobiles]);

  useEffect(() => {
    // Process maintenances and add automobile details
    if (maintenances && Array.isArray(maintenances) && maintenances.length > 0 && automobiles && Array.isArray(automobiles) && automobiles.length > 0) {
      const enrichedMaintenances = maintenances.map(maintenance => {
        const autoId = typeof maintenance.automobile === 'string' 
          ? maintenance.automobile 
          : maintenance.automobile._id;
        
        const auto = automobiles.find(a => a._id === autoId);
        
        return {
          ...maintenance,
          automobile: auto || maintenance.automobile
        };
      });

      setMaintenancesWithAutomobiles(enrichedMaintenances);
    } else {
      setMaintenancesWithAutomobiles([]);
    }
  }, [maintenances, automobiles]);

  // Move the fetch functions inside useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (selectedTab === 'due') {
        setIsDueLoading(true);
        try {
          const dueData = await getDueMaintenances();
          setDueMaintenances(dueData);
        } catch (error) {
          console.error('Error fetching due maintenances:', error);
        } finally {
          setIsDueLoading(false);
        }
      } else if (selectedTab === 'upcoming') {
        setIsUpcomingLoading(true);
        try {
          const upcomingData = await getUpcomingMaintenances();
          setUpcomingMaintenances(upcomingData);
        } catch (error) {
          console.error('Error fetching upcoming maintenances:', error);
        } finally {
          setIsUpcomingLoading(false);
        }
      }
    };

    fetchData();
  }, [selectedTab, getDueMaintenances, getUpcomingMaintenances]);

  const handleEdit = (maintenance: MaintenanceWithNextDetails) => {
    setSelectedMaintenance(maintenance);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaintenance(id);
      toast.success('Maintenance supprimée avec succès');
      setIsDeleteModalOpen(false);
      setMaintenanceToDelete(null);
      await fetchMaintenances();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (selectedMaintenance) {
        await updateMaintenance(selectedMaintenance._id, formData);
        toast.success('Maintenance mise à jour avec succès');
      } else {
        await createMaintenance(formData);
        toast.success('Maintenance créée avec succès');
      }
      setIsModalOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenances();
    } catch (error: Error | unknown) {
      console.error('Error:', error);
      const errorMessage = ((error as ApiError).response?.data?.message) || 'Une erreur est survenue';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleOpenDetails = (maintenance: MaintenanceWithNextDetails) => {
    setDetailsMaintenance(maintenance);
    setIsDetailsModalOpen(true);
  };

  const handleAddMaintenanceForCar = (automobileId: string) => {
    setSelectedAutomobileForAdd(automobileId);
    setIsModalOpen(true);
  };

  // Get unique values for filters
  const uniqueAutomobiles = Array.from(new Set(
    Array.isArray(maintenancesWithAutomobiles) 
      ? maintenancesWithAutomobiles.map(maintenance => {
          if (typeof maintenance.automobile === 'object' && maintenance.automobile !== null) {
            return `${maintenance.automobile.brand} ${maintenance.automobile.model} (${maintenance.automobile.licensePlate})`;
          }
          return null;
        })
      : []
  )).filter((auto): auto is string => auto !== null).sort();

  const uniqueTypes = Array.from(new Set(
    Array.isArray(maintenancesWithAutomobiles) 
      ? maintenancesWithAutomobiles.map(maintenance => maintenance.type)
      : []
  )).sort();

  const uniqueStatuses = Array.from(new Set(
    Array.isArray(maintenancesWithAutomobiles) 
      ? maintenancesWithAutomobiles.map(maintenance => maintenance.status)
      : []
  )).sort();

  // Map automobile display name to ID for filtering
  const automobileDisplayToId = Array.isArray(maintenancesWithAutomobiles) 
    ? maintenancesWithAutomobiles.reduce((acc, maintenance) => {
        if (typeof maintenance.automobile === 'object' && maintenance.automobile !== null) {
          const displayName = `${maintenance.automobile.brand} ${maintenance.automobile.model} (${maintenance.automobile.licensePlate})`;
          acc[displayName] = maintenance.automobile._id;
        }
        return acc;
      }, {} as Record<string, string>)
    : {};

  // Apply filters and search
  const getFilteredMaintenances = () => {
    // Different data depending on selected tab
    let maintenancesToFilter: any[] = [];
    
    if (selectedTab === 'all') {
      maintenancesToFilter = maintenancesWithAutomobiles;
    } else if (selectedTab === 'due') {
      maintenancesToFilter = dueMaintenances;
    } else if (selectedTab === 'upcoming') {
      maintenancesToFilter = upcomingMaintenances;
    }

    return Array.isArray(maintenancesToFilter) ? maintenancesToFilter.filter(maintenance => {
      // Search term filtering
      const autoDetails = typeof maintenance.automobile === 'object' && maintenance.automobile !== null
        ? `${maintenance.automobile.brand} ${maintenance.automobile.model} ${maintenance.automobile.licensePlate || ''}`
        : '';
      
      const matchesSearch = !searchTerm || 
        autoDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        translateMaintenanceType(maintenance.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (maintenance.performedBy && maintenance.performedBy.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by automobile
      const selectedAutoDisplay = Object.keys(automobileDisplayToId).find(
        display => automobileDisplayToId[display] === filters.automobileId
      ) || '';
      
      const autoId = typeof maintenance.automobile === 'object' && maintenance.automobile !== null
        ? maintenance.automobile._id
        : maintenance.automobile;
      
      const matchesAutomobile = !filters.automobileId || autoId === filters.automobileId;
      
      // Filter by maintenance type
      const matchesType = !filters.type || maintenance.type === filters.type;
      
      // Filter by status
      const matchesStatus = !filters.status || maintenance.status === filters.status;
      
      // Filter by urgency level (only applicable to due and upcoming tabs)
      const matchesUrgency = !filters.urgencyLevel || 
        (maintenance.nextMaintenance && maintenance.nextMaintenance.status === filters.urgencyLevel) ||
        (maintenance.urgency && maintenance.urgency === filters.urgencyLevel);
      
      return matchesSearch && matchesAutomobile && matchesType && matchesStatus && matchesUrgency;
    }) : [];
  };

  const filteredMaintenances = getFilteredMaintenances();

  // Apply sorting
  if (sortConfig !== null) {
    filteredMaintenances.sort((a, b) => {
      // Handle nested properties
      const getNestedProperty = (obj: any, key: string) => {
        const keys = key.split('.');
        return keys.reduce((o, k) => {
          if (k === 'automobile' && typeof o[k] === 'object' && o[k] !== null) {
            return o[k];
          } else if ((k === 'brand' || k === 'model' || k === 'licensePlate') && typeof o === 'object' && o !== null) {
            return o[k] || '';
          } else if (k === 'completedDate' || k === 'nextDueDate') {
            return o[k] ? new Date(o[k]).getTime() : 0;
          } else if (k === 'type') {
            return translateMaintenanceType(o[k]);
          } else if (k === 'status') {
            return translateMaintenanceStatus(o[k]);
          }
          return (o || {})[k];
        }, obj) || '';
      };

      const aValue = getNestedProperty(a, sortConfig.key);
      const bValue = getNestedProperty(b, sortConfig.key);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter change handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAutomobileFilterChange = (value: string) => {
    const autoId = automobileDisplayToId[value] || '';
    setFilters(prev => ({ ...prev, automobileId: autoId }));
  };

  const resetFilters = () => {
    setFilters({
      automobileId: '',
      type: '',
      status: '',
      urgencyLevel: '',
    });
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des Maintenances</h1>
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
              <span className="text-blue-600 font-semibold">{filteredMaintenances.length}</span>
              <span className="ml-2 text-gray-600">maintenance{filteredMaintenances.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Rechercher par véhicule ou type de maintenance"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
          title="Ajouter une maintenance"
        >
          <div className="relative flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-25 bg-white transition-opacity duration-200"></div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Toutes les maintenances
            </button>
            <button
              onClick={() => setSelectedTab('due')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                selectedTab === 'due'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maintenances dues
            </button>
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                selectedTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maintenances à venir
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="w-full md:w-1/4">
              <Combobox
                id="automobile"
                name="automobile"
                label="Véhicule"
                options={uniqueAutomobiles}
                value={Object.keys(automobileDisplayToId).find(
                  display => automobileDisplayToId[display] === filters.automobileId
                ) || ''}
                onChange={handleAutomobileFilterChange}
                placeholder="Tous les véhicules"
              />
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de maintenance
              </label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {translateMaintenanceType(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {translateMaintenanceStatus(status)}
                  </option>
                ))}
              </select>
            </div>
            {(selectedTab === 'due' || selectedTab === 'upcoming') && (
              <div className="w-full md:w-1/4">
                <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'urgence
                </label>
                <select
                  id="urgencyLevel"
                  name="urgencyLevel"
                  value={filters.urgencyLevel}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="OVERDUE">En retard</option>
                  <option value="URGENT">Urgent</option>
                  <option value="UPCOMING">À venir</option>
                  <option value="OK">OK</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Loading and error states */}
        {selectedTab === 'all' && loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedTab === 'due' && isDueLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedTab === 'upcoming' && isUpcomingLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-center">
              <p>{error}</p>
            </div>
          </div>
        ) : filteredMaintenances.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 12a2 2 0 100-4 2 2 0 000 4z" 
                />
              </svg>
              <p>Aucune maintenance trouvée</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('automobile.brand')}
                  >
                    <div className="flex items-center">
                      Véhicule
                      {sortConfig?.key === 'automobile.brand' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      {sortConfig?.key === 'type' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                        )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('completedDate')}
                      >
                        <div className="flex items-center">
                          Date réalisée
                          {sortConfig?.key === 'completedDate' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('mileageAtMaintenance')}
                      >
                        <div className="flex items-center">
                          Kilométrage
                          {sortConfig?.key === 'mileageAtMaintenance' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center">
                          Statut
                          {sortConfig?.key === 'status' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('nextDueDate')}
                      >
                        <div className="flex items-center">
                          Prochaine échéance
                          {sortConfig?.key === 'nextDueDate' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      {(selectedTab === 'due' || selectedTab === 'upcoming') && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('urgency')}
                        >
                          <div className="flex items-center">
                            Urgence
                            {sortConfig?.key === 'urgency' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMaintenances.map((maintenance) => (
                      <tr key={maintenance._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {typeof maintenance.automobile === 'object' && maintenance.automobile !== null ? (
                              <>
                                {maintenance.automobile.images && maintenance.automobile.images.length > 0 ? (
                                  <img 
                                    src={maintenance.automobile.images[0]} 
                                    alt={maintenance.automobile.brand} 
                                    className="h-10 w-10 rounded-full object-cover mr-3"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">{maintenance.automobile.brand} {maintenance.automobile.model}</div>
                                  <div className="text-xs text-gray-500">{maintenance.automobile.licensePlate}</div>
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-500">ID: {maintenance.automobile}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{translateMaintenanceType(maintenance.type)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {maintenance.completedDate ? format(new Date(maintenance.completedDate), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.mileageAtMaintenance ? `${maintenance.mileageAtMaintenance} km` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {translateMaintenanceStatus(maintenance.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {maintenance.nextDueDate ? (
                            <div className="flex flex-col">
                              <span>{format(new Date(maintenance.nextDueDate), 'dd MMM yyyy', { locale: fr })}</span>
                              {maintenance.nextDueMileage && (
                                <span className="text-xs text-gray-400">à {maintenance.nextDueMileage} km</span>
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        {(selectedTab === 'due' || selectedTab === 'upcoming') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {maintenance.nextMaintenance?.status ? (
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(maintenance.nextMaintenance.status)}`}>
                                {getStatusTranslation(maintenance.nextMaintenance.status)}
                              </span>
                            ) : maintenance.urgency ? (
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(maintenance.urgency)}`}>
                                {getStatusTranslation(maintenance.urgency)}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleOpenDetails(maintenance)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                              title="Voir les détails"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(maintenance)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors"
                              title="Modifier"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setMaintenanceToDelete(maintenance);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors"
                              title="Supprimer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    
          {/* Pagination section */}
          {filteredMaintenances.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Précédent
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredMaintenances.length}</span> sur <span className="font-medium">{filteredMaintenances.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Précédent</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Suivant</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
    
          {/* Quick actions panel for vehicles that need maintenance */}
          {selectedTab === 'due' && dueMaintenances.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueMaintenances.slice(0, 3).map((item) => (
                  <div key={`${item.automobile._id}-${item.maintenanceType}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.automobile.brand} {item.automobile.model}</h4>
                        <p className="text-sm text-gray-500">{item.automobile.licensePlate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.urgency)}`}>
                        {getStatusTranslation(item.urgency)}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <span className="font-semibold">{translateMaintenanceType(item.maintenanceType)}</span>
                      <span className="text-gray-500"> | {item.dueReason}</span>
                    </p>
                    <button
                      onClick={() => handleAddMaintenanceForCar(item.automobile._id)}
                      className="w-full mt-2 bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Ajouter la maintenance
                    </button>
                  </div>
                ))}
              </div>
              {dueMaintenances.length > 3 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500">
                    {dueMaintenances.length - 3} autres véhicules nécessitent une maintenance
                  </span>
                </div>
              )}
            </div>
          )}
    
          {/* Maintenance Modal */}
          <MaintenanceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedMaintenance(null);
              setSelectedAutomobileForAdd(null);
            }}
            onSubmit={handleSubmit}
            maintenance={selectedMaintenance || undefined}
            preSelectedAutomobileId={selectedAutomobileForAdd || undefined}
          />
    
          {/* Details Modal */}
          <MaintenanceDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setDetailsMaintenance(null);
            }}
            maintenance={detailsMaintenance || undefined}
          />
    
          {/* Delete confirmation modal */}
          {isDeleteModalOpen && maintenanceToDelete && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Confirmer la suppression
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Êtes-vous sûr de vouloir supprimer cette maintenance ? Cette action est irréversible.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => maintenanceToDelete && handleDelete(maintenanceToDelete._id)}
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setMaintenanceToDelete(null);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default MaintenancePage; 