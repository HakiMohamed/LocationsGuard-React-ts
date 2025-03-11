import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ArrowLongRightIcon, ArrowLongLeftIcon, CheckIcon, PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useReservation } from '../../contexts/ReservationContext';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useClient } from '../../contexts/ClientContext';
import "react-datepicker/dist/react-datepicker.css";
import {format } from 'date-fns';
import { isWithinInterval, parseISO} from 'date-fns';
import { toast } from 'react-hot-toast';
import ClientModal from '../Clients/ClientModal';
import Input from '../ui/Input';
import { Reservation, ReservationStatus } from '../../types/reservation.types';
import SearchInput from '../ui/SearchInput';
import { useCategory } from '../../contexts/CategoryContext';
import { Automobile } from '../../types/automobile.types';
import { TransmissionType } from '../../types/automobile.types';
import { Category } from '../../types/automobile.types';
import Select from 'react-select';
import DatePickerModal from '../ui/DatePickerModal';







interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
}

interface ReservationFormData {
  client: string;
  automobile: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string;
  status: string;
}

interface FilterInputsProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  categories: Category[];
}

const FilterInputs: React.FC<FilterInputsProps> = ({ filters, setFilters, setCurrentPage, categories }) => {
  const { automobiles } = useAutomobile();

  // Get unique brands from automobiles
  const uniqueBrands = [...new Set(automobiles?.map(auto => auto.brand))].map(brand => ({
    value: brand,
    label: brand
  }));

  const transmissionOptions = [
    { value: '', label: 'Toutes les transmissions' },
    { value: TransmissionType.AUTOMATIC, label: 'Automatique' },
    { value: TransmissionType.MANUAL, label: 'Manuelle' },
    { value: TransmissionType.SEMI_AUTOMATIC, label: 'Semi-automatique' }
  ];

  const fuelTypeOptions = [
    { value: '', label: 'Tous les carburants' },
    { value: 'GASOLINE', label: 'Essence' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'HYBRID', label: 'Hybride' },
    { value: 'ELECTRIC', label: 'Électrique' },
    { value: 'PLUG_IN_HYBRID', label: 'Hybride rechargeable' }
  ];

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...categories.map(category => ({
      value: category._id,
      label: category.name
    }))
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Brand & Price Range */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Marque</label>
        <Select
          isClearable
          options={uniqueBrands}
          value={uniqueBrands.find(option => option.value === filters.brand)}
          onChange={(option) => {
            setFilters(prev => ({ ...prev, brand: option?.value || '' }));
            setCurrentPage(1);
          }}
          placeholder="Filtrer par marque"
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <div className="flex gap-2">
          <Input
            label="Prix min"
            type="number" 
            value={filters.minPrice}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, minPrice: e.target.value }));
              setCurrentPage(1);
            }}
            placeholder="Min DH"
          />
          <Input
            label="Prix max"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, maxPrice: e.target.value }));
              setCurrentPage(1);
            }}
            placeholder="Max DH"
          />
        </div>
      </div>

      {/* Year Range & Transmission */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            label="Année min"
            type="number"
            value={filters.minYear}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, minYear: e.target.value }));
              setCurrentPage(1);
            }}
            placeholder="Min"
          />
          <Input
            label="Année max"
            type="number"
            value={filters.maxYear}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, maxYear: e.target.value }));
              setCurrentPage(1);
            }}
            placeholder="Max"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Transmission</label>
          <Select
            isClearable
            options={transmissionOptions}
            value={transmissionOptions.find(option => option.value === filters.transmission)}
            onChange={(option) => {
              setFilters(prev => ({ ...prev, transmission: option?.value || '' }));
              setCurrentPage(1);
            }}
            placeholder="Sélectionner une transmission"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      {/* Fuel Type & Category */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Carburant</label>
          <Select
            isClearable
            options={fuelTypeOptions}
            value={fuelTypeOptions.find(option => option.value === filters.fuelType)}
            onChange={(option) => {
              setFilters(prev => ({ ...prev, fuelType: option?.value || '' }));
              setCurrentPage(1);
            }}
            placeholder="Sélectionner un carburant"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <Select
            isClearable
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === filters.category)}
            onChange={(option) => {
              setFilters(prev => ({ ...prev, category: option?.value || '' }));
              setCurrentPage(1);
            }}
            placeholder="Sélectionner une catégorie"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>
    </div>
  );
};

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, reservation }) => {
  const { createReservation, updateReservation, getReservationsByAutomobile } = useReservation();
  const { automobiles, fetchAutomobiles } = useAutomobile();
  const { clients, fetchClients, createClient } = useClient();
  const { categories, fetchCategories } = useCategory();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [reservedDates, setReservedDates] = useState<{start: Date, end: Date}[]>([]);
  const [tooltipData, setTooltipData] = useState({ visible: false, text: '', position: { x: 0, y: 0 } });
  const [errorMessage, setErrorMessage] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Filters state
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    transmission: '',
    fuelType: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<ReservationFormData>({
    client: '',
    automobile: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    notes: '',
    status: 'PENDING'
  });

  // Ajoutez ces états pour gérer l'affichage des modals de date
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);

  useEffect(() => {
    fetchAutomobiles();
    fetchClients();
    fetchCategories();
  }, [fetchAutomobiles, fetchClients, fetchCategories]);

  useEffect(() => {
    if (formData.automobile) {
      const fetchReservedDates = async () => {
        try {
          const carReservations = await getReservationsByAutomobile(formData.automobile);
          const dates = carReservations.map((res: Reservation) => ({
            start: parseISO(res.startDate.toString()),
            end: parseISO(res.endDate.toString())
          }));
          setReservedDates(dates);
        } catch (error) {
          console.error('Error fetching reserved dates:', error);
        }
      };
      fetchReservedDates();
    }
  }, [formData.automobile, getReservationsByAutomobile]);

  const isDateReserved = (date: Date) => {
    // Skip check for currently selected dates
    if (formData.startDate && formData.endDate &&
        isWithinInterval(date, { start: formData.startDate, end: formData.endDate })) {
      return false;
    }
    
    return reservedDates.some(interval => 
      isWithinInterval(date, { start: interval.start, end: interval.end })
    );
  };

  const showTooltip = (text: string, e: React.MouseEvent) => {
    setTooltipData({
      visible: true,
      text,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const hideTooltip = () => {
    setTooltipData(prev => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const reservationData = {
        startDate: formData.startDate || new Date(),
        endDate: formData.endDate || new Date(),
        status: formData.status as ReservationStatus,
        client: formData.client,
        automobile: formData.automobile,
        notes: formData.notes,
        // À calculer selon votre logique
        isPaid: false,
       
      };

      if (reservation) {
        await updateReservation(reservation._id, reservationData);
        toast.success('Réservation mise à jour avec succès');
      } else {
        await createReservation(reservationData);
        toast.success('Réservation créée avec succès');
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters to the automobiles
  const applyFilters = useCallback((autos: Automobile[]) => {
    return autos?.filter(auto => {
      // Apply brand filter if specified
      if (filters.brand && !auto.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }
      
      // Apply price filters if specified
      if (filters.minPrice && auto.dailyRate < parseInt(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && auto.dailyRate > parseInt(filters.maxPrice)) {
        return false;
      }
      
      // Apply year filters if specified
      if (filters.minYear && auto.year < parseInt(filters.minYear)) {
        return false;
      }
      if (filters.maxYear && auto.year > parseInt(filters.maxYear)) {
        return false;
      }
      
      // Apply transmission filter if specified
      if (filters.transmission && auto.transmission !== filters.transmission) {
        return false;
      }
      
      // Apply fuelType filter if specified
      if (filters.fuelType && auto.fuelType !== filters.fuelType) {
        return false;
      }
      
      // Apply category filter if specified
      if (filters.category && (typeof auto.category === 'string' ? auto.category : auto.category._id) !== filters.category) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  // Apply search and filters and get automobiles for current page
  const getFilteredAndPaginatedAutomobiles = useCallback(() => {
    // Apply search filter first
    let filtered = automobiles?.filter(auto => 
      auto.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auto.model.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    // Then apply all other filters
    filtered = applyFilters(filtered);
    
    // Get total pages for pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
    
    // Return current page items
    return {
      autos: filtered.slice(startIndex, endIndex),
      totalPages,
      totalItems: filtered.length
    };
  }, [automobiles, searchTerm, currentPage, itemsPerPage, applyFilters]);

  const { autos: filteredAutomobiles, totalPages, totalItems } = getFilteredAndPaginatedAutomobiles();

  const filteredClients = clients?.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleCreateClient = async (clientData: FormData) => {
    try {
      setLoading(true);
      await createClient(clientData);
      await fetchClients();
      setIsClientModalOpen(false);
      toast.success('Client créé avec succès');
      
      const newClient = clients.find(c => c.email === clientData.get('email'));
      if (newClient) {
        setFormData(prev => ({ ...prev, client: newClient._id }));
      }
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
    } finally {
      setLoading(false);
    }
  };

//   // Function to get unique values for filter dropdowns
//   const getUniqueValues = (field) => {
//     if (!automobiles) return [];
//     const values = automobiles.map(auto => auto[field]);
//     return [...new Set(values)].filter(Boolean);
//   };

  // Function to handle next step with validation
  const handleNextStep = () => {
    if (currentStep === 1 && !formData.automobile) {
      setErrorMessage("Veuillez sélectionner un véhicule avant de continuer");
      return;
    }
    
    if (currentStep === 2 && !formData.client) {
      setErrorMessage("Veuillez sélectionner un client avant de continuer");
      return;
    }
    
    if (currentStep === 3 && (!formData.startDate || !formData.endDate)) {
      setErrorMessage("Veuillez sélectionner les dates de réservation");
      return;
    }
    
    setErrorMessage("");
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  // Mise à jour du style du DatePicker
  const datePickerCustomStyles = {
    input: "w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    calendar: "!font-sans !text-base !border-0 !shadow-2xl !rounded-2xl !p-6 !bg-white !mt-2",
    dayButton: "!w-12 !h-12 !m-1 hover:!bg-gray-50 rounded-xl",
    selectedDay: "!bg-indigo-500 !text-white hover:!bg-indigo-600",
    currentMonth: "!text-lg !font-semibold !mb-4",
    navigationButton: "!p-2 hover:!bg-gray-100 !rounded-full",
  };

  // Mise à jour du renderDayContents
  const renderDayContents = (day: number, date: Date) => {
    const dateObj = new Date(date);
    const isReserved = isDateReserved(dateObj);
    
    return (
      <div className={`
        relative flex items-center justify-center w-12 h-12 rounded-xl
        transition-all duration-200 group text-base
        ${isReserved 
          ? 'bg-red-50 text-gray-400 cursor-not-allowed' 
          : 'hover:bg-indigo-50 cursor-pointer'
        }
      `}>
        <span className={isReserved ? 'line-through' : ''}>{day}</span>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 
          bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 
          transition-opacity whitespace-nowrap pointer-events-none z-50">
          {isReserved ? 'Réservé' : 'Disponible'}
        </div>
      </div>
    );
  };

  // Define custom styles for the datepicker
  const datePickerWrapperStyle = {
    position: 'relative' as const,
    width: '100%'
  };

  const datePickerInputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '0.75rem',
    border: '1px solid rgb(229, 231, 235)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontSize: '0.875rem'
  };

  const steps = [
    {
      title: "Sélection du véhicule",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                label="Recherche"
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher par marque, modèle..."
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
                className="w-full"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all duration-300 shadow-md"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres {showFilters ? "actifs" : ""}
              {Object.values(filters).some(value => value !== '') && !showFilters && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                  {Object.values(filters).filter(value => value !== '').length}
                </span>
              )}
            </button>
          </div>
          
          {/* Filters section */}
          {showFilters && (
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-5 animate-slideDown">
              <h4 className="font-medium text-gray-800 mb-4">Filtres avancés</h4>
             
                <FilterInputs filters={filters} setFilters={setFilters} setCurrentPage={setCurrentPage} categories={categories} />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setFilters({
                      brand: '',
                      minPrice: '',
                      maxPrice: '',
                      minYear: '',
                      maxYear: '',
                      transmission: '',
                      fuelType: '',
                      category: ''
                    });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
          
          {/* Results info */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              {totalItems} véhicule{totalItems !== 1 ? 's' : ''} trouvé{totalItems !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-2">
              <span>Afficher:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border-gray-200 text-sm"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          {/* Vehicle grid with animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {filteredAutomobiles?.length > 0 ? (
              filteredAutomobiles.map((auto, index) => (
                <div
                  key={auto._id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, automobile: auto._id }));
                    setErrorMessage("");
                  }}
                  className={`
                    relative overflow-hidden rounded-2xl transition-all duration-300 
                    ${formData.automobile === auto._id
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 transform scale-[1.02] shadow-lg'
                      : 'bg-white hover:bg-indigo-50/20 shadow-md hover:shadow-lg'
                    }
                    animate-fadeIn
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {auto.images && auto.images[0] ? (
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <img
                        src={auto.images[0]}
                        alt={`${auto.brand} ${auto.model}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                        {categories.find(cat => cat._id === (typeof auto.category === 'string' ? auto.category : auto.category._id))?.name}
                      </div>
                      {formData.automobile === auto._id && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-md">
                          <CheckIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gray-100 rounded-t-2xl flex items-center justify-center">
                      <span className="text-gray-400">Aucune image</span>
                      {formData.automobile === auto._id && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-md">
                          <CheckIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg">{auto.brand} {auto.model}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500">Année: {auto.year}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          auto.transmission === TransmissionType.AUTOMATIC ? 'bg-purple-500' : 'bg-blue-500'
                        }`}></span>
                        {auto.transmission || TransmissionType.MANUAL}
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {auto.fuelType && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {auto.fuelType}
                        </span>
                      )}
                      {auto.seats && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {auto.seats} places
                        </span>
                      )}
                      {auto.features.includes('Climatisation') && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          Climatisation
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-base font-bold text-indigo-600">{auto.dailyRate} DH<span className="text-sm font-normal">/jour</span></p>
                      {formData.automobile === auto._id ? (
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">Sélectionné</span>
                      ) : (
                        <button className="text-xs bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-800 px-3 py-1 rounded-full transition-colors">
                          Sélectionner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucun véhicule trouvé</h3>
                <p className="mt-2 text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
                {Object.values(filters).some(filter => filter !== '') && (
                  <button
                    onClick={() => {
                      setFilters({
                        brand: '',
                        minPrice: '',
                        maxPrice: '',
                        minYear: '',
                        maxYear: '',
                        transmission: '',
                        fuelType: '',
                        category: ''
                      });
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> sur{' '}
                    <span className="font-medium">{totalItems}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Précédent</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === i + 1
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Suivant</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Sélection du client",
      content: (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <SearchInput
              value={clientSearchTerm}
              onChange={(value: string) => setClientSearchTerm(value)}
              placeholder="Rechercher un client..."
              className="flex-1"
            />
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau client
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients?.map((client) => (
              <div
                key={client._id}
                onClick={() => {
                  setFormData(prev => ({ ...prev, client: client._id }));
                  setErrorMessage("");
                }}
                className={`                  p-4 rounded-xl cursor-pointer transition-all duration-300
                  ${formData.client === client._id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 transform scale-[1.02]'
                    : 'bg-white hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {client.firstName} {client.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phoneNumber}</p>
                  </div>
                  {formData.client === client._id && (
                    <CheckIcon className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Dates de réservation",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <button
                onClick={() => setIsStartDateModalOpen(true)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {formData.startDate ? format(formData.startDate, 'dd/MM/yyyy') : 'Sélectionner une date'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <button
                onClick={() => setIsEndDateModalOpen(true)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {formData.endDate ? format(formData.endDate, 'dd/MM/yyyy') : 'Sélectionner une date'}
              </button>
            </div>
          </div>

          <div>
            <Input
              type="textarea"
              label="Notes (optionnel)"
              value={formData.notes}
              onChange={(e) => setFormData((prev: ReservationFormData) => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Ajoutez des notes concernant cette réservation..."
            />
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    {reservation ? 'Modifier la réservation' : 'Nouvelle réservation'}
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        {steps.map((step, index) => (
                          <button
                            key={step.title}
                            onClick={() => setCurrentStep(index + 1)}
                            className={`                              whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                              ${currentStep === index + 1
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            {step.title}
                          </button>
                        ))}
                      </nav>
                    </div>

                    <div className="mt-6">
                      {steps[currentStep - 1].content}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                      disabled={currentStep === 1}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLongLeftIcon className="h-5 w-5 mr-2" />
                      Précédent
                    </button>

                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Suivant
                        <ArrowLongRightIcon className="h-5 w-5 ml-2" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            Confirmer
                            <CheckIcon className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSubmit={handleCreateClient}
      />

      {tooltipData.visible && (
        <div
          style={{
            position: 'fixed',
            top: tooltipData.position.y + 20,
            left: tooltipData.position.x + 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {tooltipData.text}
        </div>
      )}

      <DatePickerModal
        isOpen={isStartDateModalOpen}
        onClose={() => setIsStartDateModalOpen(false)}
        selectedDate={formData.startDate}
        onChange={(date) => {
          setFormData(prev => ({ ...prev, startDate: date }));
          setIsStartDateModalOpen(false);
        }}
        startDate={formData.startDate}
        endDate={formData.endDate}
        minDate={new Date()}
        isStart={true}
        filterDate={(date) => !isDateReserved(date)}
      />

      <DatePickerModal
        isOpen={isEndDateModalOpen}
        onClose={() => setIsEndDateModalOpen(false)}
        selectedDate={formData.endDate}
        onChange={(date) => {
          setFormData(prev => ({ ...prev, endDate: date }));
          setIsEndDateModalOpen(false);
        }}
        startDate={formData.startDate}
        endDate={formData.endDate}
        minDate={formData.startDate || new Date()}
        isStart={false}
        filterDate={(date) => !isDateReserved(date)}
      />
    </>
  );
};

export default ReservationModal;


