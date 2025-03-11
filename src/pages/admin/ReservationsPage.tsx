import React, { useEffect, useState } from 'react';
import { useReservation } from '../../contexts/ReservationContext';
import { Reservation, ReservationStatus } from '../../types/reservation.types';
import { toast } from 'react-hot-toast';
import ReservationModal from '../../components/Reservations/ReservationModal';
import ReservationDetailsModal from '../../components/Reservations/ReservationDetailsModal';
import ReservationFilters from '../../components/Reservations/ReservationFilters';
import { PlusIcon } from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import UpdateReservationModal from '../../components/Reservations/UpdateReservationModal';

const ReservationsPage: React.FC = () => {
  const { 
    reservations, 
    loading, 
    fetchReservations, 
    cancelReservation, 
    confirmReservation,
    completeReservation,
    setPendingReservation
  } = useReservation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsReservation, setDetailsReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (!isModalOpen) {
      fetchReservations();
    }
  }, [isModalOpen, fetchReservations]);

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      switch (newStatus) {
        case ReservationStatus.PENDING:
          await setPendingReservation(reservationId);
          break;
        case ReservationStatus.CANCELLED:
          await cancelReservation(reservationId, 'Annulation par l\'administrateur');
          break;
        case ReservationStatus.CONFIRMED:
          await confirmReservation(reservationId);
          break;
        case ReservationStatus.COMPLETED:
          await completeReservation(reservationId);
          break;
        default:
          throw new Error('Statut non pris en charge');
      }
      toast.success('Statut de la réservation mis à jour avec succès');
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadgeClass = (status: ReservationStatus) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case ReservationStatus.PENDING:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case ReservationStatus.CONFIRMED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case ReservationStatus.CANCELLED:
        return `${baseClasses} bg-red-100 text-red-800`;
      case ReservationStatus.COMPLETED:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return baseClasses;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Date invalide';
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      (reservation.client?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.client?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.automobile?.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (reservation.automobile?.model?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || reservation.status === statusFilter;

    let matchesDate = true;
    if (dateFilter && reservation.startDate) {
      const today = new Date();
      const startDate = new Date(reservation.startDate);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = format(today, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
          break;
        case 'week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
          matchesDate = startDate >= weekStart && startDate <= weekEnd;
          break;
        case 'month':
          matchesDate = 
            startDate.getMonth() === today.getMonth() &&
            startDate.getFullYear() === today.getFullYear();
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Ajout du calcul des statistiques
  const reservationStats = {
    total: filteredReservations.length,
    pending: filteredReservations.filter(r => r.status === ReservationStatus.PENDING).length,
    confirmed: filteredReservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    cancelled: filteredReservations.filter(r => r.status === ReservationStatus.CANCELLED).length,
    completed: filteredReservations.filter(r => r.status === ReservationStatus.COMPLETED).length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
        <button
          onClick={() => {
            setSelectedReservation(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle réservation
        </button>
      </div>

      {/* Ajout des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{reservationStats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-yellow-800">En attente</div>
          <div className="mt-1 text-2xl font-semibold text-yellow-900">{reservationStats.pending}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-green-800">Confirmées</div>
          <div className="mt-1 text-2xl font-semibold text-green-900">{reservationStats.confirmed}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-red-800">Annulées</div>
          <div className="mt-1 text-2xl font-semibold text-red-900">{reservationStats.cancelled}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-blue-800">Terminées</div>
          <div className="mt-1 text-2xl font-semibold text-blue-900">{reservationStats.completed}</div>
        </div>
      </div>

      <ReservationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune réservation trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation, index) => (
                  <tr key={`${reservation._id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.client?.firstName} {reservation.client?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.client?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {reservation.automobile?.brand} {reservation.automobile?.model}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.automobile?.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {reservation.startDate ? formatDate(reservation.startDate.toString()) : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.endDate ? formatDate(reservation.endDate.toString()) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reservation.totalPrice} DH
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusChange(reservation._id, e.target.value as ReservationStatus)}
                          className={`
                            block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                            ${reservation.status === ReservationStatus.PENDING ? 'bg-yellow-50 text-yellow-800' : ''}
                            ${reservation.status === ReservationStatus.CONFIRMED ? 'bg-green-50 text-green-800' : ''}
                            ${reservation.status === ReservationStatus.CANCELLED ? 'bg-red-50 text-red-800' : ''}
                            ${reservation.status === ReservationStatus.COMPLETED ? 'bg-blue-50 text-blue-800' : ''}
                          `}
                        >
                          <option value={ReservationStatus.PENDING} className="bg-yellow-50 text-yellow-800">
                            En attente
                          </option>
                          <option value={ReservationStatus.CONFIRMED} className="bg-green-50 text-green-800">
                            Confirmée
                          </option>
                          <option value={ReservationStatus.CANCELLED} className="bg-red-50 text-red-800">
                            Annulée
                          </option>
                          <option value={ReservationStatus.COMPLETED} className="bg-blue-50 text-blue-800">
                            Terminée
                          </option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setDetailsReservation(reservation);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setIsUpdateModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="relative z-50">
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchReservations();
          }}
          reservation={selectedReservation}
        />
      </div>

      <div className="relative z-50">
        <ReservationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setDetailsReservation(null);
          }}
          reservation={detailsReservation}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="relative z-50">
        <UpdateReservationModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedReservation(null);
            fetchReservations();
          }}
          reservation={selectedReservation}
        />
      </div>
    </div>
  );
};

export default ReservationsPage;
