import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart, 
  Target, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Wallet,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export const MainLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: ArrowDownCircle },
    { name: 'Expenses', path: '/expenses', icon: ArrowUpCircle },
    { name: 'Budget', path: '/budget', icon: Target },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'AI Assistant', path: '/ai-assistant', icon: MessageSquare },
  ];

  if (currentUser?.role === 'superadmin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex transition-colors duration-200">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-10 transition-colors duration-200">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-10 h-10 bg-finance rounded-xl flex items-center justify-center shadow-md">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">SmartFin</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  isActive 
                    ? "bg-finance text-white shadow-md shadow-finance/20" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavLink 
            to="/settings"
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-colors",
                isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800"
              )
            }
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-finance to-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{currentUser?.displayName?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser?.displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 flex items-center justify-between px-4 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-finance rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-white">SmartFin</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            className="w-64 h-full bg-white dark:bg-slate-900 flex flex-col pt-16 transition-colors duration-200"
            onClick={e => e.stopPropagation()}
          >
             <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                      isActive 
                        ? "bg-finance text-white" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
              <NavLink
                to="/settings"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )
                }
              >
                <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`} alt="Profile" className="w-5 h-5 rounded-full" />
                Settings & Profile
              </NavLink>
            </nav>
            <button 
              onClick={handleLogout}
              className="m-4 flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-medium mt-auto"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <header className="hidden lg:flex h-20 items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
            {window.location.pathname === '/dashboard' ? 'Dashboard' : window.location.pathname.slice(1).replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-3 relative">
            {/* Dark/Light Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => {
                const el = document.getElementById('notif-dropdown');
                if (el) el.classList.toggle('hidden');
              }}
              className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Simple Notifications Dropdown */}
            <div id="notif-dropdown" className="hidden absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                <span className="text-xs text-finance cursor-pointer font-medium hover:underline">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: "Budget Alert", desc: "You've reached 85% of your Food budget.", time: "2 hours ago", unread: true },
                  { title: "New Feature", desc: "AI Insights are now smarter! Check them out.", time: "1 day ago", unread: false },
                  { title: "Weekly Report", desc: "Your weekly financial summary is ready.", time: "2 days ago", unread: false }
                ].map((n, i) => (
                  <div key={i} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer ${n.unread ? 'bg-finance/5 dark:bg-finance/10' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${n.unread ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-finance mt-1.5"></span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{n.desc}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};
