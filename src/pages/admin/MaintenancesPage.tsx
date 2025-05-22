import React, { useEffect, useState } from 'react';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { MaintenanceType, MaintenanceWithNextDetails } from '../../types/maintenance.types';
import { toast } from 'react-hot-toast';
import MaintenanceModal from '../../components/Maintenances/MaintenanceModal';
import MaintenanceDetailsModal from '../../components/Maintenances/MaintenanceDetailsModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateMaintenancePayload } from '../../services/maintenance.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faExclamationTriangle, faBell, faPlus, faCheckCircle, faClock, faFilter } from '@fortawesome/free-solid-svg-icons';
import CompleteMaintenanceModal from '../../components/Maintenances/CompleteMaintenanceModal';
import DeleteMaintenanceModal from '../../components/Maintenances/DeleteMaintenanceModal';

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

// Helper function to translate maintenance types
const translateMaintenanceType = (type: MaintenanceType): string => {
  const translations: Record<MaintenanceType, string> = {
    VIDANGE: 'Vidange',
    FILTRE_AIR: 'Filtre à air',
    FILTRE_HUILE: 'Filtre à huile',
    FILTRE_CARBURANT: 'Filtre à carburant',
    FREINS: 'Freins',
    PNEUS: 'Pneus',
    AUTRE: 'Autre',
  };
  return translations[type] || type;
};

const MaintenancePage: React.FC = () => {
  const { automobiles, fetchAutomobiles } = useAutomobile();
  const { 
    maintenances, 
    fetchMaintenances, 
    createMaintenance, 
    updateMaintenance, 
    deleteMaintenance,
    getDueMaintenances,
    getUpcomingMaintenances,
    completeMaintenance
  } = useMaintenance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithNextDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsMaintenance, setDetailsMaintenance] = useState<MaintenanceWithNextDetails | null>(null);
  const [filters, setFilters] = useState({
    automobileId: '',
    type: '',
  });
  const [sortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  const [maintenancesWithAutomobiles, setMaintenancesWithAutomobiles] = useState<MaintenanceWithNextDetails[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'due' | 'upcoming' | 'completed'>('all');
  const [dueMaintenances, setDueMaintenances] = useState<MaintenanceWithNextDetails[]>([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<MaintenanceWithNextDetails[]>([]);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [maintenanceToComplete, setMaintenanceToComplete] = useState<MaintenanceWithNextDetails | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<MaintenanceWithNextDetails | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        try {
          const dueData = await getDueMaintenances();
          setDueMaintenances(dueData);
        } catch (error) {
          console.error('Error fetching due maintenances:', error);
        }
      } else if (selectedTab === 'upcoming') {
        try {
          const upcomingData = await getUpcomingMaintenances();
          setUpcomingMaintenances(upcomingData);
        } catch (error) {
          console.error('Error fetching upcoming maintenances:', error);
        }
      }
    };

    fetchData();
  }, [selectedTab, getDueMaintenances, getUpcomingMaintenances]);

  const handleAddMaintenanceClick = () => {
    setSelectedMaintenance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (maintenance: MaintenanceWithNextDetails) => {
    setSelectedMaintenance(maintenance);
    setIsModalOpen(true);
  };

  const handleDelete = (maintenance: MaintenanceWithNextDetails) => {
    setMaintenanceToDelete(maintenance);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!maintenanceToDelete) return;
    try {
      await deleteMaintenance(maintenanceToDelete._id);
      toast.success('Maintenance supprimée avec succès !');
      setIsDeleteModalOpen(false);
      setMaintenanceToDelete(null);
      fetchMaintenances();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast.error('Erreur lors de la suppression de la maintenance.');
    }
  };

  const handleSubmit = async (payload: CreateMaintenancePayload) => {
    try {
      if (selectedMaintenance) {
        await updateMaintenance(selectedMaintenance._id, payload);
        toast.success('Maintenance mise à jour avec succès');
      } else {
        await createMaintenance(payload);
        toast.success('Maintenance créée avec succès');
      }
      setIsModalOpen(false);
      setSelectedMaintenance(null);
      await fetchMaintenances();
    } catch (error: Error | unknown) {
       console.error('Error submitting maintenance:', error);
      // Improved error handling to display backend messages
      const errorMessage = (error as ApiError)?.response?.data?.message;
      if (errorMessage) {
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach(msg => toast.error(msg));
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Une erreur est survenue lors de la soumission.');
      }
    }
  };

  const handleOpenDetails = (maintenance: MaintenanceWithNextDetails) => {
    setDetailsMaintenance(maintenance);
    setIsDetailsModalOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      automobileId: '',
      type: '',
    });
    setSearchTerm('');
  };

  const getFilteredMaintenances = () => {
    // Use maintenancesWithAutomobiles which has enriched automobile details
    let currentMaintenances =
      selectedTab === 'all'
        ? maintenancesWithAutomobiles
        : selectedTab === 'due'
        ? dueMaintenances
        : selectedTab === 'upcoming'
        ? upcomingMaintenances
        : selectedTab === 'completed'
        ? maintenancesWithAutomobiles.filter(m => m.status === 'COMPLETED')
        : maintenancesWithAutomobiles;

    // Apply filters
    if (filters.automobileId) {
      currentMaintenances = currentMaintenances.filter(m => 
        typeof m.automobile !== 'string' && m.automobile?._id === filters.automobileId
      );
    }
    if (filters.type) {
      currentMaintenances = currentMaintenances.filter(m => m.type === filters.type);
    }

    // Apply search term filtering on enriched data
     if (searchTerm) {
        currentMaintenances = currentMaintenances.filter(m => {
          const typeLabel = translateMaintenanceType(m.type).toLowerCase();
          const typeRaw = m.type.toLowerCase();
           if (typeof m.automobile !== 'string') {
              // Search by automobile brand, model, license plate, or type
              return (
                m.automobile?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.automobile?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.automobile?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                typeLabel.includes(searchTerm.toLowerCase()) ||
                typeRaw.includes(searchTerm.toLowerCase())
              );
           } else {
              // If automobile is just an ID string, search against the ID string and type
              return (
                m.automobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
                typeLabel.includes(searchTerm.toLowerCase()) ||
                typeRaw.includes(searchTerm.toLowerCase())
              );
           }
        });
     }

  // Apply sorting
  if (sortConfig !== null) {
      currentMaintenances.sort((a, b) => {
      const aValue = getNestedProperty(a, sortConfig.key);
      const bValue = getNestedProperty(b, sortConfig.key);
        // Handle potential null/undefined values during comparison
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
        // Specific handling for date strings
        if (sortConfig.key.includes('Date')) {
          const dateA = typeof aValue === 'string' && !isNaN(Date.parse(aValue)) ? new Date(aValue).getTime() : 0;
          const dateB = typeof bValue === 'string' && !isNaN(Date.parse(bValue)) ? new Date(bValue).getTime() : 0;
          if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
        // Default comparison
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

    return currentMaintenances;
  };

  // Helper function to get nested property safely
  function getNestedProperty(obj: unknown, key: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;
    const keys = key.split('.');
    let value: unknown = obj;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  }

  // Pagination et affichage (juste avant le return)
  const displayedMaintenances = getFilteredMaintenances();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaintenances = displayedMaintenances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedMaintenances.length / itemsPerPage);
  const totalResults = displayedMaintenances.length;
  const fromResult = totalResults === 0 ? 0 : indexOfFirstItem + 1;
  const toResult = Math.min(indexOfLastItem, totalResults);

  const handleComplete = (maintenance: MaintenanceWithNextDetails) => {
    setMaintenanceToComplete(maintenance);
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (date: string, mileage?: number) => {
    if (!maintenanceToComplete) return;
    try {
      await completeMaintenance(maintenanceToComplete._id, date, mileage);
      toast.success('Maintenance marquée comme réalisée !');
      setCompleteModalOpen(false);
      setMaintenanceToComplete(null);
      fetchMaintenances();
    } catch {
      toast.error('Erreur lors de la validation de la maintenance.');
    }
  };

  return (
    <div className="relative bg-gray-100 min-h-screen mt-16">
      {/* Bouton + flottant en haut à droite */}
      <button
        onClick={handleAddMaintenanceClick}
        className="absolute -top-14 right-6 z-20 p-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200 group"
        title="Ajouter une Maintenance"
      >
        <FontAwesomeIcon icon={faPlus} className="h-6 w-6 text-white" />
      </button>

      {/* Bloc filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
      

        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
          <span className="font-semibold text-lg">Filtres</span>
          
        </div>
        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par véhicule, type ou plaque..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 mb-4"
        />
        {/* Filtres */}
        <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-4">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="automobileId" className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
            <select
              id="automobileId"
              name="automobileId"
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              value={filters.automobileId}
              onChange={handleFilterChange}
            >
              <option value="">Tous les véhicules</option>
              {automobiles.map(auto => (
                <option key={auto._id} value={auto._id}>
                  {auto.brand} {auto.model} ({auto.licensePlate})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type de maintenance</label>
            <select
              id="type"
              name="type"
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Tous les types</option>
              {Object.values(MaintenanceType).map((type) => (
                <option key={type} value={type}>
                  {translateMaintenanceType(type)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex md:ml-auto gap-2 mt-2 md:mt-0">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Bloc tableau */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header titre + badge */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Maintenances</h1>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">{maintenances ? maintenances.length : 0} maintenances</span>
        </div>
        {/* Tabs for All, Due, Upcoming */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-8" aria-label="Tabs">
            <button
              onClick={() => setSelectedTab('all')}
              className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center justify-center ${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-1">
                Toutes
              </span>
            </button>
            <button
               onClick={() => setSelectedTab('due')}
               className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center justify-center ${
                 selectedTab === 'due'
                   ? 'border-red-500 text-red-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
            >
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                Dépassées
              </span>
            </button>
            <button
               onClick={() => setSelectedTab('upcoming')}
               className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center justify-center ${
                 selectedTab === 'upcoming'
                   ? 'border-orange-500 text-orange-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
            >
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faBell} className="text-orange-500" />
                Prochaines
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs md:text-sm flex items-center justify-center ${
                selectedTab === 'completed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                Réalisées
              </span>
            </button>
          </nav>
        </div>

        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl shadow-md overflow-hidden bg-white">
            <thead className="bg-gray-50">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-52">VÉHICULE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">TYPE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DATE RÉALISÉE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KILOMÉTRAGE PROCHAINE ÉCHÉANCE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PROCHAINE ÉCHÉANCE DATE</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUT</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">VALIDER RÉALISATION</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3"></th>
                  </tr>
                </thead>
          <tbody>
            {currentMaintenances.map((maintenance, idx) => (
              <tr
                key={maintenance._id}
                className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
              >
                <td className="px-6 py-4 w-32">
                  <div className="flex items-center gap-3">
                    {maintenance.automobile && typeof maintenance.automobile !== 'string' && maintenance.automobile.images?.[0] && (
                      <img src={maintenance.automobile.images[0]} alt="" className="h-10 w-10 rounded-full object-cover border flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {typeof maintenance.automobile !== 'string' ? `${maintenance.automobile.brand} ${maintenance.automobile.model}` : ''}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {typeof maintenance.automobile !== 'string' ? maintenance.automobile.licensePlate : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 w-32">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
                    {translateMaintenanceType(maintenance.type)}
                  </span>
                </td>
                <td className="px-6 py-4 w-32">
                        <span className="text-sm text-gray-900">
                      {typeof maintenance.date === 'string' && maintenance.date.trim() !== '' && !isNaN(Date.parse(maintenance.date))
                        ? format(new Date(maintenance.date), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                        </span>
                      </td>
                 <td className="px-6 py-4 text-sm text-gray-500">
                    {/* Kilométrage */}
                    {maintenance.nextMaintenanceKilometers ? `${maintenance.nextMaintenanceKilometers} km` : 'N/A'}
                      </td>
                <td className="px-6 py-4 ">
                  {/* Prochaine échéance */}
                  <span className="text-sm text-gray-900">
                    {typeof maintenance.nextMaintenanceDate === 'string' && maintenance.nextMaintenanceDate.trim() !== '' && !isNaN(Date.parse(maintenance.nextMaintenanceDate))
                      ? format(new Date(maintenance.nextMaintenanceDate), 'dd MMM yyyy', { locale: fr })
                      : 'N/A'}
                      </span>
                    </td>
                <td className="px-6 py-4">
                  {maintenance.status === 'COMPLETED' ? (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                      Réalisée
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
                      Non réalisée
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleComplete(maintenance)}
                    className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      maintenance.status === 'COMPLETED'
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    disabled={maintenance.status === 'COMPLETED'}
                  >
                    <span className="sr-only">
                      {maintenance.status === 'COMPLETED' ? 'Déjà réalisée' : 'Valider la réalisation'}
                    </span>
                    <span
                      className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        maintenance.status === 'COMPLETED' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      <span
                        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                          maintenance.status === 'COMPLETED' ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 text-green-500" />
                      </span>
                      <span
                        className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                          maintenance.status === 'COMPLETED' ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                        }`}
                      >
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3 text-gray-400" />
                      </span>
                    </span>
                    {/* Tooltip moderne */}
                    <span className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2 top-8 opacity-0 group-hover:opacity-100 transition bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                      {maintenance.status === 'COMPLETED' ? 'Déjà réalisée' : 'Valider la réalisation'}
                    </span>
                  </button>
                </td>
              <td className="px-6  py-6 flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenDetails(maintenance)}
                   className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Voir les détails"
                        >
                   <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleEdit(maintenance)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Modifier"
                          >
                    <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                    onClick={() => handleDelete(maintenance)}
                    className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                    <FontAwesomeIcon icon={faTrash} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
      {/* Pagination style moderne */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
        {/* Info résultats */}
        <div className="text-gray-600 text-sm">
          Affichage de {fromResult} à {toResult} sur {totalResults} résultat{totalResults > 1 ? 's' : ''}
        </div>
        {/* Pagination + select */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto justify-between">
          <div>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>{n} par page</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1 items-center justify-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1 border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Précédent
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-1 border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
  
      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
      onClose={() => { setIsModalOpen(false); setSelectedMaintenance(null); } } 
        onSubmit={handleSubmit}
      maintenance={selectedMaintenance || undefined} // Pass undefined when adding
      preSelectedAutomobileId={filters.automobileId || undefined} // Use selected filter automobile for pre-selection
      />
  
    {/* Maintenance Details Modal */}
      <MaintenanceDetailsModal
        isOpen={isDetailsModalOpen}
       onClose={() => { setIsDetailsModalOpen(false); setDetailsMaintenance(null); }} 
        maintenance={detailsMaintenance || undefined}
      />

    {/* Complete Maintenance Modal */}
    <CompleteMaintenanceModal
      isOpen={completeModalOpen}
      onClose={() => { setCompleteModalOpen(false); setMaintenanceToComplete(null); }}
      onConfirm={handleConfirmComplete}
      defaultDate={new Date().toISOString().slice(0, 10)}
      defaultMileage={maintenanceToComplete && typeof maintenanceToComplete.automobile !== 'string' ? maintenanceToComplete.automobile.mileage ?? undefined : undefined}
    />

    {/* Delete Maintenance Modal */}
    <DeleteMaintenanceModal
      isOpen={isDeleteModalOpen}
      onClose={() => { setIsDeleteModalOpen(false); setMaintenanceToDelete(null); }}
      onConfirm={confirmDelete}
    />
          </div>
    </div>
  );
};

export default MaintenancePage; 