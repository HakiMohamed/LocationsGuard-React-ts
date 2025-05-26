import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Category, Automobile } from '../../types/automobile.types';
import { XMarkIcon, TagIcon, TruckIcon, CalendarIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { useAutomobile } from '../../contexts/AutomobileContext';

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({ isOpen, onClose, category }) => {
  const { automobiles, loading } = useAutomobile();

  const filteredAutomobiles = useMemo(
    () =>
      category && automobiles
        ? automobiles.filter(auto => {
            if (!auto.category) return false;
            if (typeof auto.category === 'string') {
              return auto.category === category._id;
            } else {
              return auto.category._id === category._id;
            }
          })
        : [],
    [automobiles, category]
  );

  const renderVehicleCard = (auto: Automobile, index: number) => (
    <div
      key={auto._id}
      className="group relative overflow-hidden bg-white border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center space-x-4">
        {/* Vehicle Image */}
        <div className="flex-shrink-0">
          {auto.images && auto.images[0] ? (
            <div className="w-16 h-12 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <img 
                src={auto.images[0]} 
                alt={`${auto.brand} ${auto.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
          ) : (
            <div className="w-16 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-md">
              <TruckIcon className="h-6 w-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 truncate text-sm">
              {auto.brand} {auto.model}
            </h4>
            {auto.year && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                {auto.year}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 font-mono">
            {auto.licensePlate || 'Plaque non renseignée'}
          </p>
        </div>

        {/* Index Badge */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">#{index + 1}</span>
          </div>
        </div>
      </div>
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
    </div>
  );

  if (!category) return null;

  return (
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <TagIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-white mb-1">
                          {category.name}
                        </Dialog.Title>
                        <p className="text-purple-100 text-sm">
                          Détails de la catégorie
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Category Info */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Category Image */}
                      {category.imageUrl && (
                        <div className="sticky top-8">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Image de la catégorie</span>
                            </h4>
                            <div className="relative group">
                              <img 
                                src={category.imageUrl} 
                                alt={category.name}
                                className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Details Cards */}
                      <div className="space-y-4">
                        {/* Description Card */}
                        <div className="group relative overflow-hidden bg-white border border-gray-100 hover:border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <TagIcon className="text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                              <p className="text-gray-900 text-sm leading-relaxed">
                                {category.description || 'Aucune description disponible'}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Statistics Card */}
                        <div className="group relative overflow-hidden bg-white border border-gray-100 hover:border-emerald-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <TruckIcon className="text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nombre de véhicules</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-emerald-600">
                                  {loading ? '...' : filteredAutomobiles.length}
                                </span>
                                <span className="text-sm text-gray-600">
                                  véhicule{filteredAutomobiles.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Vehicles List */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 h-full">
                        <div className="flex items-center space-x-2 mb-6">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Liste des véhicules
                          </h3>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 h-[calc(100%-4rem)]">
                          {loading ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="flex items-center space-x-3 text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-purple-500"></div>
                                <span className="font-medium">Chargement des véhicules...</span>
                              </div>
                            </div>
                          ) : filteredAutomobiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                <TruckIcon className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-gray-600 font-semibold mb-2">Aucun véhicule dans cette catégorie</p>
                              <p className="text-gray-500 text-sm">Les véhicules ajoutés apparaîtront ici</p>
                            </div>
                          ) : (
                            <div className="space-y-3 h-full overflow-y-auto custom-scrollbar pr-2">
                              {filteredAutomobiles.map((auto, index) => renderVehicleCard(auto, index))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Transition>
  );
};

export default CategoryDetailsModal;