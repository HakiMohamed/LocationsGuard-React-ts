import { useState, useEffect } from 'react';

interface Reservation {
  id: number;
  vehicleBrand: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
}

const ClientReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Remplacer par votre appel API réel
        const response = await fetch('/api/reservations');
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Mes Réservations</h1>
      <div className="space-y-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2 dark:text-white">
                  {reservation.vehicleBrand} {reservation.vehicleModel}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Du {new Date(reservation.startDate).toLocaleDateString()} au{' '}
                  {new Date(reservation.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  reservation.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : reservation.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {reservation.status === 'confirmed' && 'Confirmée'}
                  {reservation.status === 'pending' && 'En attente'}
                  {reservation.status === 'completed' && 'Terminée'}
                  {reservation.status === 'cancelled' && 'Annulée'}
                </span>
                <p className="mt-2 text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {reservation.totalPrice}DH
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientReservations; 