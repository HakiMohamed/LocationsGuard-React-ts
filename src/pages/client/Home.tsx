import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">
        Bienvenue sur AutoLoc
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link
          to="/vehicles"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Voir nos véhicules
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Découvrez notre flotte de véhicules disponibles à la location
          </p>
        </Link>
        <Link
          to="/services"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">
            Nos services
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Consultez nos différentes offres et services
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Home; 