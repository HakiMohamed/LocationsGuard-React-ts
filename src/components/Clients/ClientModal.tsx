import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ArrowLongLeftIcon, ArrowLongRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setProcessingSteps({ current: "Création du client en cours...", status: 'pending' });
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
    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        toast.error('Le prénom est requis.');
        return;
      }
      if (!formData.lastName.trim()) {
        toast.error('Le nom est requis.');
        return;
      }
      if (!formData.email.trim()) {
        toast.error("L'email est requis.");
        return;
      }
      if (!formData.phoneNumber.trim()) {
        toast.error('Le numéro de téléphone est requis.');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const steps = [
    {
      title: 'Informations personnelles',
      description: 'Coordonnées du client',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
      ),
    },
    {
      title: 'Adresse',
      description: 'Localisation du client',
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
      title: "Informations du permis",
      description: 'Détails du permis de conduire',
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
          <div className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image du permis
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setLicenseImage(e.target.files[0]);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      ),
    },
  ];



const ProcessingProgress = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <h1 className="text-gray-900">hiiiiiiiii</h1>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Traitement en cours</h3>
          <p className="mt-1 text-sm text-gray-500">{processingSteps.current}</p>
        </div>
      </div>
    </div>
  </div>
);



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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {initialData ? 'Modifier le client' : 'Ajouter un nouveau client'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mt-4">
                    <div className="md:hidden mb-6">
                      <p className="text-sm font-medium text-gray-500">
                        Étape {currentStep} sur {steps.length}
                      </p>
                      <h3 className="text-lg font-medium text-gray-900">
                        {steps[currentStep - 1].title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {steps[currentStep - 1].description}
                      </p>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                          style={{ width: `${(currentStep / steps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="min-h-[300px] relative">
                      {steps[currentStep - 1].content}
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                        className={`${
                          currentStep === 1 ? 'invisible' : ''
                        } inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200`}
                      >
                        <ArrowLongLeftIcon className="h-5 w-5 mr-2" />
                        Précédent
                      </button>
                      {currentStep < steps.length ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Suivant
                          <ArrowLongRightIcon className="h-5 w-5 ml-2" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Traitement...
                            </>
                          ) : (
                            <>
                              {initialData ? 'Modifier' : 'Créer'}
                              <CheckIcon className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
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