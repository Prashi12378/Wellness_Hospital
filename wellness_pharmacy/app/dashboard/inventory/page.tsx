'use client';

import { useState, useEffect } from 'react';
import { getInventory, addMedicine, deleteMedicine, updateStock } from '@/app/actions/inventory';
import { getUnreadCount } from '@/app/actions/notifications';
import { Plus, Search, Trash2, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function InventoryPage() {
    const [medicines, setMedicines] = useState<any[]>([]);
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Custom Modal States
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Stock Update Modal State
    const [stockModal, setStockModal] = useState<{ isOpen: boolean; id: string; name: string; currentStock: number; expiry?: string; price?: number }>({
        isOpen: false,
        id: '',
        name: '',
        currentStock: 0,
        expiry: '',
        price: 0
    });
    const [stockToAdd, setStockToAdd] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        batch_no: '',
        hsn_code: '',
        expiry_date: '',
        price: '',
        gst_rate: '5',
        stock: '',
        location: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    // Scroll Lock Logic
    useEffect(() => {
        const isAnyModalOpen = isModalOpen || deleteConfirm.isOpen || alertConfig.isOpen || stockModal.isOpen;
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, deleteConfirm.isOpen, alertConfig.isOpen, stockModal.isOpen]);

    // Barcode Listener
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore ONLY if inside an input field
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            const currentTime = Date.now();
            const char = e.key;

            if (currentTime - lastKeyTime > 100) {
                buffer = '';
            }
            lastKeyTime = currentTime;

            if (char === 'Enter') {
                if (buffer.length > 2) {
                    handleBarcodeScan(buffer);
                    buffer = '';
                }
            } else if (char.length === 1) {
                buffer += char;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [medicines]); // Reverted dependencies to medicines only

    const handleBarcodeScan = (code: string) => {
        console.log('Scanned:', code);
        // Find if medicine exists (by batch_no or name)
        const existing = medicines.find(m =>
            (m.batch_no && m.batch_no.toLowerCase() === code.toLowerCase()) ||
            (m.name.toLowerCase() === code.toLowerCase())
        );

        if (existing) {
            // Open Stock Update Modal
            openStockModal(existing);
            const expiryStr = existing.expiry_date ? format(new Date(existing.expiry_date), 'MMM yyyy') : 'N/A';
            showAlert('Item Found', `Scanned: ${existing.name}\nBatch: ${existing.batch_no}\nExpiry: ${expiryStr}\nPrice: ₹${existing.price}\n\nEnter quantity to add.`, 'info');
        } else {
            // Open Add New Modal
            setFormData(prev => ({ ...prev, batch_no: code }));
            setIsModalOpen(true);
            showAlert('New Item', `Item not found. Batch No "${code}" pre-filled.`, 'info');
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await getInventory();
        const { count } = await getUnreadCount();

        if (data) setMedicines(data);
        if (count !== undefined) setUnreadAlerts(count);
        if (error) showAlert('Error', error, 'error');
        setLoading(false);
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await addMedicine(formData);

            if (result.error) throw new Error(result.error);

            setIsModalOpen(false);
            setFormData({ name: '', batch_no: '', hsn_code: '', expiry_date: '', price: '', gst_rate: '5', stock: '', location: '' });
            fetchInventory();
            showAlert('Success', 'Medicine added successfully to inventory.', 'success');
        } catch (error: any) {
            showAlert('Add Failed', error.message, 'error');
        }
    };

    const confirmDelete = (id: string, name: string) => {
        setDeleteConfirm({ isOpen: true, id, name });
    };

    const handleDelete = async () => {
        const { id } = deleteConfirm;
        setDeleteConfirm({ ...deleteConfirm, isOpen: false });

        const result = await deleteMedicine(id);
        if (result.success) {
            fetchInventory();
            showAlert('Deleted', 'Medicine record removed successfully.', 'success');
        } else {
            showAlert('Delete Failed', result.error || 'Could not delete medicine.', 'error');
        }
    };

    const openStockModal = (item: any) => {
        setStockModal({
            isOpen: true,
            id: item.id,
            name: item.name,
            currentStock: item.stock,
            expiry: item.expiry_date,
            price: item.price
        });
        setStockToAdd('');
    };

    const handleStockUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(stockToAdd);
        if (!qty || qty <= 0) return;

        const result = await updateStock(stockModal.id, qty);
        if (result.success) {
            setStockModal({ ...stockModal, isOpen: false });
            fetchInventory();
            showAlert('Stock Updated', `Added ${qty} units to ${stockModal.name}.`, 'success');
        } else {
            showAlert('Update Failed', result.error || 'Failed to update stock', 'error');
        }
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
                <div className="flex gap-2">
                    <button
                        onClick={fetchInventory}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        title="Refresh Inventory"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary-light hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Medicine
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Items</p>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{medicines.length}</h3>
                    <p className="text-xs text-slate-400 mt-1">Active inventory listing</p>
                </div>

                <div className={cn(
                    "bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md",
                    medicines.filter(m => m.stock < 10).length > 0 ? "border-amber-100 bg-amber-50/10" : "border-slate-100"
                )}>
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
                    </div>
                    <h3 className={cn(
                        "text-3xl font-bold tracking-tight",
                        medicines.filter(m => m.stock < 10).length > 0 ? "text-amber-600" : "text-slate-900"
                    )}>
                        {medicines.filter(m => m.stock < 10).length}
                    </h3>
                    {medicines.filter(m => m.stock < 10).length > 0 && <p className="text-xs font-medium text-amber-600 mt-1">Restock recommended</p>}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by medicine name or batch no... (or Scan Barcode)"
                    className="flex-1 outline-none text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-tighter text-[11px]">
                            <tr>
                                <th className="px-8 py-5">Medicine Name</th>
                                <th className="px-6 py-5">Batch / HSN</th>
                                <th className="px-6 py-5">Expiry</th>
                                <th className="px-6 py-5">Price (GST%)</th>
                                <th className="px-6 py-5">Stock</th>
                                <th className="px-6 py-5">Location</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8">Loading inventory...</td></tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No medicines found.</td></tr>
                            ) : (
                                filteredMedicines.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-slate-900">{item.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-700 font-medium">{item.batch_no || '-'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.hsn_code || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {item.expiry_date ? format(new Date(item.expiry_date), 'MMM yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-900">₹{item.price}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold">GST: {item.gst_rate}%</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock < 10
                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                : item.stock < 50
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                {item.stock} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{item.location || '-'}</td>
                                        <td className="px-8 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openStockModal(item)}
                                                className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                                                title="Add Stock"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item.id, item.name)}
                                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
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

            {/* Add Stock Modal */}
            {stockModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add Stock</h2>
                            <button onClick={() => setStockModal({ ...stockModal, isOpen: false })} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-2">Adding stock for <span className="font-bold text-slate-900">{stockModal.name}</span></p>
                                <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</p>
                                        <p className="text-sm font-bold text-slate-700">{stockModal.expiry ? format(new Date(stockModal.expiry), 'MMM yyyy') : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (MRP)</p>
                                        <p className="text-sm font-bold text-primary">₹{stockModal.price}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Stock</p>
                                        <p className="text-sm font-bold text-slate-700">{stockModal.currentStock} Units</p>
                                    </div>
                                </div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Quantity to Add</label>
                                <input
                                    autoFocus
                                    required
                                    type="number"
                                    min="1"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light focus:ring-4 focus:ring-primary-light/10 outline-none transition-all font-bold text-lg"
                                    value={stockToAdd}
                                    onChange={e => setStockToAdd(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full h-11 bg-primary-light hover:bg-primary text-white font-medium rounded-lg shadow-lg shadow-primary-light/20 transition-colors"
                            >
                                Update Stock
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Medicine</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-lg border border-slate-200 shadow-sm transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Medicine Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light focus:ring-4 focus:ring-primary-light/10 outline-none transition-all"
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
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all"
                                        placeholder="e.g. 25E31G83"
                                        value={formData.batch_no}
                                        onChange={e => setFormData({ ...formData, batch_no: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">HSN Code</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all"
                                        placeholder="3004xxxx"
                                        value={formData.hsn_code}
                                        onChange={e => setFormData({ ...formData, hsn_code: e.target.value })}
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
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all font-bold"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">GST Rate (%)</label>
                                    <select
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all font-bold"
                                        value={formData.gst_rate}
                                        onChange={e => setFormData({ ...formData, gst_rate: e.target.value })}
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
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all"
                                        value={formData.expiry_date}
                                        onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Location / Rack</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rack A-12"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary-light outline-none transition-all"
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

            {/* Custom Delete Confirmation Modal */}
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
                                    onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
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

            {/* Branded Alert Modal */}
            {alertConfig.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className={cn(
                                "w-2 h-16 rounded-full mx-auto mb-6",
                                alertConfig.type === 'success' ? "bg-emerald-500" :
                                    alertConfig.type === 'error' ? "bg-red-500" : "bg-blue-500"
                            )} />
                            <h2 className="text-xl font-bold text-slate-900 mb-2">{alertConfig.title}</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {alertConfig.message}
                            </p>
                            <button
                                onClick={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                                className={cn(
                                    "w-full h-11 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg",
                                    alertConfig.type === 'success' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" :
                                        alertConfig.type === 'error' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                                )}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
