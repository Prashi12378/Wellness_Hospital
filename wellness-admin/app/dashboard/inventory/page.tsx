'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminInventoryPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/inventory');
            if (res.ok) {
                const data = await res.json();
                setMedicines(data);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batch_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStock = medicines.reduce((acc, item) => acc + item.stock, 0);
    const lowStockCount = medicines.filter(m => m.stock < 10).length;
    const totalValue = medicines.reduce((acc, item) => acc + (item.price * item.stock), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pharmacy Inventory</h1>
                <p className="text-slate-500">Live view of hospital pharmacy stock.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Stock Value</p>
                        <h3 className="text-2xl font-bold text-slate-800">₹{totalValue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Units</p>
                        <h3 className="text-2xl font-bold text-slate-800">{totalStock}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-slate-800">{lowStockCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search inventory..."
                    className="flex-1 outline-none text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Medicine Name</th>
                                <th className="px-6 py-4">Batch No</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8">Loading live inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No medicines found.</td></tr>
                            ) : (
                                filteredMedicines.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{item.batch_no || '-'}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {item.expiry_date ? format(new Date(item.expiry_date), 'MMM yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium">₹{item.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.stock < 10
                                                ? 'bg-red-100 text-red-700'
                                                : item.stock < 50
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {item.stock} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{item.location || '-'}</td>
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
