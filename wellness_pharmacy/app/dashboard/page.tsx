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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inventory Items"
          value={stats.totalItems.toLocaleString()}
          icon={Package}
          color="text-blue-600"
        />
        <StatCard
          title="Stock Units Available"
          value={stats.totalStock.toLocaleString()}
          icon={Scan}
          color="text-slate-600"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStock.toLocaleString()}
          icon={AlertTriangle}
          color="text-amber-600"
          alert={stats.lowStock > 0}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todaysSales.toLocaleString()}`}
          icon={TrendingUp}
          color="text-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/dashboard/billing" className="group p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-light/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
              <FileText className="w-8 h-8" />
            </div>
            <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-primary-light transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">New Invoice</h3>
          <p className="text-slate-500 leading-relaxed">Generate instant customer bills and manage prescription sales.</p>
        </a>

        <a href="/dashboard/inventory" className="group p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-light/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-slate-100 transition-colors">
              <Package className="w-8 h-8" />
            </div>
            <Scan className="w-5 h-5 text-slate-300 group-hover:text-primary-light transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Stock Inventory</h3>
          <p className="text-slate-500 leading-relaxed">Monitor stock levels, track expiry dates, and add new medicine arrivals.</p>
        </a>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
  return (
    <div className={cn(
      "p-6 bg-white border rounded-2xl shadow-sm transition-all hover:shadow-md",
      alert ? "border-red-100 bg-red-50/10" : "border-slate-100"
    )}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <Icon className={cn("w-5 h-5", color || "text-slate-400")} />
      </div>
      <div>
        <h3 className={cn(
          "text-3xl font-bold tracking-tight",
          alert ? "text-red-600" : "text-slate-900"
        )}>
          {value}
        </h3>
        {alert && (
          <p className="text-xs font-medium text-red-500 mt-1">Action Required</p>
        )}
      </div>
    </div>
  );
}
