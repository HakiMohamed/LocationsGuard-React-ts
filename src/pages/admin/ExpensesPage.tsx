import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Expense, ExpenseType } from '../../types/expense.types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Expenses management page (CRUD)

// Helper to get label from ExpenseType value
const getExpenseTypeLabel = (type: ExpenseType) => {
  return Object.values(ExpenseType).find((v) => v === type) || type;
};

const ExpenseFormModal = ({ isOpen, onClose, onSubmit, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Expense>;
}) => {
  const [form, setForm] = useState<Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>>({
    label: initialData?.label || '',
    type: initialData?.type || ExpenseType.OTHER,
    amount: initialData?.amount || 0,
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    notes: initialData?.notes || '',
  });

  React.useEffect(() => {
    setForm({
      label: initialData?.label || '',
      type: initialData?.type || ExpenseType.OTHER,
      amount: initialData?.amount || 0,
      date: initialData?.date
        ? new Date(initialData.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      notes: initialData?.notes || '',
    });
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : name === 'type' ? value as ExpenseType : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{initialData ? 'Modifier' : 'Ajouter'} une dépense</h2>
            <p className="text-sm text-white/80 mt-1">Formulaire de dépense</p>
          </div>
          <button className="rounded-lg bg-white/20 hover:bg-white/30 p-2 transition-colors duration-200" onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-8 py-8">
          <div>
            <label className="block text-sm font-medium mb-1">Libellé *</label>
            <input name="label" value={form.label} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select name="type" value={form.type} onChange={handleChange} required className="w-full border rounded px-3 py-2">
              {Object.entries(ExpenseType).map(([key, val]) => (
                <option key={key} value={val}>{val}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Montant (MAD) *</label>
            <input name="amount" type="text" value={form.amount || ''} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-bold">{initialData ? 'Modifier' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExpensesPage: React.FC = () => {
  const { expenses, createExpense, updateExpense, deleteExpense, loading } = useExpense();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered = Array.isArray(expenses)
    ? expenses.filter(e =>
        ((e.label?.toLowerCase() || '').includes(search.toLowerCase()) ||
        getExpenseTypeLabel(e.type).toLowerCase().includes(search.toLowerCase()) ||
        (e.notes?.toLowerCase() || '').includes(search.toLowerCase())) &&
        (typeFilter === '' || e.type === typeFilter)
      )
    : [];

  // Pagination logic
  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const fromResult = totalResults === 0 ? 0 : indexOfFirstItem + 1;
  const toResult = Math.min(indexOfLastItem, totalResults);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="relative min-h-screen mt-16">
      <div className="mx-auto px-4 ">
        {/* Floating Add Button */}
        <button
          onClick={() => { setEditExpense(null); setModalOpen(true); }}
          className="fixed z-20 top-28 right-10 p-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200 group"
          title="Ajouter une dépense"
        >
          <PlusIcon className="h-6 w-6 text-white" />
        </button>

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10zm2 2h12v6H5v-6z" /></svg>
            <span className="font-semibold text-lg">Filtres</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Type de dépense</label>
              <select
                className="block w-full pl-3 pr-10 py-3 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">Tous les types</option>
                {Object.values(ExpenseType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Recherche</label>
              <input
                type="text"
                placeholder="Rechercher par libellé, type ou notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
            <div className="flex md:ml-auto gap-2 mt-2 md:mt-0">
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Dépenses</h1>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">{expenses ? expenses.length : 0} dépenses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-xl shadow-md overflow-hidden bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Libellé</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant (MAD)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Chargement...</td></tr>
                ) : currentExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucune dépense trouvée</td></tr>
                ) : currentExpenses.map(expense => (
                  <tr key={expense._id} className="transition-colors duration-150 hover:bg-blue-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{expense.label}</td>
                    <td className="px-6 py-4">{getExpenseTypeLabel(expense.type)}</td>
                    <td className="px-6 py-4">{expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{format(new Date(expense.date), 'dd MMM yyyy', { locale: fr })}</td>
                    <td className="px-6 py-4">{expense.notes}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      <button onClick={() => { setEditExpense(expense); setModalOpen(true); }} className="p-2 rounded hover:bg-blue-50 text-blue-600" title="Modifier">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => { if (window.confirm('Supprimer cette dépense ?')) deleteExpense(expense._id!); }} className="p-2 rounded hover:bg-red-50 text-red-600" title="Supprimer">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
            {/* Info résultats */}
            <div className="text-gray-600 text-sm">
              Affichage de {fromResult} à {toResult} sur {totalResults} résultat{totalResults > 1 ? 's' : ''}
            </div>
            {/* Pagination + select */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto justify-between">
              <div>
                <select
                  value={itemsPerPage}
                  onChange={e => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n} par page</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1 items-center justify-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1 border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  Précédent
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-1 border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
        <ExpenseFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={async (data) => {
            if (editExpense) {
              await updateExpense(editExpense._id!, data);
            } else {
              await createExpense(data);
            }
            setModalOpen(false);
          }}
          initialData={editExpense || undefined}
        />
      </div>
    </div>
  );
};

export default ExpensesPage; 