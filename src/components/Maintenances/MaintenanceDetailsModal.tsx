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
  faClock,
  faXmark,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { MaintenanceType, MaintenanceWithNextDetails } from '../../types/maintenance.types';
import { DollarSign } from 'lucide-react';

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

  const renderDetailCard = (icon: React.ComponentProps<typeof FontAwesomeIcon>['icon'], label: string, value: string | number | undefined, accent?: string) => (
    <div className="group relative overflow-hidden bg-white border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${accent || 'bg-blue-50'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <FontAwesomeIcon 
            icon={icon} 
            className={`${accent ? 'text-white' : 'text-blue-600'} text-sm`} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-gray-900 font-semibold text-sm leading-tight">{value || 'Non spécifié'}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-white mb-1">
                        Détails de la maintenance
                      </Dialog.Title>
                      <p className="text-blue-100 text-sm">
                        {translateMaintenanceType(maintenance.type)}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Key Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderDetailCard(faCar, 'Véhicule', automobile ? `${automobile.brand} ${automobile.model}` : 'N/A', 'bg-gradient-to-br from-gray-700 to-gray-800')}
                        {renderDetailCard(faCalendar, 'Date de réalisation', 
                          maintenance.date 
                            ? format(new Date(maintenance.date), 'dd MMM yyyy', { locale: fr }) 
                            : 'N/A',
                          'bg-gradient-to-br from-green-500 to-emerald-600'
                        )}
                        {renderDetailCard(faRoad, 'Prochain kilométrage', 
                          maintenance.nextMaintenanceKilometers
                            ? `${maintenance.nextMaintenanceKilometers.toLocaleString()} km`
                            : 'N/A',
                          'bg-gradient-to-br from-orange-500 to-red-500'
                        )}
                        {renderDetailCard(faDollarSign, 'Coût', maintenance.cost ? `${maintenance.cost.toLocaleString()} DH` : 'N/A', 'bg-gradient-to-br from-purple-500 to-pink-600')}
                        {renderDetailCard(faUser, 'Technicien', maintenance.technician || 'N/A', 'bg-gradient-to-br from-indigo-500 to-blue-600')}
                        {renderDetailCard(faClock, 'Prochaine échéance', 
                          maintenance.nextMaintenanceDate
                            ? format(new Date(maintenance.nextMaintenanceDate), 'dd MMM yyyy', { locale: fr })
                            : 'N/A',
                          'bg-gradient-to-br from-teal-500 to-cyan-600'
                        )}
                      </div>

                      {/* Description Section */}
                      {maintenance.description && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-800">Description</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{maintenance.description}</p>
                        </div>
                      )}

                      {/* Notes Section */}
                      {maintenance.notes && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-800">Notes</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{maintenance.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Image Section */}
                    <div className="lg:col-span-1">
                      {automobile && automobile.images && automobile.images.length > 0 ? (
                        <div className="sticky top-8">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Véhicule</span>
                            </h4>
                            <div className="relative group">
                              <img 
                                src={automobile.images[0]} 
                                alt={`${automobile.brand} ${automobile.model}`}
                                className="w-full h-64 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="mt-4 text-center">
                              <p className="font-semibold text-gray-800">{automobile.brand} {automobile.model}</p>
                              {automobile.year && (
                                <p className="text-sm text-gray-600">{automobile.year}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FontAwesomeIcon icon={faCar} className="text-gray-400 text-xl" />
                            </div>
                            <p className="text-gray-500">Aucune image disponible</p>
                          </div>
                        </div>
                      )}
                    </div>
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