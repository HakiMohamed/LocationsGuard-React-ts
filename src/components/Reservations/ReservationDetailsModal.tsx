import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckCircleIcon, UserIcon, TruckIcon, CalendarIcon, ClipboardDocumentIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
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
  const [currentStatus, setCurrentStatus] = useState<ReservationStatus | undefined>(reservation?.status);

  useEffect(() => {
    setCurrentStatus(reservation?.status);
  }, [reservation]);

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
    
    if (newStatus === currentStatus || !reservation) return;
    
    try {
      setIsUpdating(true);
      await onStatusChange(reservation._id, newStatus);
      toast.success('Statut de la réservation mis à jour avec succès');
      setCurrentStatus(newStatus);
      await fetchReservations();
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl  transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
                  <div className="flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                      Détails de la réservation
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-white/80 hover:text-white transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Status badge floating on gradient */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className={getStatusBadgeClass(reservation.status)}>
                      {reservation.status}
                    </span>
                    
                    {/* Reservation ID */}
                    <span className="text-white/70 text-sm">
                      #{reservation._id.substring(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                

                  {/* Main Details Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Client Information */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                          Information client
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Nom complet</p>
                            <p className="font-medium text-right">
                              {reservation?.client ? `${reservation.client.firstName} ${reservation.client.lastName}` : 'Non spécifié'}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-right">{reservation?.client?.email || 'Aucun email'}</p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium text-right">{reservation?.client?.phoneNumber || 'Aucun téléphone'}</p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Permis de conduire</p>
                            <p className="font-medium text-right">{reservation.client.drivingLicenseNumber}</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <TruckIcon className="h-5 w-5 mr-2 text-indigo-500" />
                          Véhicule réservé
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Véhicule</p>
                            <p className="font-medium text-right">
                              {reservation?.automobile ? `${reservation.automobile.brand} ${reservation.automobile.model}` : 'Non spécifié'}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Immatriculation</p>
                            <p className="font-medium text-right">{reservation?.automobile?.licensePlate || 'Pas de plaque'}</p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Tarif journalier</p>
                            <p className="font-medium text-right">{reservation.automobile.dailyRate} DH</p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Kilometrage</p>
                            <p className="font-medium text-right">{reservation.automobile.mileage} KM</p>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Reservation Details */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                          Détails de la réservation
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Date de début</p>
                            <p className="font-medium text-right">
                              {format(new Date(reservation.startDate), 'PPP', { locale: fr })}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Date de fin</p>
                            <p className="font-medium text-right">
                              {format(new Date(reservation.endDate), 'PPP', { locale: fr })}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">Prix total</p>
                            <p className="font-medium text-lg text-emerald-600">{reservation.totalPrice} DH</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">Statut de paiement</p>
                            <div>
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

                      {/* Payment Summary Card */}
                      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 rounded-xl shadow-sm border border-indigo-200">
                        <h4 className="font-medium text-indigo-900 mb-4 flex items-center">
                          <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-indigo-600" />
                          Résumé financier
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <p className="text-sm text-indigo-700">Sous-total</p>
                            <p className="font-medium">{reservation.totalPrice} DH</p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-indigo-700">Taxes</p>
                            <p className="font-medium">Incluses</p>
                          </div>
                          <div className="border-t border-indigo-200 my-2 pt-2 flex justify-between">
                            <p className="font-semibold text-indigo-900">Total</p>
                            <p className="font-bold text-lg text-indigo-900">{reservation.totalPrice} DH</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {reservation.notes && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Notes
                      </h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">{reservation.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Fermer
                  </button>
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