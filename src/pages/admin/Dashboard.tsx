import React, { useEffect } from 'react';
import { useAutomobile } from '../../contexts/AutomobileContext';
import { useCategory } from '../../contexts/CategoryContext';

const Dashboard: React.FC = () => {
  const { automobiles, fetchAutomobiles } = useAutomobile();
  const { categories, fetchCategories } = useCategory();

  useEffect(() => {
    fetchAutomobiles();
    fetchCategories();
  }, [fetchAutomobiles, fetchCategories]);

  const totalAutomobiles = automobiles?.length || 0;
  const availableAutomobiles = automobiles?.filter(auto => auto.isAvailable)?.length || 0;
  const totalCategories = categories?.length || 0;
  const averagePrice = automobiles && automobiles.length > 0
    ? Math.round(automobiles.reduce((acc, auto) => acc + (auto.dailyRate || 0), 0) / totalAutomobiles)
    : 0;

  const occupancyRate = totalAutomobiles > 0
    ? ((availableAutomobiles / totalAutomobiles) * 100).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total Automobiles",
      value: totalAutomobiles,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Véhicules Disponibles",
      value: availableAutomobiles,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Catégories",
      value: totalCategories,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Prix Moyen/Jour",
      value: `${averagePrice} DH`,
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-gray-600">Vue d'ensemble de votre flotte automobile</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-2`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} rounded-full p-3`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Répartition par catégorie</h2>
          <div className="space-y-4">
            {categories?.map(category => {
              const count = automobiles?.filter(auto => 
                (typeof auto.category === 'object' ? auto.category?._id : auto.category) === category._id
              ).length || 0;
              const percentage = (count / totalAutomobiles) * 100 || 0;

              return (
                <div key={category._id} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{category.name}</span>
                    <span>{count} véhicules</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistiques récentes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques récentes</h2>
          <div className="space-y-6">
            {/* Taux d'occupation */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Taux d'occupation</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>

            {/* Autres statistiques statiques */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Réservations du mois</p>
                <p className="text-xl font-bold text-gray-900 mt-1">24</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Revenu mensuel</p>
                <p className="text-xl font-bold text-gray-900 mt-1">45,750 DH</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Nouveaux clients</p>
                <p className="text-xl font-bold text-gray-900 mt-1">12</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Satisfaction client</p>
                <p className="text-xl font-bold text-gray-900 mt-1">4.8/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
