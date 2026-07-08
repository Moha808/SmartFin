import React, { useMemo } from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  TrendingUp,
  Sparkles,
  Users
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getFamilyMembers } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#f43f5e', '#10b981'];

export const Dashboard: React.FC = () => {
  const { transactions, budgets } = useData();
  const { currentUser, joinFamily } = useAuth();
  const { showToast } = useToast();
  const [joinCode, setJoinCode] = React.useState('');
  const [isJoining, setIsJoining] = React.useState(false);
  const [familyMembers, setFamilyMembers] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (currentUser?.familyId) {
      getFamilyMembers(currentUser.familyId).then(members => {
        setFamilyMembers(members);
      }).catch(console.error);
    }
  }, [currentUser?.familyId]);

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setIsJoining(true);
    try {
      await joinFamily(joinCode);
      showToast('Successfully joined family!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to join family', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  // Calculate summary
  const summary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [transactions]);

  // Aggregate pie chart data by category (for expenses)
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Aggregate chart data by month
  const chartData = useMemo(() => {
    const months: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = date.toLocaleString('default', { month: 'short' }); // e.g., 'Jan'
      if (!months[monthYear]) {
        months[monthYear] = { income: 0, expense: 0 };
      }
      months[monthYear][t.type] += t.amount;
    });
    return Object.entries(months).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense
    })).reverse(); // Reverse to show chronological order if sorted by newest
  }, [transactions]);

  // Insights logic based on actual data
  const insights = useMemo(() => {
    const result = [];
    if (summary.totalExpense > summary.totalIncome && summary.totalIncome > 0) {
      result.push("Your expenses are currently exceeding your income. Consider reviewing your budgets.");
    }
    const overLimitBudgets = budgets.filter(b => b.spent > b.limit);
    if (overLimitBudgets.length > 0) {
      result.push(`You have exceeded your budget limit for: ${overLimitBudgets.map(b => b.category).join(', ')}.`);
    } else if (budgets.length > 0) {
      result.push("Great job! You are staying within your budget limits.");
    } else {
      result.push("You haven't set up any budgets yet. Head over to the Budget page to start tracking.");
    }
    return result;
  }, [summary, budgets]);

  return (
    <div className="space-y-6">
      {!currentUser?.familyId && (
        <div className="bg-finance/10 border border-finance/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Track finances together!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">You are currently using SmartFin solo. Enter a family invite code to join an existing workspace.</p>
          </div>
          <form onSubmit={handleJoinFamily} className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter invite code"
              required
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-finance outline-none text-sm w-full md:w-48"
            />
            <button
              type="submit"
              disabled={isJoining}
              className="px-4 py-2 bg-finance text-white font-medium rounded-xl hover:bg-finance-dark transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isJoining ? 'Joining...' : 'Join Family'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={`$${summary.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
          icon={<Wallet className="w-6 h-6 text-white" />}
          bgColor="bg-slate-800"
        />
        <StatCard 
          title="Total Income" 
          amount={`$${summary.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
          icon={<ArrowDownCircle className="w-6 h-6 text-white" />}
          bgColor="bg-finance"
        />
        <StatCard 
          title="Total Expenses" 
          amount={`$${summary.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
          icon={<ArrowUpCircle className="w-6 h-6 text-white" />}
          bgColor="bg-rose-500"
        />
        <StatCard 
          title="Monthly Savings" 
          amount={`$${Math.max(0, summary.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          bgColor="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Cash Flow</h2>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-finance">
              <option>All Time</option>
            </select>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009688" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#009688" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#009688" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Not enough data to display chart.
              </div>
            )}
          </div>
        </div>

        {/* AI Insights & Pie Chart */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-finance to-finance-dark text-white border-none">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h2 className="text-lg font-bold">AI Insights</h2>
            </div>
            <ul className="space-y-3">
              {insights.map((insight, idx) => (
                <li key={idx} className="bg-white/10 rounded-xl p-3 text-sm leading-relaxed backdrop-blur-sm border border-white/10">
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Spending by Category</h2>
            <div className="h-48 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No expenses recorded yet.
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          {/* Family Members Widget */}
          {currentUser?.familyId && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-finance" />
                <h2 className="text-lg font-bold text-slate-800">Family Members</h2>
              </div>
              <div className="space-y-3">
                {familyMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-finance/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-finance to-emerald-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {member.displayName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm leading-none">{member.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1">{member.role}</p>
                      </div>
                    </div>
                    {member.uid === currentUser?.uid && (
                      <span className="text-[10px] font-bold text-finance bg-finance/10 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
          <button className="text-sm text-finance font-medium hover:text-finance-dark">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-sm">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-4 text-center text-slate-500">No transactions found. Add some to get started!</td>
                 </tr>
              ) : (
                transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-800">{t.note || t.category}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-sm">{t.date}</td>
                    <td className={`py-3 text-right font-medium ${t.type === 'income' ? 'text-finance' : 'text-slate-800'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, bgColor }: { title: string, amount: string, icon: React.ReactNode, bgColor: string }) => (
  <div className="card flex items-center p-5 gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgColor} shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{amount}</h3>
    </div>
  </div>
);
