import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, LineChart, Sparkles, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
        style={{ backgroundImage: 'url("/landing-bg.png")' }}
      ></div>
      
      {/* Top Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/20 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-finance rounded-lg flex items-center justify-center shadow-md shadow-finance/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">SmartFin</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="text-sm font-medium bg-finance text-white px-5 py-2.5 rounded-full hover:bg-finance-dark transition-colors shadow-md shadow-finance/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-5xl mx-auto py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-finance/10 text-finance dark:text-emerald-400 text-sm font-medium mb-8 border border-finance/20 backdrop-blur-sm shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Financial Intelligence</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 drop-shadow-sm"
        >
          Master your family's <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-finance to-teal-400 dark:from-emerald-400 dark:to-teal-300">
            financial future
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-10 leading-relaxed bg-white/40 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl backdrop-blur-md shadow-sm border border-white/20 dark:border-slate-700/30"
        >
          Track income, manage expenses, and receive smart AI insights to help your family save more and stress less. The complete smart finance management platform.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => navigate('/signup')}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-8 py-4 rounded-full text-lg font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            View Demo
          </button>
        </motion.div>
      </main>

      {/* Feature Highlights */}
      <div className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 py-16 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<LineChart className="w-6 h-6 text-blue-500" />}
            title="Smart Analytics"
            description="Beautiful charts and detailed reports that give you a crystal clear picture of your cash flow."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-yellow-500" />}
            title="AI Assistant"
            description="Get proactive alerts and personalized tips from our intelligent financial assistant."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
            title="Secure & Private"
            description="Bank-grade encryption ensures your family's financial data remains completely secure."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow">
    <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);
