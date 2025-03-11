import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  image: string;
  features: string[];
}

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Remplacer par votre appel API réel
        const response = await fetch(`/api/vehicles/${id}`);
        const data = await response.json();
        setVehicle(data);
      } catch (error) {
        console.error('Erreur lors du chargement du véhicule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleReservation = () => {
    // Implémenter la logique de réservation
    navigate('/reservations/new', { state: { vehicleId: id } });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!vehicle) {
    return <div>Véhicule non trouvé</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4 dark:text-white">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Année: {vehicle.year}
          </p>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-6">
            {vehicle.price}DH /jour
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {vehicle.description}
          </p>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Caractéristiques
          </h2>
          <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300">
            {vehicle.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={handleReservation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Réserver ce véhicule
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails; 