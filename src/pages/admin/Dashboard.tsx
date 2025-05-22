import React, { useEffect, useState } from 'react';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useCategory } from '../../contexts/CategoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { useReservation } from '../../contexts/ReservationContext';
import { useClient } from '../../contexts/ClientContext';
import { Reservation, ReservationStatus } from '../../types/reservation.types';
import { ReservationStats } from '../../types/automobile.types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import CalendarComponent from '../../components/Dashboard/CalendarComponent';
import StatsOverviewComponent from '../../components/Dashboard/StatsOverviewComponent';
import ReservationStatsComponent from '../../components/Dashboard/ReservationStatsComponent';
import ReservationModal from '../../components/Reservations/ReservationModal';
import ReservationDetailsModal from '../../components/Reservations/ReservationDetailsModal';
import AutomobileDetailsModal from '../../components/Automobiles/AutomobileDetailsModal';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard: React.FC = () => {
  const { automobiles, fetchAutomobiles, getMostReservedAutomobiles, getLeastReservedAutomobiles } = useAutomobile();
  const { categories, fetchCategories } = useCategory();
  const { user } = useAuth();
  const { reservations, fetchReservations, updateReservationStatus } = useReservation();
  const { clients, fetchClients } = useClient();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDayReservations, setSelectedDayReservations] = useState<Reservation[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedDetailReservation, setSelectedDetailReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [mostReserved, setMostReserved] = useState<ReservationStats[]>([]);
  const [leastReserved, setLeastReserved] = useState<ReservationStats[]>([]);
  const [selectedAutomobile, setSelectedAutomobile] = useState<any>(null);
  const [showAutomobileModal, setShowAutomobileModal] = useState(false);

  // Initial data fetching
  useEffect(() => {
    fetchAutomobiles();
    fetchCategories();
    fetchReservations();
    fetchClients();
  }, [fetchAutomobiles, fetchCategories, fetchReservations, fetchClients]);

  // Fetch reservation statistics
  useEffect(() => {
    const fetchReservationStats = async () => {
      try {
        const mostReservedData = await getMostReservedAutomobiles(5);
        const leastReservedData = await getLeastReservedAutomobiles(5);
        
        const enrichedMostReserved = await Promise.all(
          mostReservedData.map(async (stat) => {
            const autoDetails = automobiles.find(auto => auto._id === stat.automobileId);
            if (autoDetails) {
              return {
                ...stat,
                ...autoDetails,
                category: categories.find(cat => 
                  cat._id === (typeof autoDetails.category === 'string' 
                    ? autoDetails.category 
                    : autoDetails.category?._id
                  )
                ) || { name: 'N/A' }
              };
            }
            return stat;
          })
        );

        const enrichedLeastReserved = await Promise.all(
          leastReservedData.map(async (stat) => {
            const autoDetails = automobiles.find(auto => auto._id === stat.automobileId);
            if (autoDetails) {
              return {
                ...stat,
                ...autoDetails,
                category: categories.find(cat => 
                  cat._id === (typeof autoDetails.category === 'string' 
                    ? autoDetails.category 
                    : autoDetails.category?._id
                  )
                ) || { name: 'N/A' }
              };
            }
            return stat;
          })
        );

        setMostReserved(enrichedMostReserved);
        setLeastReserved(enrichedLeastReserved);
      } catch (error) {
        console.error('Error fetching reservation stats:', error);
      }
    };

    if (categories.length > 0 && automobiles.length > 0) {
      fetchReservationStats();
    }
  }, [getMostReservedAutomobiles, getLeastReservedAutomobiles, categories, automobiles]);

  // Computed values
  const totalAutomobiles = automobiles?.length || 0;
  const availableAutomobiles = automobiles?.filter(auto => auto.isAvailable)?.length || 0;
  const totalCategories = categories?.length || 0;
  const averagePrice = automobiles && automobiles.length > 0
    ? Math.round(automobiles.reduce((acc, auto) => acc + (auto.dailyRate || 0), 0) / totalAutomobiles)
    : 0;

  // Handlers
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    const dayReservations = getReservationsForDay(date);
    setSelectedDate(date);
    setSelectedDayReservations(dayReservations);
    setShowModal(true);
  };

  const handleStatusChange = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      
      if (selectedDetailReservation && selectedDetailReservation._id === reservationId) {
        setSelectedDetailReservation({
          ...selectedDetailReservation,
          status: newStatus
        });
      }

      setSelectedDayReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === reservationId
            ? { ...res, status: newStatus }
            : res
        )
      );

      await fetchReservations();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleAutomobileClick = (automobile: any) => {
    setSelectedAutomobile(automobile);
    setShowAutomobileModal(true);
  };

  const getReservationsForDay = (date: Date) => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  return (
    <div className="container mx-auto ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-gray-600">Vue d'ensemble de votre flotte automobile</p>
      </div>

      <CalendarComponent
        currentDate={currentDate}
        reservations={reservations}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onDayClick={handleDayClick}
      />

      <StatsOverviewComponent
        totalAutomobiles={totalAutomobiles}
        totalClients={clients.length}
        totalReservations={reservations.length}
        availableAutomobiles={availableAutomobiles}
        totalCategories={totalCategories}
        averagePrice={averagePrice}
      />

      <ReservationStatsComponent
        mostReserved={mostReserved}
        leastReserved={leastReserved}
        onAutomobileClick={handleAutomobileClick}
      />

      {/* Modals */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        reservation={null}
      />

      <ReservationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetailReservation(null);
        }}
        reservation={selectedDetailReservation}
        onStatusChange={handleStatusChange}
      />

      <AutomobileDetailsModal
        isOpen={showAutomobileModal}
        onClose={() => setShowAutomobileModal(false)}
        automobile={selectedAutomobile}
      />
    </div>
  );
};

export default Dashboard;