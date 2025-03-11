const Services = () => {
  const services = [
    {
      title: "Location courte durée",
      description: "Location de véhicules pour quelques jours",
      price: "À partir de 50DH/jour"
    },
    {
      title: "Location longue durée",
      description: "Location de véhicules pour plusieurs mois",
      price: "À partir de 400DH/mois"
    },
    {
      title: "Assurance tous risques",
      description: "Protection complète pendant votre location",
      price: "Incluse dans nos tarifs"
    },
    {
      title: "Assistance 24/7",
      description: "Service d'assistance disponible à tout moment",
      price: "Service gratuit"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Nos Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">{service.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold">{service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services; 