import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FontAwesomeIcon 
} from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faWrench, 
  faCalendar, 
  faRoad, 
  faMoneyBillWave, 
  faUser,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { MaintenanceType, MaintenanceWithNextDetails } from '../../types/maintenance.types';

interface MaintenanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: MaintenanceWithNextDetails;
}

// Helper function to translate maintenance types
const translateMaintenanceType = (type: MaintenanceType): string => {
  const translations: Record<MaintenanceType, string> = {
    VIDANGE: 'Vidange',
    FILTRE_AIR: 'Filtre à air',
    FILTRE_HUILE: 'Filtre à huile',
    FILTRE_CARBURANT: 'Filtre à carburant',
    FREINS: 'Freins',
    PNEUS: 'Pneus',
    COURROIE_DISTRIBUTION: 'Courroie de distribution',
    LIQUIDE_REFROIDISSEMENT: 'Liquide de refroidissement',
    BOUGIES_ALLUMAGE: 'Bougies d\'allumage',
    BATTERIE: 'Batterie',
    CLIMATISATION: 'Climatisation',
    ESSUIE_GLACES: 'Essuie-glaces',
    CONTROLE_TECHNIQUE: 'Contrôle technique',
    NETTOYAGE: 'Nettoyage',
    FEUX_AMPLOULES: 'Feux à ampoules',
    SUSPENSION_DIRECTION: 'Suspension direction',
    NIVEAUX: 'Niveaux',
    ADBLUE: 'Adblue',
    FILTRE_HABITACLE: 'Filtre d\'habitacle',
    GEOMETRIE: 'Géométrie',
    COURROIE_ACCESSOIRES: 'Courroie d\'accessoires',
    AMORTISSEURS: 'Amortisseurs',
    ROTULES: 'Rotules',
    CARDANS: 'Cardans',
    REVISION_GENERALE: 'Révision générale',
    VIDANGE_BOITE_VITESSES: 'Vidange boîte de vitesses',
    POMPE_EAU: 'Pompe à eau',
    THERMOSTAT: 'Thermostat',
    RADIATEUR: 'Radiateur',
    ALTERNATEUR: 'Alternateur',
    DEMARREUR: 'Démarreur',
    CAPTEURS: 'Capteurs'
  };
  
  return translations[type] || type;
};

const MaintenanceDetailsModal: React.FC<MaintenanceDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  maintenance 
}) => {
  if (!maintenance) return null;

  // Determine automobile details
  const automobile = typeof maintenance.automobile === 'object' 
    ? maintenance.automobile 
    : null;

  const renderDetailItem = (icon: React.ComponentProps<typeof FontAwesomeIcon>['icon'], label: string, value: string | number | undefined) => (
    <div className="bg-gray-50 p-3 rounded-lg flex items-center">
      <FontAwesomeIcon icon={icon} className="text-gray-500 mr-2" />
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <Dialog.Title 
                  as="h3" 
                  className="text-xl font-bold leading-6 text-gray-900 border-b pb-3 mb-4"
                >
                  Détails de la maintenance
                </Dialog.Title>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Vehicle Information */}
                  <div className="space-y-3 overflow-y-auto max-h-80">
                    <div className="grid grid-cols-2 gap-3">
                      {renderDetailItem(faCar, 'Véhicule', automobile ? `${automobile.brand} ${automobile.model}` : 'N/A')}
                      {renderDetailItem(faWrench, 'Type de maintenance', translateMaintenanceType(maintenance.type))}
                      {renderDetailItem(faCalendar, 'Date de réalisation', 
                        maintenance.date 
                          ? format(new Date(maintenance.date), 'dd MMM yyyy', { locale: fr }) 
                          : 'N/A'
                      )}
                      {renderDetailItem(faRoad, 'Prochain kilométrage', 
                        maintenance.nextMaintenanceKilometers
                          ? `${maintenance.nextMaintenanceKilometers} km`
                          : 'N/A'
                      )}
                      {renderDetailItem(faMoneyBillWave, 'Coût', maintenance.cost ? `${maintenance.cost} DH` : 'N/A')}
                      {renderDetailItem(faUser, 'Réalisé par', maintenance.technician || 'N/A')}
                      {renderDetailItem(faClock, 'Prochaine échéance', 
                        maintenance.nextMaintenanceDate
                          ? format(new Date(maintenance.nextMaintenanceDate), 'dd MMM yyyy', { locale: fr })
                          : 'N/A'
                      )}
                    </div>
                    
                    {/* Description */}
                    {maintenance.description && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-600">{maintenance.description}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {maintenance.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                        <p className="text-gray-600">{maintenance.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Documents and Images */}
                  <div className="space-y-4">
                    {/* Vehicle Image */}
                    {automobile && automobile.images && automobile.images.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Image du véhicule</h4>
                        <img 
                          src={automobile.images[0]} 
                          alt={`${automobile.brand} ${automobile.model}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
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

export default MaintenanceDetailsModal;