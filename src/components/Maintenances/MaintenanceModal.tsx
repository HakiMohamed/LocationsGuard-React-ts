import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLongRightIcon, ArrowLongLeftIcon, CheckIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Fragment } from 'react';
import { Maintenance, MaintenanceType, MaintenanceStatus } from '../../types/maintenance.types';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';

interface MaintenanceModalProps {  
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
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
  const { getApplicableMaintenanceTypes } = useMaintenance();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicableTypes, setApplicableTypes] = useState<{ type: MaintenanceType; description: string }[]>([]);
  const [formData, setFormData] = useState({
    automobile: preSelectedAutomobileId || '',
    type: '',
    description: '',
    performedBy: '',
    completedDate: '',
    mileageAtMaintenance: '',
    cost: '',
    status: MaintenanceStatus.SCHEDULED,
    invoiceDocuments: [] as File[]
  });

  // Initialize form data when maintenance prop changes
  useEffect(() => {
    if (maintenance) {
      setFormData({
        automobile: typeof maintenance.automobile === 'string' 
          ? maintenance.automobile 
          : maintenance.automobile._id,
        type: maintenance.type,
        description: maintenance.description || '',
        performedBy: maintenance.performedBy || '',
        completedDate: maintenance.completedDate 
          ? new Date(maintenance.completedDate).toISOString().split('T')[0] 
          : '',
        mileageAtMaintenance: maintenance.mileageAtMaintenance?.toString() || '',
        cost: maintenance.cost?.toString() || '',
        status: maintenance.status,
        invoiceDocuments: []
      });
    } else {
      // Reset form when no maintenance is provided
      setFormData({
        automobile: preSelectedAutomobileId || '',
        type: '',
        description: '',
        performedBy: '',
        completedDate: '',
        mileageAtMaintenance: '',
        cost: '',
        status: MaintenanceStatus.SCHEDULED,
        invoiceDocuments: []
      });
    }
    setCurrentStep(1);
  }, [maintenance, isOpen, preSelectedAutomobileId]);

  // Fetch applicable maintenance types when automobile is selected
  useEffect(() => {
    const fetchApplicableTypes = async () => {
      if (formData.automobile) {
        try {
          const types = await getApplicableMaintenanceTypes(formData.automobile);
          setApplicableTypes(types);
        } catch (error) {
          console.error('Error fetching applicable maintenance types:', error);
        }
      }
    };

    fetchApplicableTypes();
  }, [formData.automobile, getApplicableMaintenanceTypes]);

  // Handle file changes for invoice documents
  const handleFileChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      invoiceDocuments: files
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields to FormData with proper type conversion
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'invoiceDocuments') {
          // Append invoice documents
          (value as File[]).forEach(file => {
            formDataToSend.append('invoiceDocuments', file);
          });
        } else if (value !== null && value !== undefined && value !== '') {
          // Convert numeric fields to numbers
          if (key === 'cost' || key === 'mileageAtMaintenance') {
            formDataToSend.append(key, Number(value).toString());
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Submit data to API
      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
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
            <select
              value={formData.automobile}
              onChange={(e) => setFormData((prev) => ({ ...prev, automobile: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sélectionner un véhicule</option>
              {automobiles.map((auto) => (
                <option key={auto._id} value={auto._id}>
                  {auto.brand} {auto.model} ({auto.licensePlate})
                </option>
              ))}
            </select>
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
              {applicableTypes.map((maintenanceType) => (
                <option key={maintenanceType.type} value={maintenanceType.type}>
                  {maintenanceType.description}
                </option>
              ))}
              <option value={MaintenanceType.OTHER}>Autre</option>
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
              id="performedBy"
              label="Réalisé par"
              type="text"
              value={formData.performedBy}
              onChange={(e) => setFormData((prev) => ({ ...prev, performedBy: e.target.value }))}
              placeholder="Nom du technicien ou du garage"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as MaintenanceStatus }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(MaintenanceStatus).map((status) => (
                  <option key={status} value={status}>
                    {status === MaintenanceStatus.SCHEDULED ? 'Planifiée' :
                     status === MaintenanceStatus.IN_PROGRESS ? 'En cours' :
                     status === MaintenanceStatus.COMPLETED ? 'Terminée' :
                     status === MaintenanceStatus.CANCELLED ? 'Annulée' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="completedDate"
              label="Date de réalisation"
              type="date"
              value={formData.completedDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, completedDate: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="mileageAtMaintenance"
              label="Kilométrage actuel"
              type="number"
              value={formData.mileageAtMaintenance}
              onChange={(e) => setFormData((prev) => ({ ...prev, mileageAtMaintenance: e.target.value }))}
              placeholder="veuillez entrer le kilométrage du véhicule"
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
        </div>
      ),
    },
    {
      title: 'Documents',
      description: 'Factures et justificatifs',
      content: (
        <div className="space-y-4">
          <div className="flex items-center">
            <CheckIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium">Documents de maintenance</h3>
          </div>
          <p className="text-sm text-gray-500">
            Ajoutez les factures ou documents liés à cette maintenance.
          </p>
          <ImageUpload 
            onFilesChange={handleFileChange} 
            multiple 
            accept=".pdf,.jpg,.jpeg,.png"
            label="Télécharger les documents de maintenance"
          />
        </div>
      ),
    }
  ];

  return (
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
  );
};

export default MaintenanceModal;