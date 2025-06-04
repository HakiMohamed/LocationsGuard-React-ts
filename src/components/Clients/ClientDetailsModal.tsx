import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Client } from '../../types/client.types';
import { 
  XMarkIcon, 
  UserCircleIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useReservation } from '../../contexts/ReservationContext';
import { clientService } from '../../services/client.service';
import { toast } from 'react-hot-toast';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ isOpen, onClose, client }) => {
  const { getClientReservationCount } = useReservation();
  const [reservationCount, setReservationCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [blockReason, setBlockReason] = useState(client?.blockForReservationReason || '');

  useEffect(() => {
    let isMounted = true;
    if (isOpen && client?._id) {
      setLoadingCount(true);
      getClientReservationCount(client._id)
        .then(count => { if (isMounted) setReservationCount(count); })
        .catch(() => { if (isMounted) setReservationCount(null); })
        .finally(() => { if (isMounted) setLoadingCount(false); });
    } else {
      setReservationCount(null);
    }
    return () => { isMounted = false; };
  }, [isOpen, client, getClientReservationCount]);

  const handleUpdateReservationPossibility = async (canMakeReservation: boolean) => {
    if (!client?._id) {
      toast.error('ID du client non trouvé');
      return;
    }
    
    if (!canMakeReservation && !blockReason.trim()) {
      toast.error('Veuillez entrer une raison pour bloquer le client');
      return;
    }
    
    setIsUpdating(true);
    try {
      const updatedClient = await clientService.updateReservationPossibility(client._id, {
        canMakeReservation,
        blockForReservationReason: canMakeReservation ? undefined : blockReason.trim()
      });
      
      // Mettre à jour le client localement
      if (client) {
        client.canMakeReservation = updatedClient.canMakeReservation;
        client.blockForReservationReason = updatedClient.blockForReservationReason;
        client.blockForReservationAt = updatedClient.blockForReservationAt;
      }
      
      toast.success(canMakeReservation ? 'Client autorisé à faire des réservations' : 'Client bloqué pour les réservations');
    } catch (error) {
      console.error('Error updating reservation possibility:', error);
      toast.error('Erreur lors de la mise à jour du statut de réservation');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to check if client can make reservations
  const canClientMakeReservations = () => {
    return client?.canMakeReservation === undefined ? true : client.canMakeReservation;
  };

  if (!client) return null;

  const renderDetailCard = (icon: React.ComponentType<{ className?: string }>, label: string, value: string | null, accent?: string) => (
    <div className="group relative overflow-hidden bg-white border border-gray-100 hover:border-purple-200 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${accent || 'bg-purple-50'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 p-1.5`}>
          {React.createElement(icon, { 
            className: `${accent ? 'text-white' : 'text-purple-600'} text-sm` 
          })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-gray-900 font-semibold text-sm leading-tight break-words">{value || 'Non renseigné'}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-white mb-1">
                          {client.firstName} {client.lastName}
                        </Dialog.Title>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                            <span className="text-purple-100 text-sm font-medium">Client actif</span>
                          </div>
                          <div className="flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                            <CalendarDaysIcon className="h-4 w-4 text-white" />
                            <span className="text-white text-sm font-semibold">
                              {loadingCount ? (
                                <span className="inline-flex items-center space-x-1">
                                  <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </span>
                              ) : (
                                `${reservationCount ?? 0} réservation${(reservationCount ?? 0) > 1 ? 's' : ''}`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Contact Details */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Informations de contact</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderDetailCard(EnvelopeIcon, 'Email', client.email ? client.email : null, 'bg-gradient-to-br from-blue-500 to-blue-600')}
                          {renderDetailCard(PhoneIcon, 'Téléphone', client.phoneNumber ? client.phoneNumber : null, 'bg-gradient-to-br from-purple-500 to-purple-600')}
                          {renderDetailCard(MapPinIcon, 'Adresse', client.address ? client.address : null, 'bg-gradient-to-br from-orange-500 to-red-500')}
                          {renderDetailCard(MapPinIcon, 'Ville', client.city ? client.city : null, 'bg-gradient-to-br from-teal-500 to-cyan-600')}
                        </div>
                      </div>

                      {/* Membership Information */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Informations d'adhésion</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderDetailCard(CalendarDaysIcon, 'Membre depuis', 
                            client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : null,
                            'bg-gradient-to-br from-indigo-500 to-blue-600'
                          )}
                          {renderDetailCard(UserCircleIcon, 'Statut du compte', 'Client actif', 'bg-gradient-to-br from-purple-500 to-indigo-600')}
                        </div>
                      </div>

                      {/* Driving License Information */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Permis de conduire</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderDetailCard(IdentificationIcon, 'Numéro de permis', client.drivingLicenseNumber ? client.drivingLicenseNumber : null, 'bg-gradient-to-br from-amber-500 to-orange-600')}
                          {renderDetailCard(CalendarDaysIcon, 'Date d\'obtention', 
                            client.drivingLicenseDate ? new Date(client.drivingLicenseDate).toLocaleDateString('fr-FR') : null,
                            'bg-gradient-to-br from-pink-500 to-rose-600'
                          )}
                          {renderDetailCard(ClockIcon, 'Date d\'expiration', 
                            client.drivingLicenseExpirationDate ? new Date(client.drivingLicenseExpirationDate).toLocaleDateString('fr-FR') : null,
                            'bg-gradient-to-br from-red-500 to-pink-600'
                          )}
                        </div>
                      </div>

                      {/* Reservation Status Section */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">Possibilité de réservation</h3>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {canClientMakeReservations() ? (
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                              ) : (
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                              )}
                              <span className="font-medium text-gray-900">
                                {canClientMakeReservations() ? 'Peut faire des réservations' : 'Réservations bloquées'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              {canClientMakeReservations() ? (
                                <>
                                  <div className="flex-1 min-w-[300px]">
                                    <input
                                      type="text"
                                      value={blockReason}
                                      onChange={(e) => setBlockReason(e.target.value)}
                                      placeholder="Raison du blocage..."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleUpdateReservationPossibility(false)}
                                    disabled={isUpdating || !blockReason.trim()}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
                                  >
                                    Bloquer
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleUpdateReservationPossibility(true)}
                                  disabled={isUpdating}
                                  className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                                >
                                  Autoriser
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {!canClientMakeReservations() && client.blockForReservationReason && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Raison du blocage :</span> {client.blockForReservationReason}
                              </p>
                            </div>
                          )}
                          
                          {client.blockForReservationAt && (
                            <div className="mt-4 text-sm text-gray-500">
                              Bloqué le {new Date(client.blockForReservationAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - License Image */}
                    <div className="lg:col-span-1">
                      {client.drivingLicenseBackImage ? (
                        <div className="sticky top-8">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Permis de conduire</span>
                            </h4>
                            <div className="relative group">
                              <img 
                                src={client.drivingLicenseBackImage} 
                                alt="Permis de conduire"
                                className="w-full h-auto object-contain rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="mt-4 text-center">
                              <p className="text-sm text-gray-600">
                                Document officiel
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <IdentificationIcon className="text-gray-400 text-xl" />
                            </div>
                            <p className="text-gray-500 font-medium">Aucune image de permis</p>
                            <p className="text-gray-400 text-sm mt-1">Document non téléchargé</p>
                          </div>
                        </div>
                      )}

                      {/* Additional Stats Card */}
                      <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CalendarDaysIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-purple-700 mb-1">
                            {loadingCount ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-300 border-t-purple-600 mx-auto"></div>
                            ) : (
                              reservationCount ?? 0
                            )}
                          </div>
                          <p className="text-purple-600 font-medium text-sm">
                            Réservation{(reservationCount ?? 0) > 1 ? 's' : ''} totale{(reservationCount ?? 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-medium rounded-xl transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
                    >
                      Fermer
                    </button>
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

export default ClientDetailsModal;