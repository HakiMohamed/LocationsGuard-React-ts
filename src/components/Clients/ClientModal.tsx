import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ArrowLongLeftIcon, 
  ArrowLongRightIcon, 
  CheckIcon, 
  XMarkIcon,
  UserCircleIcon,
  MapPinIcon,
  IdentificationIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';
import { Client } from '../../types/client.types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData, setProcessingSteps: React.Dispatch<React.SetStateAction<{
    current: string;
    status: 'pending' | 'completed' | 'error';
  }>>) => Promise<void>;
  initialData?: Client;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    drivingLicenseNumber: '',
    drivingLicenseDate: '',
    drivingLicenseExpirationDate: '',
  });

  const [processingSteps, setProcessingSteps] = useState<{
    current: string;
    status: 'pending' | 'completed' | 'error';
  }>({ current: '', status: 'pending' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        address: initialData.address || '',
        city: initialData.city || '',
        drivingLicenseNumber: initialData.drivingLicenseNumber || '',
        drivingLicenseDate: initialData.drivingLicenseDate ? new Date(initialData.drivingLicenseDate).toISOString().split('T')[0] : '',
        drivingLicenseExpirationDate: initialData.drivingLicenseExpirationDate ? new Date(initialData.drivingLicenseExpirationDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        drivingLicenseNumber: '',
        drivingLicenseDate: '',
        drivingLicenseExpirationDate: '',
      });
    }
  }, [initialData]);

  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (licenseImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(licenseImage);
    } else {
      setImagePreview(null);
    }
  }, [licenseImage]);

  const steps = [
    {
      number: 1,
      title: 'Informations personnelles',
      description: 'Coordonnées du client',
      icon: UserCircleIcon,
      validate: () => {
        if (!formData.firstName.trim()) {
          toast.error('Le prénom est requis.');
          return false;
        }
        if (!formData.lastName.trim()) {
          toast.error('Le nom est requis.');
          return false;
        }
        if (!formData.email.trim()) {
          toast.error("L'email est requis.");
          return false;
        }
        if (!formData.phoneNumber.trim()) {
          toast.error('Le numéro de téléphone est requis.');
          return false;
        }
        return true;
      },
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="firstName"
              label="Prénom *"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              required
              placeholder="Ex: John"
            />
            <Input
              id="lastName"
              label="Nom *"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              required
              placeholder="Ex: Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="email"
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Ex: john.doe@example.com"
            />
            <Input
              id="phoneNumber"
              label="Téléphone *"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              required
              placeholder="Ex: +212 6XX-XXXXXX"
            />
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Adresse',
      description: 'Localisation du client',
      icon: MapPinIcon,
      validate: () => true, // Pas de validation requise pour cette étape
      content: (
        <div className="space-y-6">
          <Input
            id="address"
            label="Adresse"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Ex: 123 Rue Example"
          />
          <Input
            id="city"
            label="Ville"
            type="text"
            value={formData.city}
            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="Ex: Casablanca"
          />
        </div>
      ),
    },
    {
      number: 3,
      title: "Informations du permis",
      description: 'Détails du permis de conduire',
      icon: IdentificationIcon,
      validate: () => {
        if (!formData.drivingLicenseNumber.trim()) {
          toast.error('Le numéro du permis est requis.');
          return false;
        }
        if (!formData.drivingLicenseDate) {
          toast.error("La date d'obtention du permis est requise.");
          return false;
        }
        if (!formData.drivingLicenseExpirationDate) {
          toast.error('La date d\'expiration du permis est requise.');
          return false;
        }
        return true;
      },
      content: (
        <div className="space-y-6">
          <Input
            id="drivingLicenseNumber"
            label="Numéro du permis *"
            type="text"
            value={formData.drivingLicenseNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, drivingLicenseNumber: e.target.value }))}
            required
            placeholder="Ex: AB123456"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="drivingLicenseDate"
              label="Date d'obtention *"
              type="date"
              value={formData.drivingLicenseDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, drivingLicenseDate: e.target.value }))}
              required
            />
            <Input
              id="drivingLicenseExpirationDate"
              label="Date d'expiration *"
              type="date"
              value={formData.drivingLicenseExpirationDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, drivingLicenseExpirationDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Image du permis
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setLicenseImage(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="license-upload"
              />
              <label
                htmlFor="license-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <CameraIcon className="w-10 h-10 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                </div>
              </label>
              {imagePreview && (
                <div className="mt-4">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu du permis"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ne rien faire si on n'est pas à la dernière étape
    if (currentStep !== steps.length) return;
    // Valider la dernière étape
    const isValid = steps[currentStep - 1].validate();
    if (!isValid) return;
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value.toString());
        }
      });
      if (licenseImage) {
        formDataToSend.append('drivingLicenseImage', licenseImage);
      }
      setProcessingSteps({ 
        current: initialData ? "Mise à jour du client en cours..." : "Création du client en cours...", 
        status: 'pending' 
      });
      await onSubmit(formDataToSend, setProcessingSteps);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue');
      setProcessingSteps({ current: '', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const isValid = steps[currentStep - 1].validate();
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const ProcessingProgress = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Traitement en cours</h3>
            <p className="text-gray-600">{processingSteps.current}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const currentStepData = steps[currentStep - 1];

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
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        {React.createElement(currentStepData.icon, { className: "h-6 w-6 text-white" })}
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-white">
                          {initialData ? 'Modifier le client' : 'Ajouter un nouveau client'}
                        </Dialog.Title>
                        <p className="text-sm text-white/80 mt-1">
                          Étape {currentStep} sur {steps.length} • {currentStepData.title}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Step Progress */}
                <div className="px-8 py-6 bg-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center flex-1">
                        <div className="flex items-center">
                          <div className={`
                            flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                            ${currentStep > step.number 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white' 
                              : currentStep === step.number 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-400'
                            }
                          `}>
                            {currentStep > step.number ? (
                              <CheckIcon className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">{step.number}</span>
                            )}
                          </div>
                          <div className="ml-4 min-w-0">
                            <p className={`text-sm font-medium ${
                              currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`
                            flex-1 h-px mx-6 transition-all duration-200
                            ${currentStep > step.number ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'}
                          `} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="p-8">
                    {/* Current Step Content */}
                    <div className="bg-gray-50 rounded-xl min-h-[400px]">
                      <div className="bg-white rounded-lg p-6">
                        {currentStepData.content}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-8 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={prevStep}
                        className={`${
                          currentStep === 1 ? 'invisible' : ''
                        } inline-flex items-center px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-300`}
                      >
                        <ArrowLongLeftIcon className="h-4 w-4 mr-2" />
                        Précédent
                      </button>
                      
                      {currentStep < steps.length ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium"
                        >
                          Suivant
                          <ArrowLongRightIcon className="h-4 w-4 ml-2" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={loading}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                              {initialData ? 'Modifier' : 'Créer'}
                              <CheckIcon className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {loading && processingSteps.current && <ProcessingProgress />}
      </Dialog>
    </Transition>
  );
};

export default ClientModal;