'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Check, X, Loader2, IndianRupee, Droplet } from 'lucide-react';

export default function BloodCollectionManagementPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<any>(null);
    const [editingPkg, setEditingPkg] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        includes: [] as string[],
        icon: 'TestTube',
        popular: false
    });
    const [newInclude, setNewInclude] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/health-packages?type=BLOOD_COLLECTION');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setPackages(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddInclude = () => {
        if (newInclude.trim()) {
            setFormData({ ...formData, includes: [...formData.includes, newInclude.trim()] });
            setNewInclude('');
        }
    };

    const handleRemoveInclude = (index: number) => {
        const newIncludes = [...formData.includes];
        newIncludes.splice(index, 1);
        setFormData({ ...formData, includes: newIncludes });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: parseFloat(formData.originalPrice || formData.price),
            type: 'BLOOD_COLLECTION',
            ...(editingPkg && { id: editingPkg.id })
        };

        try {
            const method = editingPkg ? 'PUT' : 'POST';
            const res = await fetch('/api/health-packages', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Server Error Response:", errData);
                throw new Error(errData.details || errData.error || 'Failed to save');
            }

            setModalOpen(false);
            resetForm();
            fetchPackages();
        } catch (error: any) {
            console.error(error);
            console.log(`Error saving package: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (pkg: any) => {
        setPackageToDelete(pkg);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!packageToDelete) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/health-packages?id=${packageToDelete.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete');
            }
            fetchPackages();
            setDeleteModalOpen(false);
            setPackageToDelete(null);
        } catch (error: any) {
            console.error(error);
            console.log(`Failed to delete: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg: any) => {
        setEditingPkg(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price.toString(),
            originalPrice: pkg.originalPrice?.toString() || pkg.price.toString(),
            includes: Array.isArray(pkg.includes) ? pkg.includes : [],
            icon: pkg.icon || 'TestTube',
            popular: pkg.popular || false
        });
        setModalOpen(true);
    };

    const resetForm = () => {
        setEditingPkg(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            includes: [],
            icon: 'TestTube',
            popular: false
        });
        setNewInclude('');
    };

    const filteredPackages = packages.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Droplet className="w-6 h-6 text-red-500" /> Blood@Home Packages
                    </h1>
                    <p className="text-slate-500">Manage home collection blood test packages</p>
                </div>
                <button
                    onClick={() => { resetForm(); setModalOpen(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Test Package
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search test packages..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && !modalOpen && !deleteModalOpen ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPackages.map(pkg => (
                        <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(pkg)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteClick(pkg)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                    <Droplet className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-800">{pkg.name}</h3>
                            </div>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-2xl font-bold text-slate-800 flex items-center"><IndianRupee className="w-4 h-4" />{pkg.price}</span>
                                {pkg.originalPrice && pkg.originalPrice !== pkg.price && (
                                    <span className="text-sm text-slate-400 line-through flex items-center"><IndianRupee className="w-3 h-3" />{pkg.originalPrice}</span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Includes {pkg.includes?.length || 0} Tests</p>
                                <ul className="space-y-1">
                                    {pkg.includes?.slice(0, 3).map((item: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                            <span className="line-clamp-1">{item}</span>
                                        </li>
                                    ))}
                                    {(pkg.includes?.length || 0) > 3 && (
                                        <li className="text-xs text-primary font-medium pl-5">+ {(pkg.includes?.length || 0) - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                    {filteredPackages.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-500">No Blood@Home packages found. Add your first one above!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Package?</h3>
                        <p className="text-slate-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-slate-700">{packageToDelete?.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">{editingPkg ? 'Edit Test Package' : 'New Test Package'}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. CBC / Thyroid Panel" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                        <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹) - Optional</label>
                                        <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Included Tests / Components</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newInclude}
                                            onChange={e => setNewInclude(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
                                            className="flex-1 h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            placeholder="Add component (e.g. Hemoglobin)"
                                        />
                                        <button type="button" onClick={handleAddInclude} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.includes.map((item, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100">
                                                {item}
                                                <button type="button" onClick={() => handleRemoveInclude(i)} className="hover:text-red-900"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 transition-all">
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingPkg ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
