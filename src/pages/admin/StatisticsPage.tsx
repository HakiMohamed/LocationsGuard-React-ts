import React, { useEffect, useState } from 'react';
import { useStats } from '../../contexts/StatsContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#6366F1', '#8B5CF6', '#F59E42', '#10B981', '#F43F5E', '#FBBF24', '#3B82F6', '#14B8A6', '#E11D48', '#A21CAF'];

const periodOptions = [
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
  { value: 'week', label: 'Semaine' },
  { value: 'day', label: 'Jour' },
];

const StatisticsPage: React.FC = () => {
  const { expensesStats, fetchExpensesStats, loading, error } = useStats();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchExpensesStats({ startDate, endDate, period });
  }, [startDate, endDate, period, fetchExpensesStats]);

  // Prepare data for charts
  const pieData = expensesStats?.byType
    ? Object.entries(expensesStats.byType).map(([type, total]) => ({ name: type, value: total as number }))
    : [];
  const barData = expensesStats?.period || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Statistiques</h1>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Date de début</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date de fin</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Période</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded px-3 py-2 w-full">
            {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* Expenses Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
          <div className="text-lg font-semibold mb-2">Total Dépenses</div>
          <div className="text-3xl font-bold">{expensesStats?.total?.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' }) || '0 MAD'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2 text-gray-700">Dépenses par Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {pieData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2 text-gray-700">Évolution des Dépenses</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tickFormatter={str => str} />
              <YAxis />
              <Tooltip formatter={v => `${v} MAD`} />
              <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table of details by type */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Détail des Dépenses par Type</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant (MAD)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {pieData.length === 0 ? (
                <tr><td colSpan={2} className="text-center py-8 text-gray-400">Aucune donnée</td></tr>
              ) : pieData.map((row, idx) => (
                <tr key={row.name}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4">{row.value.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table of details by period */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Dépenses par Période</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant (MAD)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {barData.length === 0 ? (
                <tr><td colSpan={2} className="text-center py-8 text-gray-400">Aucune donnée</td></tr>
              ) : barData.map((row: any) => (
                <tr key={row.period}>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.period}</td>
                  <td className="px-6 py-4">{row.total.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      {loading && <div className="text-center text-gray-500">Chargement...</div>}
    </div>
  );
};

export default StatisticsPage; 