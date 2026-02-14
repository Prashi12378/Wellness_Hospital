'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, PackageCheck, Calendar, Activity, Plus, Trash2, Edit, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function PharmacyPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMed, setEditingMed] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        batchNo: '',
        hsnCode: '',
        expiryDate: '',
        price: '',
        gstRate: '5',
        stock: '',
        location: ''
    });

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

    const handleAddEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingMed ? 'PATCH' : 'POST';
        const body = editingMed ? { id: editingMed.id, ...formData } : formData;

        try {
            const res = await fetch('/api/pharmacy/medicines', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingMed(null);
                setFormData({ name: '', batchNo: '', hsnCode: '', expiryDate: '', price: '', gstRate: '5', stock: '', location: '' });
                fetchMedicines();
            }
        } catch (error) {
            console.error("Error saving medicine:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/pharmacy/medicines?id=${deleteConfirm.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDeleteConfirm({ isOpen: false, id: '', name: '' });
                fetchMedicines();
            }
        } catch (error) {
            console.error("Error deleting medicine:", error);
        }
    };

    const openEditModal = (med: any) => {
        setEditingMed(med);
        setFormData({
            name: med.name,
            batchNo: med.batchNo || '',
            hsnCode: med.hsnCode || '',
            expiryDate: med.expiryDate ? format(new Date(med.expiryDate), 'yyyy-MM-dd') : '',
            price: med.price.toString(),
            gstRate: med.gstRate.toString(),
            stock: med.stock.toString(),
            location: med.location || ''
        });
        setIsModalOpen(true);
    };

    const isLowStock = (qty: number) => qty < 10;
    const isExpiringSoon = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 90 && diffDays > 0;
    };
    const isExpired = (dateStr: string) => dateStr && new Date(dateStr) < new Date();

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.batchNo && m.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pharmacy Management</h1>
                    <p className="text-slate-500">Manage medicine inventory, prices, and stock levels.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchMedicines}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        title="Refresh Inventory"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            setEditingMed(null);
                            setFormData({ name: '', batchNo: '', hsnCode: '', expiryDate: '', price: '', gstRate: '5', stock: '', location: '' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Medicine
                    </button>
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
                            {medicines.filter(m => isLowStock(m.stock)).length}
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
                            {medicines.filter(m => isExpiringSoon(m.expiryDate) || isExpired(m.expiryDate)).length}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Expiring Soon/Expired</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by medicine name or batch no..."
                    className="flex-1 outline-none text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-700">Inventory Management</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Medicine Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Batch / HSN</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Current Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Price (GST%)</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Expiry Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No medicines found.</td></tr>
                            ) : (
                                filteredMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{med.name}</div>
                                            <div className="text-xs text-slate-500">{med.location}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-medium">{med.batchNo || '-'}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{med.hsnCode || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-semibold ${isLowStock(med.stock) ? 'text-amber-600 flex items-center gap-1' : 'text-emerald-700'}`}>
                                                {med.stock} units
                                                {isLowStock(med.stock) && <AlertTriangle className="w-3 h-3" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-bold">₹{Number(med.price).toFixed(2)}</div>
                                            <div className="text-[10px] text-blue-600 font-medium">GST: {Number(med.gstRate)}%</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isExpired(med.expiryDate) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Expired
                                                </span>
                                            ) : isExpiringSoon(med.expiryDate) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    Expiring Soon
                                                </span>
                                            ) : med.expiryDate ? (
                                                <span className="text-slate-600">
                                                    {format(new Date(med.expiryDate), 'MMM d, yyyy')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(med)}
                                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, id: med.id, name: med.name })}
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete"
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                                {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Medicine Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    placeholder="Medicine brand name..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Batch No</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. 25E31G83"
                                        value={formData.batchNo}
                                        onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">HSN Code</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        placeholder="3004xxxx"
                                        value={formData.hsnCode}
                                        onChange={e => setFormData({ ...formData, hsnCode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">GST Rate (%)</label>
                                    <select
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                                        value={formData.gstRate}
                                        onChange={e => setFormData({ ...formData, gstRate: e.target.value })}
                                    >
                                        <option value="0">0% (Exempt)</option>
                                        <option value="5">5% (Common)</option>
                                        <option value="12">12% (Standard)</option>
                                        <option value="18">18% (Luxury)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Stock Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Location / Rack</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rack A-12"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
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
                                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 transition-colors"
                                >
                                    {editingMed ? 'Update Medicine' : 'Add Medicine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                You are about to delete <span className="font-bold text-slate-900">"{deleteConfirm.name}"</span>.
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false, id: '', name: '' })}
                                    className="flex-1 h-11 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 h-11 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
