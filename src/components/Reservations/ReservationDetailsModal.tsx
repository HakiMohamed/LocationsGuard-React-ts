import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reservation, ReservationStatus } from '../../types/reservation.types';
import { toast } from 'react-hot-toast';
import { useReservation } from '../../contexts/ReservationContext';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onStatusChange: (reservationId: string, newStatus: ReservationStatus) => Promise<void>;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onStatusChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { fetchReservations } = useReservation();
  
  if (!reservation) return null;

  const getStatusBadgeClass = (status: ReservationStatus) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case ReservationStatus.PENDING:
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case ReservationStatus.CONFIRMED:
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case ReservationStatus.CANCELLED:
        return `${baseClasses} bg-rose-100 text-rose-800`;
      case ReservationStatus.COMPLETED:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return baseClasses;
    }
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ReservationStatus;
    
    if (newStatus === reservation.status) return;
    
    try {
      setIsUpdating(true);
      await onStatusChange(reservation._id, newStatus);
      await fetchReservations();
      toast.success('Statut de la réservation mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                <div className="flex justify-between items-center border-b pb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                    Détails de la réservation
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Status Section */}
                  <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">Statut:</span>
                        <span className={getStatusBadgeClass(reservation.status)}>
                          {reservation.status}
                        </span>
                      </div>
                      
                      <div className="relative w-full sm:w-64">
                        <select
                          onChange={handleStatusChange}
                          value={reservation.status}
                          disabled={isUpdating}
                          className={`
                            block w-full px-4 py-3 text-base border border-gray-300 
                            rounded-lg shadow-sm transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${reservation.status === ReservationStatus.PENDING ? 'bg-yellow-50 text-yellow-800' : ''}
                            ${reservation.status === ReservationStatus.CONFIRMED ? 'bg-green-50 text-green-800' : ''}
                            ${reservation.status === ReservationStatus.CANCELLED ? 'bg-red-50 text-red-800' : ''}
                            ${reservation.status === ReservationStatus.COMPLETED ? 'bg-blue-50 text-blue-800' : ''}
                          `}
                        >
                          <option value={ReservationStatus.PENDING} className="bg-yellow-50 text-yellow-800 py-2">
                            En attente
                          </option>
                          <option value={ReservationStatus.CONFIRMED} className="bg-green-50 text-green-800 py-2">
                            Confirmée
                          </option>
                          <option value={ReservationStatus.CANCELLED} className="bg-red-50 text-red-800 py-2">
                            Annulée
                          </option>
                          <option value={ReservationStatus.COMPLETED} className="bg-blue-50 text-blue-800 py-2">
                            Terminée
                          </option>
                        </select>
                        {isUpdating && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Information client
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium mt-1">
                          {reservation?.client ? `${reservation.client.firstName} ${reservation.client.lastName}` : 'Non spécifié'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium mt-1">{reservation?.client?.email || 'Aucun email'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium mt-1">{reservation?.client?.phoneNumber || 'Aucun téléphone'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Permis de conduire</p>
                        <p className="font-medium mt-1">{reservation.client.drivingLicenseNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-5l-3-4H3z" />
                      </svg>
                      Véhicule réservé
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Véhicule</p>
                        <p className="font-medium mt-1">
                          {reservation?.automobile ? `${reservation.automobile.brand} ${reservation.automobile.model}` : 'Non spécifié'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Immatriculation</p>
                        <p className="font-medium mt-1">{reservation?.automobile?.licensePlate || 'Pas de plaque'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tarif journalier</p>
                        <p className="font-medium mt-1">{reservation.automobile.dailyRate} DH</p>
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Détails de la réservation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Date de début</p>
                        <p className="font-medium mt-1">
                          {format(new Date(reservation.startDate), 'PPP', { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de fin</p>
                        <p className="font-medium mt-1">
                          {format(new Date(reservation.endDate), 'PPP', { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prix total</p>
                        <p className="font-medium text-lg text-emerald-600">{reservation.totalPrice} DH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Statut de paiement</p>
                        <div className="mt-1">
                          {reservation.isPaid ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Payé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Non payé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {reservation.notes && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Notes
                      </h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{reservation.notes}</p>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReservationDetailsModal;