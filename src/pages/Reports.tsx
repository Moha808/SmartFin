import React, { useState, useMemo } from 'react';
import { Download, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('monthly');
  const { transactions } = useData();

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesStartDate = !startDate || t.date >= startDate;
      const matchesEndDate = !endDate || t.date <= endDate;
      return matchesStartDate && matchesEndDate;
    });
  }, [transactions, startDate, endDate]);

  const chartData = useMemo(() => {
    // Aggregate by month, year, or daily
    const grouped: Record<string, { income: number, expense: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      if (reportType === 'monthly') {
        key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else if (reportType === 'yearly') {
        key = date.getFullYear().toString();
      } else {
        // Daily
        key = t.date;
      }
      
      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }
      grouped[key][t.type] += t.amount;
    });

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense
    })).sort((a, b) => a.name.localeCompare(b.name)); // Basic sort
  }, [filteredTransactions, reportType]);

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0.0';
    
    return { totalIncome, totalExpense, savings, savingsRate };
  }, [filteredTransactions]);

  const expensePercentage = summary.totalIncome > 0 
    ? Math.min((summary.totalExpense / summary.totalIncome) * 100, 100) 
    : (summary.totalExpense > 0 ? 100 : 0);
    
  const savingsPercentage = summary.totalIncome > 0 
    ? Math.max((summary.savings / summary.totalIncome) * 100, 0) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Financial Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed analysis of your financial activities</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl transition-colors font-medium shadow-sm">
          <Download className="w-4 h-4" />
          Export to PDF
        </button>
      </div>

      {/* Filters Card */}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full md:w-auto">
          {['daily', 'monthly', 'yearly'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex-1 md:flex-none capitalize ${
                reportType === type 
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Date Inputs Range */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">From</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">To</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors w-full sm:w-auto text-center"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="card dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 rounded-lg">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Income vs Expense ({reportType})</h3>
          </div>
          
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgb(15, 23, 42)',
                      color: 'white'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Income" fill="#009688" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                No transaction data available for the selected dates.
              </div>
            )}
          </div>
        </div>

        {/* Summary Details */}
        <div className="card dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-500 dark:text-purple-400 rounded-lg">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">Summary (Selected Range)</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Income</span>
                <span className="font-bold text-slate-800 dark:text-white">${summary.totalIncome.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-finance rounded-full w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Expenses</span>
                <span className="font-bold text-slate-800 dark:text-white">${summary.totalExpense.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expensePercentage}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Net Savings</span>
                <span className="font-bold text-blue-500 dark:text-blue-400">${summary.savings.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${savingsPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Key Takeaway</h4>
            <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
              Your savings rate for the selected period is <span className="font-bold text-finance">{summary.savingsRate}%</span>.
              {parseFloat(summary.savingsRate) > 20 
                ? " This is excellent and above the recommended 20% savings rule." 
                : " Try to reduce unnecessary expenses to hit the recommended 20% savings goal."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
