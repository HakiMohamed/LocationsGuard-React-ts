import React, { useState } from 'react';
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
  faFileAlt,
  faCheck,
  faClock,
  faExpandAlt
} from '@fortawesome/free-solid-svg-icons';
import { Maintenance, MaintenanceType, MaintenanceStatus } from '../../types/maintenance.types';

interface MaintenanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: Maintenance;
}

// Helper function to translate maintenance types
const translateMaintenanceType = (type: MaintenanceType): string => {
  const translations: Record<MaintenanceType, string> = {
    [MaintenanceType.OIL_CHANGE]: 'Vidange huile',
    [MaintenanceType.TIRE_CHANGE]: 'Changement pneus',
    [MaintenanceType.BRAKE_SERVICE]: 'Entretien freins',
    [MaintenanceType.FILTER_CHANGE]: 'Changement filtres',
    [MaintenanceType.BATTERY_REPLACEMENT]: 'Remplacement batterie',
    [MaintenanceType.GENERAL_INSPECTION]: 'Inspection générale',
    [MaintenanceType.COOLING_SYSTEM]: 'Système refroidissement',
    [MaintenanceType.TRANSMISSION_SERVICE]: 'Entretien transmission',
    [MaintenanceType.SUSPENSION_CHECK]: 'Vérification suspension',
    [MaintenanceType.ELECTRICAL_SYSTEM]: 'Système électrique',
    [MaintenanceType.AIR_CONDITIONING]: 'Climatisation',
    [MaintenanceType.OTHER]: 'Autre'
  };
  
  return translations[type] || type;
};

// Helper function to translate maintenance status
const translateMaintenanceStatus = (status: MaintenanceStatus): string => {
  const translations: Record<MaintenanceStatus, string> = {
    [MaintenanceStatus.SCHEDULED]: 'Planifiée',
    [MaintenanceStatus.IN_PROGRESS]: 'En cours',
    [MaintenanceStatus.COMPLETED]: 'Terminée',
    [MaintenanceStatus.CANCELLED]: 'Annulée'
  };
  
  return translations[status] || status;
};

const MaintenanceDetailsModal: React.FC<MaintenanceDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  maintenance 
}) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isFullscreenDoc, setIsFullscreenDoc] = useState(false);

  if (!maintenance) return null;

  // Determine automobile details
  const automobile = typeof maintenance.automobile === 'object' 
    ? maintenance.automobile 
    : null;

  // Prepare invoice documents
  const invoiceDocuments = maintenance.invoiceDocuments || [];

  const renderDetailItem = (icon: any, label: string, value: string | number | undefined) => (
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
                        maintenance.completedDate 
                          ? format(new Date(maintenance.completedDate), 'dd MMM yyyy', { locale: fr }) 
                          : 'N/A'
                      )}
                      {renderDetailItem(faRoad, 'Kilométrage', 
                        maintenance.mileageAtMaintenance 
                          ? `${maintenance.mileageAtMaintenance} km` 
                          : 'N/A'
                      )}
                      {renderDetailItem(faMoneyBillWave, 'Coût', 
                        maintenance.cost 
                          ? `${maintenance.cost.toLocaleString()} DH` 
                          : 'N/A'
                      )}
                      {renderDetailItem(faUser, 'Réalisé par', maintenance.performedBy || 'N/A')}
                      {renderDetailItem(faCheck, 'Statut', translateMaintenanceStatus(maintenance.status))}
                      {renderDetailItem(faClock, 'Prochaine échéance', 
                        maintenance.nextDueDate 
                          ? format(new Date(maintenance.nextDueDate), 'dd MMM yyyy', { locale: fr }) 
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
                  </div>

                  {/* Right Column: Documents and Images */}
                  <div className="space-y-4">
                    {/* Invoice Documents */}
                    {invoiceDocuments.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                          <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-gray-500" />
                          Documents de maintenance
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {invoiceDocuments.map((doc, index) => (
                            <div 
                              key={index} 
                              className="relative group"
                            >
                              <a
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-50 hover:bg-blue-100 p-2 rounded-lg flex items-center text-blue-700 transition-colors"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-6 w-6 mr-2" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
                                  />
                                </svg>
                                <span className="text-sm truncate">Document {index + 1}</span>
                              </a>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentDocIndex(index);
                                  setIsFullscreenDoc(true);
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 p-1 rounded-full text-white"
                                title="Agrandir"
                              >
                                <FontAwesomeIcon icon={faExpandAlt} className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fullscreen Document View */}
                    {isFullscreenDoc && invoiceDocuments.length > 0 && (
                      <div 
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                        onClick={() => setIsFullscreenDoc(false)}
                      >
                        {/* Close button */}
                        <button
                          onClick={() => setIsFullscreenDoc(false)}
                          className="absolute top-4 right-4 text-white hover:text-gray-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Previous button */}
                        {invoiceDocuments.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDocIndex((prev) => 
                                (prev - 1 + invoiceDocuments.length) % invoiceDocuments.length
                              );
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}

                        {/* Next button */}
                        {invoiceDocuments.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDocIndex((prev) => 
                                (prev + 1) % invoiceDocuments.length
                              );
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                          {currentDocIndex + 1} / {invoiceDocuments.length}
                        </div>

                        {/* Main document */}
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <iframe
                            src={invoiceDocuments[currentDocIndex]}
                            className="max-h-full max-w-full"
                            title={`Document ${currentDocIndex + 1}`}
                          />
                        </div>
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