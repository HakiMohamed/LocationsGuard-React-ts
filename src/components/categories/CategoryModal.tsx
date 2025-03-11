import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Category } from '../../types/automobile.types';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  category?: Category;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSubmit, category }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageFiles: [] as File[],
    imagePreview: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        imageFiles: [],
        imagePreview: category.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        imageFiles: [],
        imagePreview: '',
      });
    }
    setCurrentStep(1);
  }, [category, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        imageFiles: [file],
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.imageFiles.length > 0) {
        formDataToSend.append('image', formData.imageFiles[0]);
      }

      await onSubmit(formDataToSend);
      onClose();
    } catch (error: any) {
      const errorResponse = error.response?.data;
      
      // Handle different error status codes
      switch (error.response?.status) {
        case 409:
          toast.error('Une catégorie avec ce nom existe déjà');
          break;
        case 400:
          // Handle validation errors
          const validationErrors = Array.isArray(errorResponse?.message) 
            ? errorResponse.message.join(', ')
            : errorResponse?.message;
          toast.error(validationErrors || 'Données invalides');
          break;
        case 401:
          toast.error('Non autorisé - Veuillez vous reconnecter');
          break;
        case 403:
          toast.error('Accès refusé - Vous n\'avez pas les permissions nécessaires');
          break;
        case 404:
          toast.error('Ressource non trouvée');
          break;
        case 500:
          toast.error('Erreur serveur - Veuillez réessayer plus tard');
          break;
        default:
          toast.error('Une erreur est survenue lors de l\'opération');
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Le nom de la catégorie est requis');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const steps = [
    {
      title: 'Informations de base',
      description: 'Nom et description de la catégorie',
      content: (
        <div className="space-y-4">
          <Input
            id="name"
            label="Nom de la catégorie *"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            id="description"
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
      ),
    }
   
  ];    

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium">
              {category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.title}>
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          currentStep > index + 1
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : currentStep === index + 1
                            ? 'border-blue-600 text-blue-600'
                            : 'border-gray-300 text-gray-300'
                        }`}
                      >
                        {currentStep > index + 1 ? (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <p
                          className={`text-sm font-medium ${
                            currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`text-sm ${
                            currentStep >= index + 1 ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="ml-4 flex-1 border-t-2 border-gray-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {steps[currentStep - 1].content}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className={`${
                  currentStep === 1 ? 'invisible' : ''
                } px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900`}
              >
                Précédent
              </button>
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {category ? 'Modifier' : 'Créer'}
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CategoryModal; 