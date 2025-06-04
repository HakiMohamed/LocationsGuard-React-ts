import React, { useEffect, useState, useCallback } from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import { Category } from '../../types/automobile.types';
import { toast } from 'react-hot-toast';
import CategoryModal from '../../components/categories/CategoryModal';
import { automobileService } from '../../services/automobile.service';
import CategoryDetailsModal from '../../components/categories/CategoryDetailsModal';
import { EyeIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const CategoriesPage: React.FC = () => {
  const { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryCount, setCategoryCount] = useState<Record<string, number>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadAutomobileCounts = useCallback(async () => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
      try {
        const count = await automobileService.getCountByCategory(category._id);
        counts[category._id] = count;
      } catch (error) {
        console.error(`Error fetching count for category ${category._id}:`, error);
        counts[category._id] = 0;
      }
    }
    setCategoryCount(counts);
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      loadAutomobileCounts();
    }
  }, [categories, loadAutomobileCounts]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete._id);
      toast.success('Catégorie supprimée avec succès');
      await fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (selectedCategory) {
      await updateCategory(selectedCategory._id, formData);
      toast.success('Catégorie mise à jour avec succès');
    } else {
      await createCategory(formData);
      toast.success('Catégorie créée avec succès');
    }
    setIsModalOpen(false);
    setSelectedCategory(null);
    await fetchCategories();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header modernisé */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Catégories
            </h1>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
              {categories.length} catégorie{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''}
            </p>
          </div>
          

          <button
          onClick={() => setIsModalOpen(true)}
          className="group relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
          title="Créer une catégorie"
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
      </div>

      {/* Main content avec design moderne */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error.message}</p>
              <button 
                onClick={() => fetchCategories()}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Aucune catégorie trouvée</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Créer votre première catégorie
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category);
                  setShowDetailsModal(true);
                }}
              >
                <div className="relative aspect-video rounded-t-xl overflow-hidden">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-medium group-hover:scale-110 transition-transform duration-300">
                      {getInitials(category.name)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setShowDetailsModal(true);
                                  }}
                                  className={`${
                                    active ? 'bg-gray-50' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                >
                                  <EyeIcon className="h-5 w-5 mr-2 text-cyan-600" />
                                  Voir les détails
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEdit(category)}
                                  className={`${
                                    active ? 'bg-gray-50' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                >
                                  <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Modifier
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteClick(category)}
                                  className={`${
                                    active ? 'bg-gray-50' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                                >
                                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Supprimer
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {categoryCount[category._id] || 0} automobile{categoryCount[category._id] !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Les modals restent les mêmes */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmit}
        category={selectedCategory || undefined}
      />

      {/* Modal de suppression modernisé */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Supprimer la catégorie
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ? Cette action ne peut pas être annulée.
                    </p>
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p className="ml-3 text-sm text-red-700">
                          Cette action supprimera également toutes les automobiles associées à cette catégorie.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={handleDeleteConfirm}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CategoryDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory || undefined}
      />
    </div>
  );
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default CategoriesPage; 