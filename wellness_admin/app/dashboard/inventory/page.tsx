'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, ArrowUpRight, Trash2, Edit, X, RefreshCw, History, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export default function AdminInventoryPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [returnsData, setReturnsData] = useState<{ deletedMedicines: any[], returnedInvoices: any[] }>({ deletedMedicines: [], returnedInvoices: [] });
    const [returnsLoading, setReturnsLoading] = useState(false);
    const [editingMed, setEditingMed] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    useLockBodyScroll(isEditModalOpen || deleteConfirm.isOpen);


    useEffect(() => {
        fetchInventory();
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        setReturnsLoading(true);
        try {
            const res = await fetch('/api/pharmacy/returns');
            if (res.ok) {
                const data = await res.json();
                setReturnsData(data);
            }
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setReturnsLoading(false);
        }
    };

    const handleRefresh = () => {
        if (activeTab === 'ACTIVE') {
            fetchInventory();
        } else {
            fetchReturns();
        }
    };


    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pharmacy/medicines');
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

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/pharmacy/medicines', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingMed.id, ...formData })
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                setEditingMed(null);
                fetchInventory();
            }
        } catch (error) {
            console.error("Error updating medicine:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/pharmacy/medicines?id=${deleteConfirm.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setDeleteConfirm({ isOpen: false, id: '', name: '' });
                fetchInventory();
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
        setIsEditModalOpen(true);
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.batchNo && m.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalStock = medicines.reduce((acc, item) => acc + item.stock, 0);
    const lowStockCount = medicines.filter(m => m.stock < 10).length;
    const totalValue = medicines.reduce((acc, item) => acc + (Number(item.price) * item.stock), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pharmacy Inventory</h1>
                    <p className="text-slate-500">Live view of hospital pharmacy stock.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    title="Refresh Inventory"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
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


            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Active Inventory
                </button>
                <button
                    onClick={() => setActiveTab('RETURNS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'RETURNS' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History className="w-4 h-4" /> Returns & Deletions
                </button>
            </div>

            {activeTab === 'ACTIVE' ? (
                <>

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
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Loading live inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No medicines found.</td></tr>
                            ) : (
                                filteredMedicines.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            <div className="text-[10px] text-slate-400">HSN: {item.hsnCode || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{item.batchNo || '-'}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {item.expiryDate ? format(new Date(item.expiryDate), 'MMM yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">₹{Number(item.price).toFixed(2)}</div>
                                            <div className="text-[10px] text-emerald-600 font-medium">GST: {Number(item.gstRate)}%</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{item.stock} Units</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, name: item.name })}
                                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
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


                </>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Deleted Medicines */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-red-500" />
                                <h3 className="font-bold text-slate-800">Deleted Medicines</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {returnsLoading ? (
                                    <div className="text-center py-8 text-slate-500">Loading deleted items...</div>
                                ) : returnsData.deletedMedicines.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">No deleted medicines found.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {returnsData.deletedMedicines.map((med) => (
                                            <div key={med.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-slate-900 line-through text-red-800/80">{med.name}</div>
                                                    <div className="text-xs text-slate-500">Batch: {med.batchNo || 'N/A'} • ₹{Number(med.price).toFixed(2)}</div>
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Deleted</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Returned Invoices */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-slate-800">Returned Invoices</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {returnsLoading ? (
                                    <div className="text-center py-8 text-slate-500">Loading returned invoices...</div>
                                ) : returnsData.returnedInvoices.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">No returned invoices found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {returnsData.returnedInvoices.map((inv) => (
                                            <div key={inv.id} className="p-4 bg-amber-50/30 rounded-lg border border-amber-100/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-slate-900">{inv.patientName}</div>
                                                        <div className="text-xs font-mono text-slate-500 font-bold">{inv.billNo}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-amber-700">₹{Number(inv.grandTotal).toLocaleString()}</div>
                                                        <div className="text-[10px] text-slate-500">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-600 mt-2 bg-white/50 p-2 rounded">
                                                    <span className="font-medium text-slate-800">Returned Items: </span>
                                                    {inv.items.map((i:any) => `${i.name} (x${i.qty})`).join(', ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Edit Medicine</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Medicine Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
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
                                        value={formData.batchNo}
                                        onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">HSN Code</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all"
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
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Stock</label>
                                    <input
                                        required
                                        type="number"
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
                            <button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 transition-colors mt-2"
                            >
                                Update Medicine
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Medicine?</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                                Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteConfirm.name}"</span>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
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
