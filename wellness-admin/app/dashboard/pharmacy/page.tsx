'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, PackageCheck, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function PharmacyPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pharmacy/medicines');
            if (res.ok) {
                const data = await res.json();
                setMedicines(data);
            }
        } catch (error) {
            console.error("Error fetching medicines:", error);
        } finally {
            setLoading(false);
        }
    };

    const isLowStock = (qty: number) => qty < 50;
    const isExpiringSoon = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 90 && diffDays > 0;
    };
    const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pharmacy Overview</h1>
                    <p className="text-slate-500">Real-time stock levels, expiry status, and inventory alerts.</p>
                </div>
                {/* Add/Edit removed as requested. Only reflection here. */}
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                    Read-Only View
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{medicines.length}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Items</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-600">
                            {medicines.filter(m => isLowStock(m.stock_quantity)).length}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Low Stock Alerts</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-600">
                            {medicines.filter(m => isExpiringSoon(m.expiry_date) || isExpired(m.expiry_date)).length}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Expiring Soon/Expired</div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-700">Live Inventory Status</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Medicine Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Batch Info</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Current Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Unit Price</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Expiry Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading inventory...</td></tr>
                            ) : medicines.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No medicines in stock.</td></tr>
                            ) : (
                                medicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{med.name}</div>
                                            <div className="text-xs text-slate-500">{med.manufacturer}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                {med.batch_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-semibold ${isLowStock(med.stock_quantity) ? 'text-amber-600 flex items-center gap-1' : 'text-emerald-700'}`}>
                                                {med.stock_quantity} units
                                                {isLowStock(med.stock_quantity) && <AlertTriangle className="w-3 h-3" />}
                                                {!isLowStock(med.stock_quantity) && <span className="text-xs font-normal text-emerald-600 ml-1">(In Stock)</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            ₹{med.unit_price}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isExpired(med.expiry_date) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Expired
                                                </span>
                                            ) : isExpiringSoon(med.expiry_date) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    Expiring Soon
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">
                                                    {format(new Date(med.expiry_date), 'MMM d, yyyy')}
                                                </span>
                                            )}
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
}
