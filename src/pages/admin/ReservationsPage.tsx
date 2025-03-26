import React, { useEffect, useState } from 'react';
import { useReservation } from '../../contexts/ReservationContext';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { Reservation, ReservationStatus } from '../../types/reservation.types';
import { toast } from 'react-hot-toast';
import ReservationModal from '../../components/Reservations/ReservationModal';
import ReservationDetailsModal from '../../components/Reservations/ReservationDetailsModal';
import ReservationFilters from '../../components/Reservations/ReservationFilters';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ContractPDF from '../../components/PDF/ContractPDF';
import PDFWrapper from '../../components/PDF/PDFWrapper';

const ReservationsPage: React.FC = () => {
  const { 
    reservations, 
    loading, 
    fetchReservations, 
    cancelReservation, 
    confirmReservation,
    completeReservation,
    setPendingReservation,
    updateReservation,
    setPaymentStatus
  } = useReservation();
  const { updateAutomobile } = useAutomobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsReservation, setDetailsReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isKilometerModalOpen, setIsKilometerModalOpen] = useState(false);
  const [selectedAutomobileId, setSelectedAutomobileId] = useState<string>('');
  const [newKilometers, setNewKilometers] = useState<number>(0);
  const [currentKilometers, setCurrentKilometers] = useState<number>(0);
  const [processingReservationId, setProcessingReservationId] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedContractReservation, setSelectedContractReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (!isModalOpen) {
      fetchReservations();
    }
  }, [isModalOpen, fetchReservations]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      // Si le nouveau statut est "Terminé", ouvrir le modal pour saisir le kilométrage
      if (newStatus === ReservationStatus.COMPLETED) {
        const reservation = reservations.find(r => r._id === reservationId);
        if (reservation && reservation.automobile && reservation.automobile._id) {
          setSelectedAutomobileId(reservation.automobile._id);
          const currentMileage = reservation.automobile.mileage || 0;
          setCurrentKilometers(currentMileage);
          setNewKilometers(currentMileage);
          setProcessingReservationId(reservationId);
          setIsKilometerModalOpen(true);
          return; // Arrêter l'exécution ici, la mise à jour sera faite après la saisie du kilométrage
        }
      }

      // Pour les autres statuts, continuer normalement
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

  const handleIsPaidChange = async (reservationId: string, isPaid: boolean) => {
    try {
      await setPaymentStatus(reservationId, isPaid);
      toast.success('Statut de paiement mis à jour avec succès');
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de paiement:', error);
      toast.error('Erreur lors de la mise à jour du statut de paiement');
    }
  };

  const handleCompleteWithKilometers = async () => {
    try {
      if (!selectedAutomobileId || !processingReservationId) {
        toast.error('Données manquantes pour terminer la réservation');
        return;
      }

      // Mettre à jour le kilométrage de l'automobile
      const formData = new FormData();
      formData.append('mileage', newKilometers.toString());
      await updateAutomobile(selectedAutomobileId, formData);

      // Compléter la réservation
      await completeReservation(processingReservationId);
      
      toast.success('Réservation terminée et kilométrage mis à jour');
      setIsKilometerModalOpen(false);
      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
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

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Ajout du calcul des statistiques
  const reservationStats = {
    total: filteredReservations.length,
    pending: filteredReservations.filter(r => r.status === ReservationStatus.PENDING).length,
    confirmed: filteredReservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    cancelled: filteredReservations.filter(r => r.status === ReservationStatus.CANCELLED).length,
    completed: filteredReservations.filter(r => r.status === ReservationStatus.COMPLETED).length,
  };

  // Function to determine which page buttons to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at once
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(startPage + 2, totalPages - 1);
      
      // Adjust if we're near the end
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - 2);
      }
      
      // If there's a gap after 1, add ellipsis
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add the calculated page range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // If there's a gap before the last page, add ellipsis
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Function to open the modal for creating a new reservation
  const openCreateModal = () => {
    setSelectedReservation(null);
    setIsModalOpen(true);
  };

  // Function to open the modal for updating an existing reservation
  const openUpdateModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
        <button
          onClick={openCreateModal}
          className="group relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-blue-600 hover:to-indigo-700"
          title="Créer une réservation"
        >
          <div className="relative flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-25 bg-white transition-opacity duration-200"></div>
          </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payé
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((reservation, index) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.isPaid ? 'yes' : 'no'}
                        onChange={(e) => handleIsPaidChange(reservation._id, e.target.value === 'yes')}
                        className={`
                          mt-1 block w-full text-center rounded-lg border-0 py-2 pl-3 pr-3 text-sm
                          focus:ring-2 focus:ring-blue-500 focus:outline-none
                          ${reservation.isPaid 
                            ? 'bg-green-50 text-green-800' 
                            : 'bg-red-50 text-red-800'
                          }
                          transition-colors duration-200
                        `}
                      >
                        <option value="no" className="bg-red-50 text-red-800">Non payé</option>
                        <option value="yes" className="bg-green-50 text-green-800">Payé</option>
                      </select>
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
                          onClick={() => openUpdateModal(reservation)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        
                        <PDFWrapper reservation={reservation} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredReservations.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="flex items-center mb-4 sm:mb-0">
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">{indexOfFirstItem + 1}</span>{' '}
              à{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredReservations.length)}
              </span>{' '}
              sur{' '}
              <span className="font-medium">{filteredReservations.length}</span>{' '}
              résultats
            </p>
            <div className="ml-4">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
                <option value={50}>50 par page</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Précédent
            </button>
            
            {getPageNumbers().map((number, index) => (
              <button
                key={index}
                onClick={() => typeof number === 'number' ? paginate(number) : null}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  number === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : number === '...'
                    ? 'bg-white text-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                disabled={number === '...'}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal pour saisir le nouveau kilométrage */}
      {isKilometerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Mise à jour du kilométrage
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Veuillez vérifier le kilométrage actuel sur le compteur du véhicule et saisir la valeur réelle pour terminer la réservation.
                      </p>
                      <div className="mt-4">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Kilométrage enregistré: </span>
                          <span className="text-sm text-gray-900">{currentKilometers} km</span>
                        </div>
                        <label htmlFor="kilometers" className="block text-sm font-medium text-gray-700">
                          Nouveau kilométrage (relevé sur le véhicule)
                        </label>
                        <input
                          type="number"
                          id="kilometers"
                          value={newKilometers === currentKilometers ? '' : newKilometers}
                          onChange={(e) => setNewKilometers(e.target.value === '' ? currentKilometers : Number(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          min={currentKilometers}
                          placeholder={`Entrez le kilométrage actuel (minimum ${currentKilometers} km)`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCompleteWithKilometers}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setIsKilometerModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

    
    </div>
  );
};

export default ReservationsPage;