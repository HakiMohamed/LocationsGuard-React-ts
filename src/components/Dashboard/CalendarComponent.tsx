import React, { useState } from 'react';
import { Reservation } from '../../types/reservation.types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ReservationModal from '../Reservations/ReservationModal';
import ReservationDetailsModal from '../Reservations/ReservationDetailsModal';

interface CalendarComponentProps {
  currentDate: Date;
  reservations: Reservation[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
  onStatusChange?: (reservationId: string, newStatus: string) => Promise<void>;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  currentDate,
  reservations,
  onPreviousMonth,
  onNextMonth,
  onDayClick,
  onStatusChange,
}) => {
  // Nouveaux états pour les modaux
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('fr-FR', { month: 'long' });
  };

  const hasReservations = (date: Date) => {
    return reservations.some(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getReservationCount = (date: Date) => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      return date >= startDate && date <= endDate;
    }).length;
  };

  // Nouveau gestionnaire de clic sur un jour
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
    onDayClick(date);
  };

  // Calendar rendering
  const renderCalendarHeader = () => {
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center py-2 text-xs sm:text-sm font-medium ${
              index === 0 || index === 6 ? 'text-rose-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50/30"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const reservationCount = getReservationCount(date);
      const hasReservationsForDay = hasReservations(date);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(date)}
          className={`h-24 sm:h-32 p-1.5 sm:p-3 transition-all duration-200 cursor-pointer relative
            ${isToday ? 'bg-violet-50/80 ring-2 ring-violet-200' : 'hover:bg-gray-50/80'}
            ${hasReservationsForDay ? 'bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium
                ${isToday ? 'bg-violet-600 text-white' : 'text-gray-700'}
                transition-colors duration-200
              `}
            >
              {day}
            </span>
            {hasReservationsForDay && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] sm:text-xs font-bold leading-none text-violet-600 bg-violet-100 rounded-full">
                {reservationCount}
              </span>
            )}
          </div>
          {hasReservationsForDay && (
            <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
              {reservations
                .filter(reservation => {
                  const startDate = new Date(reservation.startDate);
                  const endDate = new Date(reservation.endDate);
                  return date >= startDate && date <= endDate;
                })
                .slice(0, 2)
                .map((reservation, index) => (
                  <div
                    key={`reservation-${reservation._id}-${index}`}
                    className="text-[10px] sm:text-xs truncate px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-white/90 text-violet-700 shadow-sm hover:shadow transition-all duration-200"
                  >
                    {reservation.automobile?.brand} {reservation.automobile?.model}
                  </div>
                ))}
              {reservationCount > 2 && (
                <div className="text-[10px] sm:text-xs text-violet-500 italic px-1.5 sm:px-2">
                  +{reservationCount - 2} autres...
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-violet-50 rounded-full transition-colors duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
            {getMonthName(currentDate)} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-violet-50 rounded-full transition-colors duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="overflow-hidden rounded-xl">
          {renderCalendarHeader()}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100/50">
            {renderCalendarDays()}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-end gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 border border-violet-500 bg-violet-300 rounded-full mr-1.5 sm:mr-2"></div>
            <span>Jour avec réservations</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-violet-600 rounded-full mr-1.5 sm:mr-2"></div>
            <span>Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Modal pour les réservations du jour */}
      <Transition appear show={showDayModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDayModal(false)}>
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">
                          Réservations du {selectedDate?.toLocaleDateString('fr-FR', { 
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </h3>
                        <button
                          onClick={() => {
                            setShowDayModal(false);
                            setShowReservationModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 font-medium text-sm"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Nouvelle réservation
                        </button>
                      </div>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      <div className="space-y-4">
                        {selectedDate && reservations
                          .filter(reservation => {
                            const startDate = new Date(reservation.startDate);
                            const endDate = new Date(reservation.endDate);
                            return selectedDate >= startDate && selectedDate <= endDate;
                          })
                          .length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                              <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                  </svg>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-gray-500 font-medium">Ce jour vous n'avez pas de réservations</p>
                                  <button
                                    onClick={() => {
                                      setShowDayModal(false);
                                      setShowReservationModal(true);
                                    }}
                                    className="inline-flex items-center px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                  >
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                    Créer une réservation
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            reservations
                              .filter(reservation => {
                                const startDate = new Date(reservation.startDate);
                                const endDate = new Date(reservation.endDate);
                                return selectedDate >= startDate && selectedDate <= endDate;
                              })
                              .map((reservation) => (
                                <div
                                  key={reservation._id}
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowDetailsModal(true);
                                    setShowDayModal(false);
                                  }}
                                  className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-200 cursor-pointer"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {reservation.automobile?.brand} {reservation.automobile?.model}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {reservation.client?.firstName} {reservation.client?.lastName}
                                        </p>
                                      </div>
                                    </div>
                                    <span className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                      reservation.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      reservation.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      reservation.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                      'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                      {reservation.status}
                                    </span>
                                  </div>
                                </div>
                              ))
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

      {/* Modal de création de réservation */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        reservation={null}
      />

      {/* Modal de détails de réservation */}
      {selectedReservation && (
        <ReservationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
};

export default CalendarComponent;