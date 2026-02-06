'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/app/actions/dashboard';
import { Scan, AlertTriangle, FileText, TrendingUp, Package, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    todaysSales: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();

        if (result.error) {
          console.error(result.error);
          return;
        }

        if (result.stats) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-light" /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy Dashboard</h1>
        <p className="text-slate-500">Inventory status and daily metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Items"
          value={stats.totalItems.toString()}
          icon={Package}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Stock Units Available"
          value={stats.totalStock.toString()}
          icon={Scan}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-600"
          alert={stats.lowStock > 0}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todaysSales.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/dashboard/billing" className="p-6 bg-gradient-to-br from-primary-light to-primary rounded-2xl shadow-lg text-white group hover:shadow-xl transition-all">
          <div className="p-3 bg-white/20 w-fit rounded-lg mb-4 backdrop-blur-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-1">New Invoice</h3>
          <p className="text-blue-100 opacity-90 group-hover:opacity-100">Create a bill for a customer</p>
        </a>

        <a href="/dashboard/inventory" className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-primary-light/30 hover:shadow-md transition-all group">
          <div className="p-3 bg-orange-50 text-orange-600 w-fit rounded-lg mb-4 group-hover:bg-orange-100 transition-colors">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Stock Entry</h3>
          <p className="text-slate-500">Add new medicines or update stock</p>
        </a>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
  return (
    <div className={`p-6 bg-white border rounded-2xl shadow-sm flex items-center gap-4 ${alert ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</h3>
      </div>
    </div>
  );
}
