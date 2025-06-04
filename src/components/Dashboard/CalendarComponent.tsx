import React, { useState, useEffect } from 'react';
import { Reservation } from '../../types/reservation.types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation handler for month transitions
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setIsAnimating(true);
    setTimeout(() => {
      if (direction === 'prev') {
        onPreviousMonth();
      } else {
        onNextMonth();
      }
      setIsAnimating(false);
    }, 150);
  };

  // Utility functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
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

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
    onDayClick(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gradient-to-r from-amber-400 to-orange-400';
      case 'CONFIRMED':
        return 'bg-gradient-to-r from-emerald-400 to-green-400';
      case 'CANCELLED':
        return 'bg-gradient-to-r from-rose-400 to-red-400';
      default:
        return 'bg-gradient-to-r from-blue-400 to-indigo-400';
    }
  };

  const renderCalendarHeader = () => {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center py-4 text-sm font-semibold tracking-wide ${index >= 5 ? 'text-rose-600' : 'text-slate-600'
              }`}
          >
            {day}
          </div>
        ))}
      </div>
    );
  };
  const openUpdateModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationModal(true);
    setShowDayModal(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push(
        <div
          key={`prev-${day}`}
          className="h-28 p-2 text-slate-400 bg-slate-50/50 hover:bg-slate-100/50 transition-all duration-200 rounded-xl cursor-pointer group"
        >
          <span className="text-sm font-medium opacity-60">{day}</span>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const reservationCount = getReservationCount(date);
      const hasReservationsForDay = hasReservations(date);
      const dayReservations = getReservationsForDate(date);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(date)}
          className={`h-28 p-2 transition-all duration-300 cursor-pointer rounded-xl group relative overflow-hidden
            ${isToday
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-200/50 scale-105'
              : hasReservationsForDay
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 shadow-sm hover:shadow-md'
                : 'bg-white hover:bg-slate-50 border border-slate-200/50 hover:border-slate-300/50 shadow-sm hover:shadow-md'
            }
            hover:scale-[1.02] hover:-translate-y-1
          `}
        >
          {/* Day number */}
          <div className="flex items-start justify-between mb-2">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-all duration-200
                ${isToday
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : hasReservationsForDay
                    ? 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                    : 'text-slate-700 group-hover:bg-slate-100'
                }
              `}
            >
              {day}
            </span>
            {hasReservationsForDay && (
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${isToday ? 'bg-white/20 text-white' : 'bg-indigo-500 text-white'
                  }`}>
                  {reservationCount}
                </span>
              </div>
            )}
          </div>

          {/* Reservations preview */}
          {hasReservationsForDay && (
            <div className="space-y-1">
              {dayReservations.slice(0, 2).map((reservation, index) => (
                <div
                  key={`reservation-${reservation._id}-${index}`}
                  className={`text-xs truncate px-2 py-1 rounded-md transition-all duration-200 ${isToday
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : 'bg-white shadow-sm border border-slate-200/50 text-slate-700 group-hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <TruckIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate font-medium">
                      {reservation.automobile?.brand} {reservation.automobile?.model}
                    </span>
                  </div>
                </div>
              ))}
              {reservationCount > 2 && (
                <div className={`text-xs px-2 py-1 rounded-md font-medium ${isToday
                    ? 'text-white/80'
                    : 'text-indigo-600'
                  }`}>
                  +{reservationCount - 2} autres
                </div>
              )}
            </div>
          )}

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl pointer-events-none" />
        </div>
      );
    }

    return days;
  };

  return (
    <>
      {/* Main Calendar Container */}
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-5 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110 group"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              </button>

              <div className={`text-center transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                  {getMonthName(currentDate)}
                </h2>
                <p className="text-white/80 text-base sm:text-lg font-medium">
                  {currentDate.getFullYear()}
                </p>
              </div>

              <button
                onClick={() => handleMonthChange('next')}
                className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110 group"
              >
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
            <div className="overflow-x-auto md:overflow-x-visible hide-scrollbar">
              <div className="min-w-[800px]">
                {renderCalendarHeader()}
                <div className={`grid grid-cols-7 gap-1 sm:gap-2 transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200/50">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <span className="font-medium">Aujourd'hui</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                <span className="font-medium">Avec réservations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl transition-all">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                          <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-2xl font-bold text-white">
                            {selectedDate?.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-white/80 text-xs sm:text-sm font-medium">
                            {getReservationsForDate(selectedDate!).length} réservation(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => {
                            setShowDayModal(false);
                            setShowReservationModal(true);
                          }}
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                          Nouvelle réservation
                        </button>
                        <button
                          onClick={() => setShowDayModal(false)}
                          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                        >
                          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-4 sm:p-8 max-h-[70vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
                    {selectedDate && getReservationsForDate(selectedDate).length === 0 ? (
                      // Empty State
                      <div className="flex justify-center items-center h-48 sm:h-64">
                        <div className="text-center space-y-4 sm:space-y-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                            <CalendarDaysIcon className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-500" />
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <h4 className="text-lg sm:text-xl font-semibold text-slate-800">Aucune réservation</h4>
                            <p className="text-slate-600 text-sm sm:text-base max-w-md">
                              Ce jour ne contient aucune réservation. Créez-en une nouvelle pour commencer.
                            </p>
                            <button
                              onClick={() => {
                                setShowDayModal(false);
                                setShowReservationModal(true);
                              }}
                              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                              Créer une réservation
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Reservations List
                      <div className="space-y-3 sm:space-y-4">
                        {selectedDate && getReservationsForDate(selectedDate).map((reservation, index) => (
                          <div
                            key={reservation._id}
                            className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailsModal(true);
                              setShowDayModal(false);
                            }}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex space-x-3 sm:space-x-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl sm:rounded-2xl">
                                  {reservation.automobile?.images && reservation.automobile?.images[0] ? (
                                    <img
                                      src={reservation.automobile?.images[0]}
                                      alt={`${reservation.automobile?.brand} ${reservation.automobile?.model}`}
                                      className="w-24 h-16 sm:w-30 sm:h-20 object-cover transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-24 h-16 sm:w-30 sm:h-20 bg-gray-200 flex items-center justify-center">
                                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                  <div>
                                    <h4 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                                      {reservation.automobile?.brand} {reservation.automobile?.model}
                                    </h4>
                                    <p className="text-slate-500 text-xs sm:text-sm font-medium">
                                      {reservation.automobile?.licensePlate}
                                    </p>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                                    <div className="flex items-center space-x-2">
                                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="font-medium">
                                        {reservation.client?.firstName} {reservation.client?.lastName}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span>
                                        {new Date(reservation.startDate).toLocaleDateString('fr-FR')} - {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <span className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-full text-white shadow-lg ${getStatusColor(reservation.status)}`}>
                                  {reservation.status}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditReservation(reservation);
                                    }}
                                    className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-indigo-500" />
                                  </button>
                                  <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reservation Creation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        onSubmit={() => {}}
      />

      {/* Reservation Details Modal */}
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