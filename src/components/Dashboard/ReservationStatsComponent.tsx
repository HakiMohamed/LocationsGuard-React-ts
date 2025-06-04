import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ReservationStats } from '../../types/automobile.types';
import { PieChart, Pie, Cell, Legend as PieLegend, Tooltip as PieTooltip } from 'recharts';


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
  const COLORS = ['#6366F1', '#8B5CF6', '#F59E42', '#10B981', '#F43F5E', '#FBBF24', '#3B82F6', '#14B8A6', '#E11D48', '#A21CAF'];

  const pieChartData = mostReserved.map((auto, index) => ({
    name: `${auto.brand} ${auto.model}`,
    value: auto.reservationCount,
    color: COLORS[index % COLORS.length]
  }));

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
        <div className="mb-8 flex flex-col items-center w-full" style={{ minHeight: 300 }}>
          <PieChart width={window.innerWidth < 640 ? 250 : 350} height={window.innerWidth < 640 ? 250 : 300}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={false}
              labelLine={false}
              stroke="#fff"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value, name, _props, payload) => {
                let entry = { name };
                if (Array.isArray(payload) && payload[0] && payload[0].payload) {
                  entry = payload[0].payload;
                }
                return [`${value} réservations`, entry.name];
              }}
            />
          </PieChart>
          <div className="flex flex-wrap justify-center gap-4 mt-6 w-full">
            {pieChartData.map((entry, idx) => {
              const percent = ((entry.value / pieChartData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(0);
              return (
                <div key={entry.name} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 shadow-sm" style={{ minWidth: 120 }}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color, display: 'inline-block' }}></span>
                  <span className="font-medium text-gray-900 whitespace-nowrap">{entry.name}</span>
                  <span className="text-xs text-gray-500">({entry.value} réservations, {percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          {mostReserved.map((auto) => (
            <div
              key={auto._id}
              onClick={() => onAutomobileClick(auto)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all duration-300 group gap-3 sm:gap-0"
            >
              <div className="flex flex-row sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                    {auto.brand} {auto.model}
                  </h3>
                  <p className="text-sm text-gray-500">Année {auto.year}</p>
                </div>
              </div>
              <div className="flex items-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium group-hover:bg-blue-200">
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
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-red-50 cursor-pointer transition-all duration-300 group gap-3 sm:gap-0"
            >
              <div className="flex flex-row sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 truncate">
                    {auto.brand} {auto.model}
                  </h3>
                  <p className="text-sm text-gray-500">Année {auto.year}</p>
                </div>
              </div>
              <div className="flex items-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                <span className="px-3 py-1 sm:px-4 sm:py-2 bg-red-100 text-red-800 rounded-full text-xs sm:text-sm font-medium group-hover:bg-red-200">
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