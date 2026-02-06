'use client';

import { useState, useEffect } from 'react';
import { getInventory, addMedicine, deleteMedicine } from '@/app/actions/inventory';
import { Plus, Search, Filter, AlertTriangle, Package, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function InventoryPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        batch_no: '',
        expiry_date: '',
        price: '',
        stock: '',
        location: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await getInventory();

        if (data) setMedicines(data);
        if (error) alert(error);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await addMedicine(formData);

            if (result.error) throw new Error(result.error);

            setIsModalOpen(false);
            setFormData({ name: '', batch_no: '', expiry_date: '', price: '', stock: '', location: '' });
            fetchInventory();
        } catch (error: any) {
            alert('Error adding medicine: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this medicine?')) return;
        const result = await deleteMedicine(id);
        if (result.success) fetchInventory();
        else alert(result.error);
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.batch_no && m.batch_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500">Track stock levels, expiry dates, and medicine details.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Medicine
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Items</p>
                        <h3 className="text-2xl font-bold text-slate-800">{medicines.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {medicines.filter(m => m.stock < 10).length}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by medicine name or batch no..."
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
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8">Loading inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No medicines found.</td></tr>
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
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Add New Medicine</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch No</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                        value={formData.batch_no}
                                        onChange={e => setFormData({ ...formData, batch_no: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                        value={formData.expiry_date}
                                        onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Rack</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rack A-12"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary-light outline-none"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-11 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-11 bg-primary-light hover:bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary-light/20 transition-colors"
                                >
                                    Add Medicine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


