import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, ArrowDownCircle, Pencil } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addTransaction, deleteTransaction, updateTransaction } from '../services/api';

export const Income: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { transactions } = useData();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const incomes = transactions.filter(t => t.type === 'income');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAddIncome = async () => {
    if (!amount || !date || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await addTransaction({
        type: 'income',
        amount: parseFloat(amount),
        category,
        date,
        note,
        userId: currentUser.uid,
        familyId: currentUser.familyId || '',
        createdAt: Date.now()
      });
      setShowAddModal(false);
      setAmount('');
      setCategory('Salary');
      setDate('');
      setNote('');
      showToast('Income added successfully!', 'success');
    } catch (error) {
      console.error("Error adding income: ", error);
      showToast('Failed to add income', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (income: any) => {
    setEditingId(income.id);
    setEditAmount(String(income.amount));
    setEditCategory(income.category);
    setEditDate(income.date);
    setEditNote(income.note || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editAmount || !editDate) return;
    setIsSubmitting(true);
    try {
      await updateTransaction(editingId, {
        amount: parseFloat(editAmount),
        category: editCategory,
        date: editDate,
        note: editNote
      });
      setShowEditModal(false);
      setEditingId(null);
      showToast('Income updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating income: ", error);
      showToast('Failed to update income', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (id) {
      if (window.confirm("Are you sure you want to delete this income?")) {
        await deleteTransaction(id);
        showToast('Income deleted', 'info');
      }
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  // Filter logic
  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = 
      (income.note || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (income.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || income.category === selectedCategory;
    
    // Simple date string comparisons (YYYY-MM-DD works natively with <= and >=)
    const matchesStartDate = !startDate || income.date >= startDate;
    const matchesEndDate = !endDate || income.date <= endDate;
    
    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Income Records</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your income streams</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </button>
      </div>

      <div className="card !p-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {/* Search & Filter Trigger */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search income records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || selectedCategory !== 'All' || startDate || endDate
                ? 'bg-finance/10 border-finance text-finance'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter {(selectedCategory !== 'All' || startDate || endDate) && '•'}
          </button>
        </div>

        {/* Filter Panel (Collapsible) */}
        {showFilters && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance"
              >
                <option value="All">All Categories</option>
                <option value="Salary">Salary</option>
                <option value="Business">Business</option>
                <option value="Freelancing">Freelancing</option>
                <option value="Gifts">Gifts</option>
                <option value="Investments">Investments</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">From Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">To Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance"
                />
              </div>
              {(selectedCategory !== 'All' || startDate || endDate) && (
                <button 
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredIncomes.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No income records found matching your filters.
            </div>
          ) : (
            filteredIncomes.map((income) => (
              <div key={income.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-finance/10 flex items-center justify-center text-finance flex-shrink-0">
                      <ArrowDownCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{income.note || income.category}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {income.category}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{income.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-finance text-sm whitespace-nowrap">+${income.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => handleEdit(income)}
                      className="p-1.5 text-slate-400 hover:text-finance dark:hover:text-finance transition-colors rounded-lg hover:bg-finance/10"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(income.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Source/Notes</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No income records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((income) => (
                  <tr key={income.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-finance/10 flex items-center justify-center text-finance flex-shrink-0">
                          <ArrowDownCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{income.note || income.category}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Source: {income.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{income.date}</td>
                    <td className="px-6 py-4 text-right font-bold text-finance">
                      +${income.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEdit(income)}
                          className="p-1 text-slate-400 hover:text-finance dark:hover:text-finance transition-colors rounded"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(income.id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredIncomes.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 opacity-50 cursor-not-allowed" disabled>Prev</button>
            <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 opacity-50 cursor-not-allowed" disabled>Next</button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Add New Income</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-505 dark:text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-100" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none resize-none h-20 text-slate-800 dark:text-slate-100" 
                  placeholder="E.g., October Salary"
                ></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddIncome} 
                disabled={isSubmitting || !amount || !date}
                className="px-4 py-2 bg-finance text-white font-medium hover:bg-finance-dark rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Income'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Edit Income</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-200">
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Business">Business</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none text-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note</label>
                <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none resize-none h-20 text-slate-800 dark:text-slate-100"></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors" disabled={isSubmitting}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={isSubmitting || !editAmount || !editDate} className="px-4 py-2 bg-finance text-white font-medium hover:bg-finance-dark rounded-xl transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Update Income'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
