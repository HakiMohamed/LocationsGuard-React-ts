//pages/admin/AutomobilesPage.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { Automobile, Category } from '../../types/automobile.types';
import { toast } from 'react-hot-toast';
import AutomobileModal from '../../components/Automobiles/AutomobileModal';
import AutomobileDetailsModal from '../../components/Automobiles/AutomobileDetailsModal';
import { categoryService } from '../../services/category.service';

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

const AutomobilesPage: React.FC = () => {
  const { automobiles, loading, error, fetchAutomobiles, createAutomobile, updateAutomobile, deleteAutomobile, updateAvailability } = useAutomobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAutomobile, setSelectedAutomobile] = useState<Automobile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsAutomobile, setDetailsAutomobile] = useState<Automobile | null>(null);
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    year: '',
    isAvailable: ''
  });
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [automobilesWithCategories, setAutomobilesWithCategories] = useState<Automobile[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [automobileToDelete, setAutomobileToDelete] = useState<Automobile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAutomobiles();
    fetchCategories();
  }, [fetchAutomobiles]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  useEffect(() => {
    if (automobiles && automobiles.length > 0 && categories.length > 0) {
      const enrichedAutomobiles = automobiles.map(auto => {
        // Si automobile.category est un objet avec _id, on utilise cet ID pour trouver la catégorie complète
        const categoryId = typeof auto.category === 'string' ? auto.category : auto.category?._id;
        
        if (categoryId) {
          const category = categories.find(cat => cat._id === categoryId);
          return {
            ...auto,
            category: category || auto.category
          };
        }
        return auto;
      });
      
      setAutomobilesWithCategories(enrichedAutomobiles);
    } else {
      setAutomobilesWithCategories(automobiles || []);
    }
  }, [automobiles, categories]);

  const handleEdit = (automobile: Automobile) => {
    setSelectedAutomobile(automobile);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomobile(id);
      toast.success('Automobile supprimée avec succès');
      setIsDeleteModalOpen(false);
      setAutomobileToDelete(null);
      await fetchAutomobiles();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (selectedAutomobile) {
        await updateAutomobile(selectedAutomobile._id, data);
        toast.success('Automobile mise à jour avec succès');
      } else {
        await createAutomobile(data);
        toast.success('Automobile créée avec succès');
      }
      setIsModalOpen(false);
      setSelectedAutomobile(null);
      await fetchAutomobiles();
    } catch (error: Error | unknown) {
      console.error('Error:', error);
      const errorMessage = ((error as ApiError).response?.data?.message) || 'Une erreur est survenue';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleOpenDetails = async (automobile: Automobile) => {
    try {
      // Si la catégorie est juste un ID, récupérer les détails complets
      if (typeof automobile.category === 'string') {
        const categoryDetails = await categoryService.getOne(automobile.category);
        setDetailsAutomobile({
          ...automobile,
          category: categoryDetails
        });
      } else {
        setDetailsAutomobile(automobile);
      }
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching category details:', error);
      setDetailsAutomobile(automobile);
      setIsDetailsModalOpen(true);
    }
  };

  const handleAvailabilityChange = async (id: string, isAvailable: boolean) => {
    try {
      await updateAvailability(id, isAvailable);
      toast.success('Disponibilité mise à jour avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour de la disponibilité');
    }
  };

  const handleImageClick = (imageUrl: string, index: number) => {
    setFullscreenImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = (images: string[]) => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev - 1;
      if (newIndex < 0) return images.length - 1;
      return newIndex;
    });
    setFullscreenImage(images[currentImageIndex]);
  };

  const handleNextImage = (images: string[]) => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
    setFullscreenImage(images[currentImageIndex]);
  };

  // Get unique values for filters
  const uniqueBrands = Array.from(new Set(automobilesWithCategories?.map(auto => auto.brand) || [])).filter(Boolean).sort();
  const uniqueCategories = Array.from(new Set(automobilesWithCategories?.map(auto => {
    if (typeof auto.category === 'object' && auto.category !== null) {
      return auto.category.name;
    }
    return null;
  }) || [])).filter((category): category is string => category !== null).sort();
  const uniqueYears = Array.from(new Set(automobilesWithCategories?.map(auto => {
    // Ensure the year is defined and is a number before calling toString
    return auto.year !== undefined && auto.year !== null ? auto.year.toString() : null;
  }) || [])).filter(Boolean).sort((a, b) => parseInt(b) - parseInt(a));

  // Apply filters and search
  const filteredAutomobiles = useMemo(() => {
    return Array.isArray(automobilesWithCategories) ? automobilesWithCategories.filter(automobile => {
      const matchesSearch = !searchTerm || 
        (automobile.brand && automobile.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (automobile.model && automobile.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (automobile.licensePlate && automobile.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBrand = !filters.brand || automobile.brand === filters.brand;
      
      const categoryName = typeof automobile.category === 'object' && automobile.category !== null 
        ? automobile.category.name 
        : '';
      const matchesCategory = !filters.category || categoryName === filters.category;
      
      const matchesYear = !filters.year || automobile.year?.toString() === filters.year;
      const matchesAvailability = !filters.isAvailable || 
        (filters.isAvailable === 'true' ? automobile.isAvailable : !automobile.isAvailable);
      
      return matchesSearch && matchesBrand && matchesCategory && matchesYear && matchesAvailability;
    }) : [];
  }, [automobilesWithCategories, searchTerm, filters]);

  // Apply sorting
  if (sortConfig !== null) {
    filteredAutomobiles.sort((a, b) => {
      // Handle nested properties like category.name
      const getNestedProperty = (obj: any, key: string) => {
        const keys = key.split('.');
        return keys.reduce((o, k) => {
          if (k === 'category' && typeof o[k] === 'object' && o[k] !== null) {
            return o[k];
          } else if (k === 'name' && typeof o === 'object' && o !== null) {
            return o.name || '';
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

  // Cette partie du code gère les filtres dans le composant AutomobilesPage
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      brand: '',
      category: '',
      year: '',
      isAvailable: ''
    });
    setSearchTerm('');
  };

  // Calcul des automobiles paginées
  const paginatedAutomobiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAutomobiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAutomobiles, currentPage]);

  return (
    <div className="container mx-auto ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des Automobiles</h1>
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
              <span className="text-blue-600 font-semibold">{filteredAutomobiles.length}</span>
              <span className="ml-2 text-gray-600">automobile{filteredAutomobiles.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Rechercher par marque ou modèle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
          title="Ajouter une automobile"
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

      {/* Main content */}
      <div className="bg-white rounded-lg shadow">
        {/* Cette partie du JSX affiche les filtres dans l'interface */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="w-full md:w-1/4">
              <Combobox
                id="brand"
                name="brand"
                label="Marque"
                options={uniqueBrands}
                value={filters.brand}
                onChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}
                placeholder="Toutes les marques"
              />
            </div>
            <div className="w-full md:w-1/4">
              <Combobox
                id="category"
                name="category"
                label="Catégorie"
                options={uniqueCategories}
                value={filters.category}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                placeholder="Toutes les catégories"
              />
            </div>
            <div className="w-full md:w-1/4">
              <Combobox
                id="year"
                name="year"
                label="Année"
                options={uniqueYears}
                value={filters.year}
                onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
                placeholder="Toutes les années"
              />
            </div>
            <div className="w-full md:w-1/4">
              <select
                id="isAvailable"
                name="isAvailable"
                value={filters.isAvailable}
                onChange={handleFilterChange}
                className="w-full mt-0 md:mt-6 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes</option>
                <option value="true">Disponibles</option>
                <option value="false">Indisponibles</option>
              </select>
            </div>
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-center">
              <p>{error}</p>
            </div>
          </div>
        ) : filteredAutomobiles.length === 0 ? (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                />
              </svg>
              <p>Aucune automobile trouvée</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('brand')}
                  >
                    <div className="flex items-center">
                      Marque
                      {sortConfig?.key === 'brand' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('model')}
                  >
                    <div className="flex items-center">
                      Modèle
                      {sortConfig?.key === 'model' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('year')}
                  >
                    <div className="flex items-center">
                      Année
                      {sortConfig?.key === 'year' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('category.name')}
                  >
                    <div className="flex items-center">
                      Catégorie
                      {sortConfig?.key === 'category.name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('dailyRate')}
                  >
                    <div className="flex items-center">
                      Tarif
                      {sortConfig?.key === 'dailyRate' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('isAvailable')}
                  >
                    <div className="flex items-center">
                      Disponibilité
                      {sortConfig?.key === 'isAvailable' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAutomobiles.map((automobile) => (
                  <tr key={automobile._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {automobile.images && automobile.images.length > 0 ? (
                          <img 
                            src={automobile.images[0]} 
                            alt={automobile.brand} 
                            className="h-16 w-30 max-w-30 rounded  object-cover mr-3 cursor-pointer hover:opacity-75"
                            onClick={() => handleImageClick(automobile.images[0], 0)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{automobile.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{automobile.model}</div>
                      <div className="text-xs text-gray-500">{automobile.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {automobile.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {typeof automobile.category === 'object' && automobile.category !== null 
                          ? automobile.category.name 
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {automobile.dailyRate} DH/jour
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={automobile.isAvailable !== undefined ? automobile.isAvailable.toString() : 'false'}
                        onChange={(e) => handleAvailabilityChange(automobile._id, e.target.value === 'true')}
                        className={`px-2 py-1 text-xs font-semibold rounded-full w-39 border-0 
                          ${automobile.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        <option className="bg-green-100 text-green-800" value="true">Disponible</option>
                        <option className="bg-red-100 text-red-800" value="false">Indisponible</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenDetails(automobile)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                          title="Voir les détails"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(automobile)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors"
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setAutomobileToDelete(automobile);
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

      {/* Pagination - can be added if needed */}
      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
        <div className="flex-1 flex justify-between items-center mb-4 sm:mb-0">
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> à{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredAutomobiles.length)}
            </span>{' '}
            sur <span className="font-medium">{filteredAutomobiles.length}</span> résultats
          </p>
        </div>
        
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Précédent</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {Array.from({ length: Math.ceil(filteredAutomobiles.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === i + 1
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAutomobiles.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(filteredAutomobiles.length / itemsPerPage)}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
              currentPage === Math.ceil(filteredAutomobiles.length / itemsPerPage)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
          >
            <span className="sr-only">Suivant</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Modal */}
      <AutomobileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAutomobile(null);
        }}
        onSubmit={handleSubmit}
        automobile={selectedAutomobile || undefined}
      />

      {/* Details Modal */}
      <AutomobileDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsAutomobile(null);
        }}
        automobile={detailsAutomobile || undefined}
      />

      {/* Ajoutez le modal d'image plein écran */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {detailsAutomobile?.images && detailsAutomobile.images.length > 1 && (
            <>
              <button
                onClick={() => handlePrevImage(detailsAutomobile.images)}
                className="absolute left-4 text-white hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleNextImage(detailsAutomobile.images)}
                className="absolute right-4 text-white hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <img
            src={fullscreenImage}
            alt="Full screen"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {isDeleteModalOpen && (
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
                    <p className="text-sm text-gray-500 mb-2">
                      Êtes-vous sûr de vouloir supprimer cette automobile ? Cette action est irréversible.
                    </p>
                    <p className="text-sm font-medium text-red-500">
                      Attention : La suppression de cette automobile entraînera également la suppression de toutes les réservations liées à ce véhicule.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => automobileToDelete && handleDelete(automobileToDelete._id)}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAutomobileToDelete(null);
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

export default AutomobilesPage; 