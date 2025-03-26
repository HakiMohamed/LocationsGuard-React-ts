import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { ReservationStats } from '../../types/automobile.types';

interface ReservationStatsComponentProps {
  mostReserved: ReservationStats[];
  leastReserved: ReservationStats[];
  onAutomobileClick: (automobile: any) => void;
}

const ReservationStatsComponent: React.FC<ReservationStatsComponentProps> = ({
  mostReserved,
  leastReserved,
  onAutomobileClick,
}) => {
  const pieChartData = {
    labels: mostReserved.map(auto => `${auto.brand} ${auto.model}`),
    datasets: [{
      data: mostReserved.map(auto => auto.reservationCount),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
      borderWidth: 1
    }]
  };

  const barChartData = {
    labels: leastReserved.map(auto => `${auto.brand} ${auto.model}`),
    datasets: [{
      label: 'Nombre de réservations',
      data: leastReserved.map(auto => auto.reservationCount),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderWidth: 1
    }]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Véhicules les plus réservés
          </h2>
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="mb-8 h-72">
          <Pie 
            data={pieChartData} 
            options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { position: 'bottom' } } 
            }} 
          />
        </div>
        <div className="space-y-4">
          {mostReserved.map((auto) => (
            <div
              key={auto._id}
              onClick={() => onAutomobileClick(auto)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  {auto.images && auto.images[0] ? (
                    <img
                      src={auto.images[0]}
                      alt={`${auto.brand} ${auto.model}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {auto.brand} {auto.model}
                  </h3>
                  <p className="text-sm text-gray-500">Année {auto.year}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium group-hover:bg-blue-200">
                  {auto.reservationCount} réservation{auto.reservationCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Véhicules les moins réservés
          </h2>
          <div className="bg-red-100 rounded-full p-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
        </div>
        <div className="mb-8 h-72">
          <Bar 
            data={barChartData} 
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 }
                }
              }
            }} 
          />
        </div>
        <div className="space-y-4">
          {leastReserved.map((auto) => (
            <div
              key={auto._id}
              onClick={() => onAutomobileClick(auto)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  {auto.images && auto.images[0] ? (
                    <img
                      src={auto.images[0]}
                      alt={`${auto.brand} ${auto.model}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600">
                    {auto.brand} {auto.model}
                  </h3>
                  <p className="text-sm text-gray-500">Année {auto.year}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium group-hover:bg-red-200">
                  {auto.reservationCount} réservation{auto.reservationCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationStatsComponent;