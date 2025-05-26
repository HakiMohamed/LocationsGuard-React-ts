//components/Automobiles/AutomobileModal.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLongRightIcon, ArrowLongLeftIcon, CheckIcon, PlusCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';
import TagInput from '../ui/TagInput';
import CategoryModal from '../categories/CategoryModal';
import { useCategory } from '../../contexts/CategoryContext';
import ImageUpload from '../ui/ImageUpload';
import { Fragment } from 'react';
import { Automobile } from '../../types/automobile.types';

interface AutomobileModalProps {  
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  automobile?: Automobile;
}

const AutomobileModal: React.FC<AutomobileModalProps> = ({ isOpen, onClose, onSubmit, automobile }) => {
  const { categories, createCategory, fetchCategories } = useCategory();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    dailyRate: '',
    fuelType: 'GASOLINE',
    transmission: 'MANUAL',
    seats: '',
    licensePlate: '',
    mileage: '',
    color: '',
    engineCapacity: '',
    fuelConsumption: '',
    description: '',
    features: [] as string[],
    category: '',
    insuranceType: 'TIERS_SIMPLE' as InsuranceType,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form data when automobile prop changes
  useEffect(() => {
    if (automobile) {
      setFormData({
        brand: automobile.brand,
        model: automobile.model,
        year: automobile.year.toString(),
        dailyRate: automobile.dailyRate.toString(),
        fuelType: automobile.fuelType,
        transmission: automobile.transmission,
        seats: automobile.seats.toString(),
        licensePlate: automobile.licensePlate,
        mileage: automobile.mileage.toString(),
        color: automobile.color || '',
        engineCapacity: automobile.engineCapacity?.toString() || '',
        fuelConsumption: automobile.fuelConsumption?.toString() || '',
        description: automobile.description || '',
        features: automobile.features || [],
        category: automobile.category._id,
        insuranceType: automobile.insuranceType || 'TIERS_SIMPLE',
      });
    } else {
      setFormData({
        brand: '',
        model: '',
        year: '',
        dailyRate: '',
        fuelType: 'GASOLINE',
        transmission: 'MANUAL',
        seats: '',
        licensePlate: '',
        mileage: '',
        color: '',
        engineCapacity: '',
        fuelConsumption: '',
        description: '',
        features: [],
        category: '',
        insuranceType: 'TIERS_SIMPLE',
      });
    }
    setCurrentStep(1);
    fetchCategories();
  }, [automobile, isOpen, fetchCategories]);

  // Handle image file changes
  const handleFilesChange = (newFiles: File[]) => {
    if (newFiles.length > 9) {
      toast.error('Vous ne pouvez pas ajouter plus de 9 images. Veuillez retirer des images si nécessaire.');
      return;
    }
    setFiles(newFiles);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formDataToSend.append(key, item));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add image files to FormData
      files.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Validate at least one image is present
      if (!automobile && files.length === 0) {
        toast.error('Veuillez ajouter au moins une image.');
        setLoading(false);
        return;
      }
      
      // Submit data to API
      await onSubmit(formDataToSend);
      toast.success(automobile ? 'Automobile modifiée avec succès!' : 'Automobile ajoutée avec succès!');
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
    if (currentStep === 1) {
      if (!formData.brand.trim()) {
        toast.error('La marque est requise.');
        return;
      }
      if (!formData.model.trim()) {
        toast.error('Le modèle est requis.');
        return;
      }
      if (!formData.year) {
        toast.error("L'année est requise.");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.dailyRate) {
        toast.error('Le tarif journalier est requis.');
        return;
      }
      if (!formData.seats) {
        toast.error('Le nombre de sièges est requis.');
        return;
      }
    }
    
    setCurrentStep((prev) => prev + 1);
  };

  // Create a new category
  const handleCreateCategory = async (data: FormData) => {
    try {
      await createCategory({
        name: data.get('name') as string,
        description: data.get('description') as string,
      });
      setIsCategoryModalOpen(false);
      toast.success('Catégorie créée avec succès.');
      fetchCategories();
    } catch {
      toast.error('Erreur lors de la création de la catégorie.');
    }
  };

  // Form steps configuration
  const steps = [
    {
      title: 'Informations essentielles',
      description: 'Identité du véhicule',
      content: (
        <div className="space-y-6">
          <Input
            id="brand"
            label="Marque *"
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
            required
            placeholder="Ex: Renault, Peugeot, Mercedes..."
          />
          <Input
            id="model"
            label="Modèle *"
            type="text"
            value={formData.model}
            onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
            required
            placeholder="Ex: Clio, 308, Classe C..."
          />
          <Input
            id="year"
            label="Année *"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
            required
            placeholder="Ex: 2022"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de carburant</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData((prev) => ({ ...prev, fuelType: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="GASOLINE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Électrique</option>
                <option value="HYBRID">Hybride</option>
                <option value="PLUG_IN_HYBRID">Hybride rechargeable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData((prev) => ({ ...prev, transmission: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="MANUAL">Manuelle</option>
                <option value="AUTOMATIC">Automatique</option>
                <option value="SEMI_AUTOMATIC">Semi-automatique</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'assurance</label>
              <select
                value={formData.insuranceType}
                onChange={(e) => setFormData((prev) => ({ ...prev, insuranceType: e.target.value as InsuranceType }))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="TIERS_SIMPLE">Tiers Simple</option>
                <option value="TIERS_ETENDU">Tiers Étendu</option>
                <option value="TOUS_RISQUES">Tous Risques</option>
                <option value="TOUS_RISQUES_PLUS">Tous Risques Plus</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarif et caractéristiques',
      description: 'Détails de location',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="dailyRate"
              label="Tarif journalier (DH) *"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dailyRate: e.target.value }))}
              required
              placeholder="Ex: 50"
            />
            <Input
              id="seats"
              label="Nombre de sièges *"
              type="number"
              value={formData.seats}
              onChange={(e) => setFormData((prev) => ({ ...prev, seats: e.target.value }))}
              required
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caractéristiques</label>
            <TagInput
              tags={formData.features}
              onChange={(tags) => setFormData((prev) => ({ ...prev, features: tags }))}
              placeholder="Ajouter des caractéristiques (ex: Climatisation)"
            />
            <p className="mt-1 text-xs text-gray-500">Appuyez sur Entrée après chaque caractéristique</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Description du véhicule..."
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Détails techniques',
      description: 'Informations complémentaires',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="licensePlate"
              label="Plaque d'immatriculation"
              type="text"
              value={formData.licensePlate}
              onChange={(e) => setFormData((prev) => ({ ...prev, licensePlate: e.target.value }))}
              placeholder="Ex: AB-123-CD"
            />
            <Input
              id="color"
              label="Couleur"
              type="text"
              value={formData.color}
              onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
              placeholder="Ex: Noir"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="mileage"
              label="Kilométrage (km)"
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData((prev) => ({ ...prev, mileage: e.target.value }))}
              placeholder="Ex: 25000"
            />
            <Input
              id="engineCapacity"
              label="Cylindrée (cm³)"
              type="number"
              value={formData.engineCapacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, engineCapacity: e.target.value }))}
              placeholder="Ex: 1600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="fuelConsumption"
              label="Consommation de carburant (L/100km)"
              type="number"
              value={formData.fuelConsumption}
              onChange={(e) => setFormData((prev) => ({ ...prev, fuelConsumption: e.target.value }))}
              placeholder="Ex: 5.5"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Images',
      description: 'Photos du véhicule',
      content: (
        <div className="space-y-4">
          <div className="flex items-center">
            <PhotoIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium">Photos du véhicule</h3>
          </div>
          <p className="text-sm text-gray-500">
            Ajoutez des photos de qualité pour maximiser l'attractivité de votre annonce.
            Au moins une image est requise.
          </p>
          <ImageUpload onFilesChange={handleFilesChange} />
        </div>
      ),
    },
    {
      title: 'Catégorie',
      description: 'Classification du véhicule',
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Sélectionnez une catégorie</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Créer une nouvelle catégorie
          </button>
        </div>
      ),
    },
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
                      {automobile ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule'}
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
                              {automobile ? 'Modifier' : 'Créer'}
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </>
  );
};

export default AutomobileModal;