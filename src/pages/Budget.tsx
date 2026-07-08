import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { addOrUpdateBudget, deleteBudget } from '../services/api';

export const Budget: React.FC = () => {
  const { budgets } = useData();
  const { currentUser } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveBudget = async () => {
    if (!limit || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await addOrUpdateBudget({
        category,
        limit: parseFloat(limit),
        userId: currentUser.uid,
        familyId: currentUser.familyId || '',
      });
      setShowAddModal(false);
      setCategory('Food');
      setLimit('');
    } catch (error) {
      console.error("Error saving budget: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (id) {
      if (window.confirm("Are you sure you want to delete this budget?")) {
        await deleteBudget(id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Budget Management</h2>
          <p className="text-sm text-slate-500 mt-1">Track your monthly spending limits</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20"
        >
          <Target className="w-5 h-5" />
          Set New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
            You haven't set any budgets yet. Click "Set New Budget" to start tracking your spending.
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const isWarning = percentage >= 80 && percentage < 100;
            const isDanger = percentage >= 100;
            
            let colorClass = 'bg-finance';
            let textColorClass = 'text-finance';
            let icon = <CheckCircle2 className="w-5 h-5 text-finance" />;
            
            if (isWarning) {
              colorClass = 'bg-amber-500';
              textColorClass = 'text-amber-500';
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            } else if (isDanger) {
              colorClass = 'bg-rose-500';
              textColorClass = 'text-rose-500';
              icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
            }

            return (
              <div key={budget.id} className="card group hover:shadow-md transition-all border border-slate-100 hover:border-slate-200 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-50 ${textColorClass}`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">{budget.category}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {icon}
                    <button 
                      onClick={() => handleDelete(budget.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Spent: <span className="font-medium text-slate-800">${budget.spent}</span></span>
                    <span className="text-slate-500">Limit: <span className="font-medium text-slate-800">${budget.limit}</span></span>
                  </div>
                  
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs mt-2">
                    <span className={textColorClass}>
                      {isDanger ? 'Over budget!' : isWarning ? 'Nearing limit' : 'On track'}
                    </span>
                    <span className="font-medium text-slate-600">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card mt-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4">
          <div>
            <h3 className="text-lg font-bold mb-2 text-white">Smart Budgeting Tips</h3>
            <p className="text-slate-300 text-sm max-w-2xl">
              Based on your spending history, we recommend adjusting your Food budget limit to $450 to accommodate your recent trends while maintaining your overall savings goal of 20%.
            </p>
          </div>
          <button className="whitespace-nowrap px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium border border-white/20 backdrop-blur-sm">
            Apply Recommendation
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Set New Budget</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none bg-white"
                >
                  <option value="Food">Food</option>
                  <option value="Rent">Rent</option>
                  <option value="Transport">Transport</option>
                  <option value="School fees">School fees</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">If a budget already exists for this category, it will be updated.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Limit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input 
                    type="number" 
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance outline-none" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBudget} 
                disabled={isSubmitting || !limit}
                className="px-4 py-2 bg-finance text-white font-medium hover:bg-finance-dark rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
