import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-finance rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-finance/30">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
        <p className="text-slate-500 mt-2 text-center">
          {isSubmitted 
            ? "We've sent you an email with a link to reset your password." 
            : "Enter your email and we'll send you a link to reset your password."}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance bg-white/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-finance hover:bg-finance-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finance transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Send Reset Link <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-finance hover:bg-finance-dark transition-all"
        >
          Return to Login
        </button>
      )}

      <p className="mt-8 text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-finance hover:text-finance-dark inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to log in
        </Link>
      </p>
    </div>
  );
};
