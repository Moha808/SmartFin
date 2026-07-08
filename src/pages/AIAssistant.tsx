import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, PiggyBank, AlertTriangle, Target, ArrowUpRight, ArrowDownRight, Lightbulb, BarChart3 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateGeminiResponse } from '../services/gemini';

// ─── Smart Financial Engine ──────────────────────────────────────
// This engine analyzes the user's real transaction & budget data
// and generates personalized financial advice without any external API.

interface FinancialAnalysis {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  topExpenseCategories: { category: string; total: number; percentage: number }[];
  topIncomeCategories: { category: string; total: number; percentage: number }[];
  budgetHealth: { category: string; limit: number; spent: number; percentage: number; status: 'safe' | 'warning' | 'exceeded' }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  avgDailySpend: number;
  transactionCount: number;
  daysTracked: number;
}

function analyzeFinances(transactions: any[], budgets: any[]): FinancialAnalysis {
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomes.reduce((a, c) => a + c.amount, 0);
  const totalExpense = expenses.reduce((a, c) => a + c.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Top expense categories
  const expByCat: Record<string, number> = {};
  expenses.forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + t.amount; });
  const topExpenseCategories = Object.entries(expByCat)
    .map(([category, total]) => ({ category, total, percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  // Top income categories
  const incByCat: Record<string, number> = {};
  incomes.forEach(t => { incByCat[t.category] = (incByCat[t.category] || 0) + t.amount; });
  const topIncomeCategories = Object.entries(incByCat)
    .map(([category, total]) => ({ category, total, percentage: totalIncome > 0 ? (total / totalIncome) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  // Budget health
  const budgetHealth = budgets.map(b => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
    percentage: b.limit > 0 ? (b.spent / b.limit) * 100 : 0,
    status: (b.spent / b.limit) > 1 ? 'exceeded' : (b.spent / b.limit) > 0.8 ? 'warning' : 'safe' as 'safe' | 'warning' | 'exceeded'
  }));

  // Monthly trend
  const monthMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = t.date?.substring(0, 7) || 'Unknown';
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
    if (t.type === 'income') monthMap[month].income += t.amount;
    else monthMap[month].expense += t.amount;
  });
  const monthlyTrend = Object.entries(monthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Days tracked & avg daily spend
  const dates = transactions.map(t => new Date(t.date).getTime()).filter(d => !isNaN(d));
  const daysTracked = dates.length > 1 ? Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / 86400000)) : 1;
  const avgDailySpend = totalExpense / daysTracked;

  return {
    totalIncome, totalExpense, netSavings, savingsRate,
    topExpenseCategories, topIncomeCategories,
    budgetHealth, monthlyTrend, avgDailySpend,
    transactionCount: transactions.length, daysTracked
  };
}

// ─── Smart Response Engine ──────────────────────────────────────
// Matches user questions to relevant financial analysis

// @ts-ignore: Kept as offline fallback for Gemini
function _generateSmartResponse(question: string, analysis: FinancialAnalysis, userName: string): string {
  const q = question.toLowerCase().trim();

  // No data scenario
  if (analysis.transactionCount === 0) {
    return `Hi ${userName}! 👋\n\nI don't see any transactions recorded yet. Once you start adding your income and expenses, I'll be able to give you personalized financial insights!\n\nHere's what I can help with:\n• **Spending analysis** — Where your money goes\n• **Budget tracking** — Are you on track?\n• **Savings tips** — How to save more\n• **Category breakdowns** — Your top expenses\n\nHead over to the **Income** or **Expenses** page to get started!`;
  }

  // Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/i.test(q)) {
    const greeting = analysis.netSavings >= 0 ? "Things are looking good" : "Let's work on improving your finances";
    return `Hello ${userName}! 👋 ${greeting}.\n\nHere's a quick snapshot:\n• 💰 Total Income: **$${analysis.totalIncome.toLocaleString()}**\n• 💸 Total Expenses: **$${analysis.totalExpense.toLocaleString()}**\n• ${analysis.netSavings >= 0 ? '✅' : '⚠️'} Net Savings: **$${analysis.netSavings.toLocaleString()}**\n• 📊 Savings Rate: **${analysis.savingsRate.toFixed(1)}%**\n\nWhat would you like to know more about?`;
  }

  // Summary / overview / how am I doing
  if (/summary|overview|how.*(am i|i'm) doing|financial (health|status|report)|total/i.test(q)) {
    const healthEmoji = analysis.savingsRate >= 20 ? '🟢 Excellent' : analysis.savingsRate >= 10 ? '🟡 Good' : analysis.savingsRate >= 0 ? '🟠 Needs Improvement' : '🔴 Critical';
    let response = `📊 **Your Financial Summary**\n\n`;
    response += `| Metric | Value |\n|---|---|\n`;
    response += `| Total Income | $${analysis.totalIncome.toLocaleString()} |\n`;
    response += `| Total Expenses | $${analysis.totalExpense.toLocaleString()} |\n`;
    response += `| Net Savings | $${analysis.netSavings.toLocaleString()} |\n`;
    response += `| Savings Rate | ${analysis.savingsRate.toFixed(1)}% |\n`;
    response += `| Avg Daily Spend | $${analysis.avgDailySpend.toFixed(2)} |\n`;
    response += `| Financial Health | ${healthEmoji} |\n`;
    response += `\nYou've tracked **${analysis.transactionCount}** transactions over **${analysis.daysTracked}** days.`;
    if (analysis.savingsRate < 10 && analysis.savingsRate >= 0) {
      response += `\n\n💡 **Tip:** Financial experts recommend saving at least 20% of your income. You're at ${analysis.savingsRate.toFixed(1)}% — let's work on boosting that!`;
    }
    return response;
  }

  // Spending / expenses / where does my money go
  if (/spend|expense|where.*(money|cash)|cost|bought|purchase/i.test(q)) {
    if (analysis.topExpenseCategories.length === 0) {
      return "You haven't recorded any expenses yet. Start tracking to see where your money goes!";
    }
    let response = `💸 **Your Spending Breakdown**\n\n`;
    response += `Total Expenses: **$${analysis.totalExpense.toLocaleString()}**\n\n`;
    analysis.topExpenseCategories.forEach((cat, i) => {
      const bar = '█'.repeat(Math.max(1, Math.round(cat.percentage / 5)));
      response += `${i + 1}. **${cat.category}** — $${cat.total.toLocaleString()} (${cat.percentage.toFixed(1)}%)\n   ${bar}\n`;
    });
    if (analysis.topExpenseCategories.length > 0) {
      const top = analysis.topExpenseCategories[0];
      response += `\n💡 **Insight:** Your biggest expense category is **${top.category}** at **${top.percentage.toFixed(1)}%** of total spending. `;
      if (top.percentage > 40) {
        response += `That's quite concentrated — consider if there are ways to reduce this.`;
      }
    }
    return response;
  }

  // Income
  if (/income|earn|salary|revenue|money coming|made/i.test(q)) {
    if (analysis.topIncomeCategories.length === 0) {
      return "No income recorded yet. Add your income sources to start tracking!";
    }
    let response = `💰 **Your Income Breakdown**\n\nTotal Income: **$${analysis.totalIncome.toLocaleString()}**\n\n`;
    analysis.topIncomeCategories.forEach((cat, i) => {
      response += `${i + 1}. **${cat.category}** — $${cat.total.toLocaleString()} (${cat.percentage.toFixed(1)}%)\n`;
    });
    return response;
  }

  // Budget / on track
  if (/budget|on track|limit|over.?spend|within/i.test(q)) {
    if (analysis.budgetHealth.length === 0) {
      return "📋 You haven't set up any budgets yet!\n\nHead to the **Budget** page to create spending limits for your categories. I'll then be able to tell you exactly how you're tracking against them.";
    }
    let response = `🎯 **Budget Status Report**\n\n`;
    const exceeded = analysis.budgetHealth.filter(b => b.status === 'exceeded');
    const warning = analysis.budgetHealth.filter(b => b.status === 'warning');
    const safe = analysis.budgetHealth.filter(b => b.status === 'safe');

    if (exceeded.length > 0) {
      response += `🔴 **Exceeded (${exceeded.length}):**\n`;
      exceeded.forEach(b => {
        response += `   • **${b.category}** — $${b.spent.toLocaleString()} / $${b.limit.toLocaleString()} (${b.percentage.toFixed(0)}%)\n`;
      });
      response += '\n';
    }
    if (warning.length > 0) {
      response += `🟡 **Near Limit (${warning.length}):**\n`;
      warning.forEach(b => {
        response += `   • **${b.category}** — $${b.spent.toLocaleString()} / $${b.limit.toLocaleString()} (${b.percentage.toFixed(0)}%)\n`;
      });
      response += '\n';
    }
    if (safe.length > 0) {
      response += `🟢 **On Track (${safe.length}):**\n`;
      safe.forEach(b => {
        response += `   • **${b.category}** — $${b.spent.toLocaleString()} / $${b.limit.toLocaleString()} (${b.percentage.toFixed(0)}%)\n`;
      });
    }
    return response;
  }

  // Savings / saving tips / how to save
  if (/sav(e|ing)|tip|advice|suggest|recommend|improve|cut|reduce/i.test(q)) {
    let response = `💡 **Personalized Savings Tips**\n\n`;
    response += `Your current savings rate: **${analysis.savingsRate.toFixed(1)}%**\n\n`;

    const tips: string[] = [];

    if (analysis.savingsRate < 0) {
      tips.push("⚠️ **Urgent:** You're spending more than you earn. This is unsustainable. Focus on cutting your largest expense category first.");
    }

    if (analysis.topExpenseCategories.length > 0) {
      const top = analysis.topExpenseCategories[0];
      tips.push(`🔍 Your biggest expense is **${top.category}** ($${top.total.toLocaleString()}). Even a 10% reduction would save you **$${(top.total * 0.1).toFixed(2)}**.`);
    }

    if (analysis.avgDailySpend > 0) {
      tips.push(`📅 You spend an average of **$${analysis.avgDailySpend.toFixed(2)}/day**. Try setting a daily spending cap of **$${(analysis.avgDailySpend * 0.85).toFixed(2)}** to save 15% more.`);
    }

    const exceededBudgets = analysis.budgetHealth.filter(b => b.status === 'exceeded');
    if (exceededBudgets.length > 0) {
      tips.push(`🎯 You've exceeded budgets in: **${exceededBudgets.map(b => b.category).join(', ')}**. Review these categories for quick wins.`);
    }

    if (analysis.savingsRate >= 0 && analysis.savingsRate < 20) {
      tips.push("📊 The 50/30/20 rule suggests: 50% needs, 30% wants, 20% savings. Track which expenses are \"needs\" vs \"wants\" to find savings opportunities.");
    }

    if (analysis.savingsRate >= 20) {
      tips.push("🌟 You're already saving 20%+ — excellent! Consider investing your surplus in an index fund or high-yield savings account.");
    }

    tips.push("🏦 Set up automatic transfers to a savings account on payday — \"pay yourself first\" is the #1 wealth-building habit.");

    tips.forEach((tip, i) => { response += `${i + 1}. ${tip}\n\n`; });
    return response;
  }

  // Food / specific category question
  const categoryMatch = q.match(/(?:how much|what|total).*(on|for|in)\s+(\w+)/i);
  if (categoryMatch) {
    const searchCat = categoryMatch[2].toLowerCase();
    const matchedExpenses = analysis.topExpenseCategories.filter(c => c.category.toLowerCase().includes(searchCat));
    const matchedIncome = analysis.topIncomeCategories.filter(c => c.category.toLowerCase().includes(searchCat));

    if (matchedExpenses.length > 0 || matchedIncome.length > 0) {
      let response = `📂 **"${searchCat}" Category Analysis**\n\n`;
      matchedExpenses.forEach(c => {
        response += `💸 Expenses in **${c.category}**: **$${c.total.toLocaleString()}** (${c.percentage.toFixed(1)}% of total spending)\n`;
      });
      matchedIncome.forEach(c => {
        response += `💰 Income from **${c.category}**: **$${c.total.toLocaleString()}** (${c.percentage.toFixed(1)}% of total income)\n`;
      });
      return response;
    } else {
      return `I couldn't find any transactions matching **"${searchCat}"**. Check that the category name matches what you've used in your Income or Expenses pages.`;
    }
  }

  // Monthly trend
  if (/month|trend|over time|history|pattern/i.test(q)) {
    if (analysis.monthlyTrend.length === 0) {
      return "Not enough data to show monthly trends yet. Keep tracking and I'll show you patterns!";
    }
    let response = `📈 **Monthly Trend**\n\n`;
    response += `| Month | Income | Expenses | Net |\n|---|---|---|---|\n`;
    analysis.monthlyTrend.forEach(m => {
      const net = m.income - m.expense;
      response += `| ${m.month} | $${m.income.toLocaleString()} | $${m.expense.toLocaleString()} | ${net >= 0 ? '+' : ''}$${net.toLocaleString()} |\n`;
    });
    return response;
  }

  // Catch-all / help
  let response = `Great question, ${userName}! Here's what I found based on your data:\n\n`;
  response += `📊 **Quick Stats:**\n`;
  response += `• Income: **$${analysis.totalIncome.toLocaleString()}** | Expenses: **$${analysis.totalExpense.toLocaleString()}**\n`;
  response += `• Net: **${analysis.netSavings >= 0 ? '+' : ''}$${analysis.netSavings.toLocaleString()}** (${analysis.savingsRate.toFixed(1)}% savings rate)\n`;
  if (analysis.topExpenseCategories.length > 0) {
    response += `• Top expense: **${analysis.topExpenseCategories[0].category}** ($${analysis.topExpenseCategories[0].total.toLocaleString()})\n`;
  }
  response += `\n💬 **Try asking me:**\n`;
  response += `• "How am I doing financially?"\n`;
  response += `• "Where does my money go?"\n`;
  response += `• "Am I on track with my budgets?"\n`;
  response += `• "Give me tips to save more"\n`;
  response += `• "Show me monthly trends"\n`;
  response += `• "How much did I spend on food?"`;
  return response;
}

// ─── Component ──────────────────────────────────────────────────

export const AIAssistant: React.FC = () => {
  const { transactions, budgets } = useData();
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! 👋 I'm your **SmartFin Financial Advisor**.\n\nI analyze your real transaction and budget data to give you personalized insights — no API key required!\n\nTry asking me things like:\n• "How am I doing?"\n• "Where does my money go?"\n• "Give me savings tips"` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const analysis = useMemo(() => analyzeFinances(transactions, budgets), [transactions, budgets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Generate proactive insights based on real data
  const insights = useMemo(() => {
    const result: { icon: React.ReactNode; text: string; type: 'positive' | 'warning' | 'neutral' }[] = [];

    if (analysis.transactionCount === 0) {
      result.push({ icon: <Lightbulb className="w-4 h-4" />, text: "Start adding transactions to unlock personalized insights!", type: 'neutral' });
      return result;
    }

    if (analysis.savingsRate >= 20) {
      result.push({ icon: <TrendingUp className="w-4 h-4" />, text: `Savings rate at ${analysis.savingsRate.toFixed(1)}% — above the recommended 20%!`, type: 'positive' });
    } else if (analysis.savingsRate >= 0) {
      result.push({ icon: <Target className="w-4 h-4" />, text: `Savings rate at ${analysis.savingsRate.toFixed(1)}% — aim for 20% for financial security.`, type: 'warning' });
    } else {
      result.push({ icon: <AlertTriangle className="w-4 h-4" />, text: `You're spending more than you earn! Deficit: $${Math.abs(analysis.netSavings).toLocaleString()}`, type: 'warning' });
    }

    const exceeded = analysis.budgetHealth.filter(b => b.status === 'exceeded');
    if (exceeded.length > 0) {
      result.push({ icon: <AlertTriangle className="w-4 h-4" />, text: `Budget exceeded in: ${exceeded.map(b => b.category).join(', ')}`, type: 'warning' });
    } else if (analysis.budgetHealth.length > 0) {
      result.push({ icon: <Target className="w-4 h-4" />, text: "All budgets on track! Keep it up.", type: 'positive' });
    }

    if (analysis.topExpenseCategories.length > 0) {
      const top = analysis.topExpenseCategories[0];
      result.push({ icon: <BarChart3 className="w-4 h-4" />, text: `Biggest expense: ${top.category} at ${top.percentage.toFixed(0)}% of spending.`, type: 'neutral' });
    }

    return result;
  }, [analysis]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateGeminiResponse(userMessage, analysis, currentUser?.displayName || 'there');
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Chat Area */}
      <div className="flex-1 card flex flex-col p-0 overflow-hidden border-finance/20 dark:border-slate-800 shadow-md dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-finance/5 to-emerald-50/50 dark:from-finance/10 dark:to-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-finance to-emerald-500 flex items-center justify-center shadow-sm shadow-finance/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">SmartFin Advisor</h2>
              <p className="text-xs text-finance dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Powered by your data
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <PiggyBank className="w-3.5 h-3.5" />
            {analysis.transactionCount} transactions analyzed
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-br from-finance to-emerald-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-finance text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-finance to-emerald-500 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-finance animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-finance animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-finance animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending, budgets, or savings tips..." 
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance focus:border-finance transition-all text-slate-800 dark:text-slate-100"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 bg-finance text-white rounded-xl hover:bg-finance-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm shadow-finance/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
 
      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pr-2 pb-2 custom-scrollbar">
        {/* Proactive Insights */}
        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <h3 className="font-bold">Live Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-xl text-sm border backdrop-blur-sm flex items-start gap-2.5 ${
                insight.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                'bg-white/10 border-white/10 text-slate-200'
              }`}>
                <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {analysis.transactionCount > 0 && (
          <div className="card dark:bg-slate-900 dark:border-slate-800 space-y-3 flex-shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-center">
                <ArrowUpRight className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Income</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">${analysis.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-center">
                <ArrowDownRight className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Expenses</p>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">${analysis.totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        <div className="card dark:bg-slate-900 dark:border-slate-800 flex-shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-xs uppercase tracking-wider">Ask Me About</h3>
          <div className="space-y-2">
            {[
              "How am I doing financially?",
              "Where does my money go?",
              "Am I on track with my budgets?",
              "Give me tips to save more",
              "Show me monthly trends",
              "How much did I spend on food?"
            ].map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="w-full text-left p-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-finance/5 dark:hover:bg-finance/10 hover:text-finance dark:hover:text-finance border border-slate-100 dark:border-slate-800 rounded-xl transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
