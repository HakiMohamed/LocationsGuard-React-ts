import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
}

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un appel API
    const fetchVehicles = async () => {
      try {
        // Remplacer par votre appel API réel
        const response = await fetch('/api/vehicles');
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Nos Véhicules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            to={`/vehicles/${vehicle.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Année: {vehicle.year}</p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
                {vehicle.price}DH /jour
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList; 