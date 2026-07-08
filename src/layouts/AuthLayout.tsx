import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Users, Wallet } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Left Panel — Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-finance-dark">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/finance-hero.png" 
            alt="" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-finance-dark/60 to-emerald-900/80"></div>
        </div>
        
        {/* Floating Decorative Blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-finance rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-finance rounded-2xl flex items-center justify-center shadow-lg shadow-finance/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SmartFin</span>
          </div>

          {/* Hero Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Take Control of Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-finance to-emerald-300">
                Family Finances
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Track income, manage expenses, set budgets, and get AI-powered insights — all in one beautiful dashboard.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: TrendingUp, label: 'Smart Analytics' },
                { icon: Shield, label: 'Bank-Grade Security' },
                { icon: Users, label: 'Family Sharing' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium"
                >
                  <feature.icon className="w-4 h-4 text-finance" />
                  {feature.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial / Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-white/80 text-sm italic leading-relaxed">
              "SmartFin transformed how our family manages money. We finally know exactly where every dollar goes."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-finance to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
              <div>
                <p className="text-white font-medium text-sm">John Doe</p>
                <p className="text-slate-400 text-xs">Family of 4 • Premium User</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #14b8a6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Mobile-only logo header */}
        <div className="lg:hidden absolute top-6 left-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-finance rounded-xl flex items-center justify-center shadow-md shadow-finance/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">SmartFin</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 mt-12 lg:mt-0"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
