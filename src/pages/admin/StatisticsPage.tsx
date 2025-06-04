import React, { useEffect, useState } from 'react';
import { useStats } from '../../contexts/StatsContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#6366F1', '#8B5CF6', '#F59E42', '#10B981', '#F43F5E', '#FBBF24', '#3B82F6', '#14B8A6', '#E11D48', '#A21CAF'];

const periodOptions = [
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
  { value: 'week', label: 'Semaine' },
  { value: 'day', label: 'Jour' },
];

const StatisticsPage: React.FC = () => {
  const { expensesStats, benefitsStats, fetchExpensesStats, fetchBenefitsStats, loading, error } = useStats();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('month');
  const [viewType, setViewType] = useState<'charts' | 'tables' | 'cards' | 'linear'>('charts');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats with params:', { startDate, endDate, period });
        await Promise.all([
          fetchExpensesStats({ startDate, endDate, period }),
          fetchBenefitsStats({ startDate, endDate })
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [startDate, endDate, period, fetchExpensesStats, fetchBenefitsStats]);

  // Add debug logs
  useEffect(() => {
    console.log('expensesStats:', expensesStats);
    console.log('benefitsStats:', benefitsStats);
  }, [expensesStats, benefitsStats]);

  // Helper function to format currency
  const formatCurrency = (value?: number) => {  
    if (value === undefined || value === null) return '0 MAD';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' });
  };

  return (
    <div className=" mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiques</h1>
      
     

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <span className="ml-4 text-lg text-gray-600">Chargement des statistiques...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : !expensesStats && !benefitsStats ? (
        <div className="text-center text-gray-500 py-8">
          Aucune donnée disponible pour la période sélectionnée
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          {benefitsStats?.overview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
                <div className="text-lg font-semibold mb-2">Revenus Réalisés</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(benefitsStats.overview.realizedRevenue)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
                <div className="text-lg font-semibold mb-2">Bénéfice Net</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(benefitsStats.overview.netProfit)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
                <div className="text-lg font-semibold mb-2">Bénéfice Potentiel</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(benefitsStats.overview.potentialProfit)}
                </div>
              </div>
            </div>
          )}

          {/* Réservations Stats */}
          {benefitsStats?.reservations && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Statistiques des Réservations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Réservations Payées */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Réservations Payées</h3>
                  <div className="space-y-4">
                    {Object.entries(benefitsStats.reservations.paid || {}).map(([status, data]: [string, any]) => (
                      <div key={status} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-sm text-gray-500 ml-2">({data.count || 0})</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(data.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Réservations Non Payées */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Réservations Non Payées</h3>
                  <div className="space-y-4">
                    {Object.entries(benefitsStats.reservations.unpaid || {}).map(([status, data]: [string, any]) => (
                      <div key={status} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-sm text-gray-500 ml-2">({data.count || 0})</span>
                        </div>
                        <div className="font-semibold text-orange-600">
                          {formatCurrency(data.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expenses Stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Statistiques des Dépenses</h2>
              
              {/* View Type Selector */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => setViewType('charts')}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewType === 'charts'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Graphiques</span>
                </button>
                <button
                  onClick={() => setViewType('linear')}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewType === 'linear'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v16H4V4z" />
                  </svg>
                  <span className="text-sm font-medium">Linéaire</span>
                </button>
                <button
                  onClick={() => setViewType('tables')}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewType === 'tables'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Tableaux</span>
                </button>
                <button
                  onClick={() => setViewType('cards')}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                    viewType === 'cards'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-sm font-medium">Cartes</span>
                </button>
              </div>
            </div>
            
            {/* Overview Cards - Always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Total des Dépenses</h3>
                <div className="text-2xl sm:text-3xl font-bold">{formatCurrency(expensesStats?.total || 0)}</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Moyenne Mensuelle</h3>
                <div className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(expensesStats?.monthlyAverage || 0)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Plus Grande Dépense</h3>
                <div className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(expensesStats?.highestExpense.price || 0)}
                </div>
                <div className="mt-2 text-xs sm:text-sm opacity-90">
                  <div>{expensesStats?.highestExpense.type}</div>
                  <div>{expensesStats?.highestExpense.category}</div>
                </div>
              </div>
            </div>

            {/* Linear View */}
            {viewType === 'linear' && expensesStats?.timeline?.data?.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:gap-8 mb-6 sm:mb-8">
                {/* Line Chart - Répartition des Dépenses par Type */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-700">Répartition des Dépenses par Type</h3>
                  {/* Légende interactive */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {expensesStats.timeline.types.map((type, index) => {
                      const totalAmount = expensesStats.timeline.data.reduce(
                        (sum, item) => sum + (item[type] || 0), 0
                      );
                      const totalCount = expensesStats.timeline.data.reduce(
                        (sum, item) => sum + (item[`${type}_count`] || 0), 0
                      );
                      const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
                      return (
                        <div key={type} className="flex items-center bg-white rounded-lg shadow-sm px-3 py-2 text-xs sm:text-sm">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <div>
                            <div className="font-medium text-gray-900">{type}</div>
                            <div className="text-gray-600">
                              <div className="font-bold">{formatCurrency(totalAmount)}</div>
                              <div>{totalCount} opérations</div>
                              <div>Moy: {formatCurrency(avgAmount)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={expensesStats.timeline.data}
                        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="period"
                          type="category"
                          stroke="#999"
                          tick={{ fill: '#666', fontSize: 10 }}
                          tickFormatter={value => format(new Date(value), 'MMM yyyy', { locale: fr })}
                          axisLine={{ stroke: '#eee' }}
                          height={60}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          stroke="#999"
                          tick={{ fill: '#666', fontSize: 10 }}
                          tickFormatter={value => formatCurrency(value)}
                          axisLine={{ stroke: '#eee' }}
                        />
                        <Tooltip
                          formatter={(value, name, props) => {
                            const item = props.payload;
                            return [
                              formatCurrency(value),
                              `${name} (${item[`${name}_count`] || 0} opérations)`
                            ];
                          }}
                          labelFormatter={label => format(new Date(label), 'MMMM yyyy', { locale: fr })}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="plainline"
                          formatter={value => (
                            <span style={{ color: '#666', fontSize: '10px' }}>{value}</span>
                          )}
                        />
                        {expensesStats.timeline.types.map((type, index) => (
                          <Line
                            key={type}
                            type="monotone"
                            dataKey={type}
                            name={type}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 4,
                              stroke: COLORS[index % COLORS.length],
                              strokeWidth: 2,
                              fill: 'white'
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart - Évolution des Dépenses Totales */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-700">Évolution des Dépenses Totales</h3>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={expensesStats.timeline.data}
                        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="period"
                          type="category"
                          stroke="#6B7280"
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                          tickFormatter={value => format(new Date(value), 'MMM yyyy', { locale: fr })}
                          height={60}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis
                          stroke="#6B7280"
                          tick={{ fill: '#6B7280', fontSize: 10 }}
                          tickFormatter={value => formatCurrency(value)}
                        />
                        <Tooltip
                          formatter={value => formatCurrency(value)}
                          labelFormatter={label => format(new Date(label), 'MMMM yyyy', { locale: fr })}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            padding: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={item =>
                            expensesStats.timeline.types.reduce(
                              (sum, type) => sum + (item[type] || 0),
                              0
                            )
                          }
                          name="Total des dépenses"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{
                            fill: '#6366F1',
                            r: 4,
                            strokeWidth: 2,
                            stroke: 'white'
                          }}
                          activeDot={{
                            r: 6,
                            stroke: '#6366F1',
                            strokeWidth: 2,
                            fill: 'white'
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {viewType === 'tables' && (
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner overflow-x-auto">
                <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-700">Détail des Dépenses par Type</h3>
                <div className="min-w-[600px]">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant Total</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Moyenne</th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">% du Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(benefitsStats?.expenses?.byType || []).map((expense: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900">{expense.type}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {expense.count || 0}
                          </td>
                          <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {formatCurrency(expense.amount / (expense.count || 1))}
                          </td>
                          <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {((expense.amount / (expensesStats?.total || 1)) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewType === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(benefitsStats?.expenses?.byType || []).map((expense: any, index: number) => (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <h4 className="text-sm sm:text-lg font-semibold text-gray-800">{expense.type}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Montant</span>
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Nombre</span>
                        <span className="font-medium">{expense.count || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Moyenne</span>
                        <span className="font-medium">
                          {formatCurrency(expense.amount / (expense.count || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewType === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                {/* Pie Chart - Dépenses par Type */}
                {(benefitsStats?.expenses?.byType || []).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-700">Répartition des Dépenses par Type</h3>
                    <div className="h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={benefitsStats?.expenses?.byType || []}
                            dataKey="amount"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={40}
                            label={false}
                            labelLine={false}
                          >
                            {(benefitsStats?.expenses?.byType || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px', 
                              border: 'none',
                              padding: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              fontSize: '12px'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={48}
                            formatter={(value) => (
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{value}</span>
                            )}
                            iconSize={10}
                            wrapperStyle={{
                              paddingTop: '20px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Bar Chart - Évolution Mensuelle des Dépenses */}
                {(expensesStats?.period || []).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-700">Évolution Mensuelle des Dépenses</h3>
                    <div className="h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expensesStats?.period || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="period" 
                            tickFormatter={(value) => format(new Date(value), 'MMM', { locale: fr })}
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            height={60}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis 
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <Tooltip 
                            formatter={(value: any) => formatCurrency(value)}
                            labelFormatter={(label) => format(new Date(label), 'MMMM yyyy', { locale: fr })}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderRadius: '8px', 
                              border: 'none',
                              padding: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="#6366F1"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          >
                            {(expensesStats?.period || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Maintenance Stats */}
          {expensesStats?.maintenance?.details && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Statistiques de Maintenance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total des Frais de Maintenance </h3>
                  <div className="text-3xl font-bold">{formatCurrency(expensesStats.maintenance.total)}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Nombre de Maintenances</h3>
                  <div className="text-3xl font-bold">
                    {expensesStats.maintenance.details.reduce((sum: number, item: { maintenanceCount?: number }) => sum + (item.maintenanceCount || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Véhicule</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre de Maintenances</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coût Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coût Moyen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {expensesStats.maintenance.details.map((item: any) => (
                      <tr key={item._id.automobileId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item._id.brand} {item._id.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.maintenanceCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.totalCost)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(item.totalCost / item.maintenanceCount)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Category Stats */}
          {benefitsStats?.categories && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Statistiques par Catégorie</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre de Véhicules</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Réservations</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenus</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(benefitsStats.categories || []).map((category: any) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.automobileCount || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.reservations || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(category.revenue)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Automobile Stats */}
          {benefitsStats?.automobiles && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Statistiques par Véhicule</h2>
              
            

              {/* Detailed Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Véhicule</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Réservations</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenus</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coût Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {benefitsStats.automobiles.map((auto: any) => (
                      <tr key={auto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {auto.brand} {auto.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{auto.reservations || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(auto.revenue || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(auto.maintenanceCost || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            (auto.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(auto.profit || 0)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Revenue by Vehicle Chart */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                  <h3 className="text-lg font-semibold mb-6 text-gray-700">Revenus par Véhicule</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={benefitsStats.automobiles}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="model"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value / 1000}k`}
                          tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip
                          formatter={(value: any) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenus"
                          fill="#6366F1"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Profit by Vehicle Chart */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                  <h3 className="text-lg font-semibold mb-6 text-gray-700">Profit par Véhicule</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={benefitsStats.automobiles}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="model"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value / 1000}k`}
                          tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip
                          formatter={(value: any) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar
                          dataKey="profit"
                          name="Profit"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Stats */}
          {/* {benefitsStats?.clients && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Statistiques des Clients</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="text-lg font-semibold text-blue-800">Total Clients</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{benefitsStats.clients.totalClients || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 group relative">
                  <div className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    Clients Actifs
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        Clients ayant au moins une réservation
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mt-2">{benefitsStats.clients.activeClients || 0}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="text-lg font-semibold text-purple-800">Total Réservations</div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">{benefitsStats.clients.totalReservations || 0}</div>
                </div>
              </div>
            </div>
          )} */}
        </>
      )}
    </div>
  );
};

export default StatisticsPage; 