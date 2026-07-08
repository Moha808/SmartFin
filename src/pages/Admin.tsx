import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, Building, Activity, ShieldCheck } from 'lucide-react';
import { getAdminStats } from '../services/api';

export const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'superadmin') {
      const fetchStats = async () => {
        try {
          const data = await getAdminStats();
          setStats(data);
        } catch (error) {
          console.error("Failed to fetch admin stats", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (currentUser?.role !== 'superadmin') {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-finance/30 border-t-finance rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">System-wide overview and management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Users</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalUsers || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Families</h3>
            <Building className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats?.totalFamilies || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Transaction Volume</h3>
            <Activity className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            ${(stats?.totalTransactionVolume || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Family Admins (Owners)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Family ID</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {stats?.admins?.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No family admins found.</td>
                 </tr>
              ) : (
                stats?.admins?.map((admin: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">
                      {admin.displayName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {admin.familyId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
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
