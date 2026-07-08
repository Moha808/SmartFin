import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, User as UserIcon, ArrowRight, Users, Eye, EyeOff } from 'lucide-react';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [userType, setUserType] = useState<'family_admin' | 'solo_user' | 'join_family'>('solo_user');
  const [error, setError] = useState('');
  const { signup } = useAuth(); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(name, email, password, userType, userType === 'join_family' ? inviteCode : undefined); 
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create an Account</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">Join SmartFin to master your family's financial future.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance bg-white/50 dark:bg-slate-800 dark:text-white transition-colors"
              placeholder="John Doe"
            />
          </div>
        </div>

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
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">How will you use SmartFin?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUserType('solo_user')}
              className={`p-3 text-sm rounded-xl border text-left transition-all ${userType === 'solo_user' ? 'border-finance bg-finance/5 ring-1 ring-finance text-finance' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              <div className="font-semibold mb-1">Solo</div>
              <div className="text-xs opacity-80">Track my own finances independently.</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('family_admin')}
              className={`p-3 text-sm rounded-xl border text-left transition-all ${userType === 'family_admin' ? 'border-finance bg-finance/5 ring-1 ring-finance text-finance' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              <div className="font-semibold mb-1">Create Family</div>
              <div className="text-xs opacity-80">Be the admin and invite others.</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('join_family')}
              className={`p-3 text-sm rounded-xl border text-left transition-all ${userType === 'join_family' ? 'border-finance bg-finance/5 ring-1 ring-finance text-finance' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              <div className="font-semibold mb-1">Join Family</div>
              <div className="text-xs opacity-80">Use an invite code from an admin.</div>
            </button>
          </div>
        </div>

        {userType === 'join_family' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Family Invite Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-finance focus:border-finance bg-white/50 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="Paste code here"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-finance hover:bg-finance-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finance transition-all disabled:opacity-70 mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Sign Up <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </button>

      </form>
      
      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-finance hover:text-finance-dark">
          Log in
        </Link>
      </p>
    </div>
  );
};
