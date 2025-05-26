import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
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

  // Steps must be declared before any useEffect or function that uses them
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
    },
    {
      title: 'Image de la catégorie',
      description: 'Ajouter une image représentative',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image (JPG, PNG, WEBP, max 2Mo)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  setFormData(prev => ({
                    ...prev,
                    imageFiles: [file],
                    imagePreview: URL.createObjectURL(file),
                  }));
                }
              }}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-indigo-600 file:text-white hover:file:from-purple-700 hover:file:to-indigo-700"
            />
            {formData.imagePreview && (
              <div className="mt-4 flex flex-col items-start gap-2">
                <img
                  src={formData.imagePreview}
                  alt="Aperçu de l'image"
                  className="w-40 h-32 object-cover rounded-lg border shadow"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageFiles: [], imagePreview: '' }))}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Supprimer l'image
                </button>
              </div>
            )}
            {!formData.imagePreview && (
              <div className="mt-2 text-xs text-gray-400">Aucune image sélectionnée</div>
            )}
          </div>
        </div>
      ),
    },
  ];

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

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('Le nom de la catégorie est requis');
        return false;
      }
      if (formData.description && formData.description.length > 200) {
        toast.error('La description ne doit pas dépasser 200 caractères');
        return false;
      }
    }
    if (step === 2) {
      if (formData.imageFiles.length > 0) {
        const file = formData.imageFiles[0];
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
          toast.error('Seuls les fichiers JPG, PNG ou WEBP sont autorisés');
          return false;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast.error('L\'image ne doit pas dépasser 2 Mo');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
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
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const errorResponse = err.response?.data;
      // Handle different error status codes
      switch (err.response?.status) {
        case 409:
          toast.error('Une catégorie avec ce nom existe déjà');
          break;
        case 400: {
          // Handle validation errors
          const validationErrors = Array.isArray(errorResponse?.message)
            ? errorResponse.message.join(', ')
            : errorResponse?.message;
          toast.error(validationErrors || 'Données invalides');
          break;
        }
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
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentStep < steps.length) {
        e.preventDefault();
        nextStep();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, isOpen, steps.length]);

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <CheckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-white">
                          {category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                        </Dialog.Title>
                        <p className="text-sm text-white/80 mt-1">
                          Étape {currentStep} sur {steps.length} • {steps[currentStep - 1].title}
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
                      <div key={step.title} className="flex items-center flex-1">
                        <div className="flex items-center">
                          <div className={`
                            flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                            ${currentStep > index + 1
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white'
                              : currentStep === index + 1
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                            }
                          `}>
                            {currentStep > index + 1 ? (
                              <CheckIcon className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="ml-4 min-w-0">
                            <p className={`text-sm font-medium ${
                              currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`
                            flex-1 h-px mx-6 transition-all duration-200
                            ${currentStep > index + 1 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'}
                          `} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  {/* Step Content */}
                  <div className="bg-gray-50 rounded-xl min-h-[200px]">
                    <div className="bg-white rounded-lg p-6">
                      {steps[currentStep - 1].content}
                    </div>
                  </div>
                  {/* Navigation Buttons */}
                  <div className="mt-8 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className={`$
                        currentStep === 1 ? 'invisible' : ''
                      } inline-flex items-center px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-300`}
                    >
                      Précédent
                    </button>
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium"
                      >
                        {category ? 'Modifier' : 'Créer'}
                        <CheckIcon className="h-4 w-4 ml-2" />
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

export default CategoryModal; 