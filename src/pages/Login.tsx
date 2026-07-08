import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (mode === 'reset') {
      try {
        if (!email) {
          throw new Error('Please enter your email address');
        }
        await resetPassword(email);
        setSuccess('Password reset link sent to your email!');
        setMode('login');
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-finance rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-finance/30">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">
          {mode === 'login' 
            ? 'Enter your details to access your smart finance dashboard.' 
            : 'Enter your email to receive a password reset link.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100">
            {success}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance bg-white/50 dark:bg-slate-800 dark:text-white transition-colors"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {mode === 'login' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance bg-white/50 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => setMode('reset')} className="text-sm font-medium text-finance hover:text-finance-dark">Forgot password?</button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-finance hover:bg-finance-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finance transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {mode === 'login' ? 'Sign In' : 'Send Reset Link'} <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </button>

        {mode === 'reset' && (
          <div className="text-center mt-4">
            <button type="button" onClick={() => setMode('login')} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              Back to login
            </button>
          </div>
        )}

      </form>
      
      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-finance hover:text-finance-dark">
          Sign up
        </Link>
      </p>
    </div>
  );
};
