import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLongRightIcon, ArrowLongLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Fragment } from 'react';
import { Maintenance, MaintenanceType } from '../../types/maintenance.types';
import { useAutomobile } from '../../contexts/AutomobileContext';
import Input from '../ui/Input';
import { CreateMaintenancePayload } from '../../services/maintenance.service';

interface MaintenanceModalProps {  
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaintenancePayload) => Promise<void>;
  maintenance?: Maintenance;
  preSelectedAutomobileId?: string;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  maintenance,
  preSelectedAutomobileId 
}) => {
  const { automobiles } = useAutomobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const vehiclesPerPage = 4;

  // Filtrer les véhicules en fonction du terme de recherche
  const filteredVehicles = automobiles.filter(auto => {
    const searchLower = searchTerm.toLowerCase();
    return (
      auto.brand.toLowerCase().includes(searchLower) ||
      auto.model.toLowerCase().includes(searchLower) ||
      auto.licensePlate.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const [formData, setFormData] = useState({
    automobile: preSelectedAutomobileId || '',
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    technician: '',
    notes: '',
    client: ''
  });

  // Reset pagination and search when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Initialize form data when maintenance prop changes
  useEffect(() => {
    if (maintenance) {
      setFormData({
        automobile: typeof maintenance.automobile === 'string' 
          ? maintenance.automobile 
          : maintenance.automobile._id,
        type: maintenance.type,
        description: maintenance.description || '',
        date: maintenance.date || new Date().toISOString().split('T')[0],
        cost: maintenance.cost?.toString() || '',
        technician: maintenance.technician || '',
        notes: maintenance.notes || '',
        client: maintenance.client || ''
      });
    } else {
      // Reset form when no maintenance is provided
      setFormData({
        automobile: preSelectedAutomobileId || '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        technician: '',
        notes: '',
        client: ''
      });
    }
    setCurrentStep(1);
  }, [maintenance, isOpen, preSelectedAutomobileId]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: CreateMaintenancePayload = {
        automobile: formData.automobile,
        type: formData.type,
        description: formData.description,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      };
      if (formData.cost) payload.cost = Number(formData.cost);
      if (formData.technician) payload.technician = formData.technician;
      if (formData.notes) payload.notes = formData.notes;
      if (formData.client) payload.client = formData.client;
      await onSubmit(payload);
      onClose();
    } catch {
      toast.error('Une erreur est survenue lors de la soumission du formulaire.');
    } finally {
      setLoading(false);
    }
  };

  // Validate and move to next step
  const nextStep = () => {
    if (currentStep === 1 && !formData.automobile) {
      toast.error('Veuillez sélectionner un véhicule.');
      return;
    }
    
    if (currentStep === 2 && !formData.type) {
      toast.error('Veuillez sélectionner un type de maintenance.');
      return;
    }
    
    setCurrentStep((prev) => prev + 1);
  };

  // Steps configuration
  const steps = [
    {
      title: 'Sélection du véhicule',
      description: 'Choisir le véhicule concerné',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
            
            {/* Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par marque, modèle ou plaque..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Grille de véhicules */}
            {currentVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentVehicles.map((auto) => (
                  <button
                    key={auto._id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, automobile: auto._id }))}
                    className={`flex items-center gap-3 w-full p-3 border rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${formData.automobile === auto._id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
                  >
                    <img
                      src={auto.images && auto.images.length > 0 ? auto.images[0] : '/default-car.png'}
                      alt={auto.brand + ' ' + auto.model}
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold text-gray-800">{auto.brand} {auto.model}</span>
                      <span className="text-xs text-gray-500">{auto.licensePlate}</span>
                    </div>
                    {formData.automobile === auto._id && (
                      <CheckIcon className="h-5 w-5 text-blue-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M3 8h18M3 12h18" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">Aucun véhicule trouvé</h3>
                <p className="text-sm text-gray-500">Aucun véhicule ne correspond à votre recherche.</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Affichage de {indexOfFirstVehicle + 1} à {Math.min(indexOfLastVehicle, filteredVehicles.length)} sur {filteredVehicles.length} véhicules
                </div>
              </div>
            )}

            {formData.automobile === '' && (
              <p className="text-xs text-red-500 mt-2">Veuillez sélectionner un véhicule.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Type de maintenance',
      description: 'Détails de la maintenance',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de maintenance *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as MaintenanceType }))}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {Object.values(MaintenanceType).map((type) => (
                <option key={type} value={type}>
                  {type === MaintenanceType.VIDANGE ? 'Vidange' :
                   type === MaintenanceType.FILTRE_AIR ? 'Filtre à air' :
                   type === MaintenanceType.FILTRE_HUILE ? 'Filtre à huile' :
                   type === MaintenanceType.FILTRE_CARBURANT ? 'Filtre à carburant' :
                   type === MaintenanceType.FREINS ? 'Freins' :
                   type === MaintenanceType.PNEUS ? 'Pneus' :
                   type === MaintenanceType.AUTRE ? 'Autre' : type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Détails supplémentaires sur la maintenance..."
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Détails de la maintenance',
      description: 'Informations complémentaires',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="technician"
              label="Technicien"
              type="text"
              value={formData.technician}
              onChange={(e) => setFormData((prev) => ({ ...prev, technician: e.target.value }))}
              placeholder="Nom du technicien"
            />
            <Input
              id="date"
              label="Date de réalisation"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <Input
            id="cost"
            label="Coût de la maintenance"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
            placeholder="Coût total de la maintenance"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Notes supplémentaires..."
            />
          </div>
        </div>
      ),
    }
  ];

  return (
    <>
      <Transition show={isOpen} as={Fragment}>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-xl bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      {maintenance ? 'Modifier la maintenance' : 'Ajouter une maintenance'}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="px-6 py-6">
                    {/* Progress Steps */}
                    <div className="mb-8 hidden md:block">
                      <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                          <React.Fragment key={step.title}>
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  currentStep > index + 1
                                    ? 'bg-blue-600 text-white'
                                    : currentStep === index + 1
                                    ? 'border-2 border-blue-600 text-blue-600'
                                    : 'border-2 border-gray-300 text-gray-300'
                                } transition-colors duration-200`}
                              >
                                {currentStep > index + 1 ? (
                                  <CheckIcon className="h-5 w-5" />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <p
                                  className={`text-sm font-medium ${
                                    currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                                  }`}
                                >
                                  {step.title}
                                </p>
                                <p
                                  className={`text-xs ${
                                    currentStep >= index + 1 ? 'text-gray-500' : 'text-gray-400'
                                  }`}
                                >
                                  {step.description}
                                </p>
                              </div>
                            </div>
                            {index < steps.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 ${
                                  currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Steps Indicator */}
                    <div className="md:hidden mb-6">
                      <p className="text-sm font-medium text-gray-500">
                        Étape {currentStep} sur {steps.length}
                      </p>
                      <h3 className="text-lg font-medium text-gray-900">{steps[currentStep - 1].title}</h3>
                      <p className="text-sm text-gray-500">{steps[currentStep - 1].description}</p>
                      <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                        <div
                          className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${(currentStep / steps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[300px]">{steps[currentStep - 1].content}</div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                        className={`${
                          currentStep === 1 ? 'invisible' : ''
                        } flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors`}
                      >
                        <ArrowLongLeftIcon className="h-5 w-5 mr-1" />
                        Précédent
                      </button>
                      {currentStep < steps.length ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Suivant
                          <ArrowLongRightIcon className="h-5 w-5 ml-1" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Traitement...
                            </>
                          ) : (
                            <>
                              {maintenance ? 'Modifier' : 'Créer'}
                              <CheckIcon className="h-5 w-5 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MaintenanceModal;