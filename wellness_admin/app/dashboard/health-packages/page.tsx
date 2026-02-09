'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil, Package, Check, X, Loader2, List, IndianRupee } from 'lucide-react';

export default function HealthPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        original_price: '',
        includes: [] as string[],
        icon: 'Stethoscope', // Default
        popular: false
    });
    const [newInclude, setNewInclude] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/health-packages?type=GENERAL');
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
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            original_price: parseFloat(formData.original_price),
            includes: formData.includes,
            icon: formData.icon,
            popular: formData.popular,
            type: 'GENERAL',
            ...(editingPkg && { id: editingPkg.id })
        };

        try {
            const method = editingPkg ? 'PUT' : 'POST';
            const res = await fetch('/api/health-packages', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            setModalOpen(false);
            resetForm();
            fetchPackages();
        } catch (error) {
            alert('Error saving package');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            const res = await fetch(`/api/health-packages?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchPackages();
        } catch (error) {
            alert('Error deleting package');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('WARNING: This will delete ALL health packages. This action cannot be undone. Are you sure?')) return;

        try {
            const res = await fetch(`/api/health-packages?id=all`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete all');
            fetchPackages();
            alert('All packages deleted successfully.');
        } catch (error) {
            alert('Error deleting packages');
        }
    };

    const handleEdit = (pkg: any) => {
        setEditingPkg(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price,
            original_price: pkg.original_price,
            includes: Array.isArray(pkg.includes) ? pkg.includes : [],
            icon: pkg.icon || 'Stethoscope',
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
            original_price: '',
            includes: [],
            icon: 'Stethoscope',
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
                    <h1 className="text-2xl font-bold text-slate-800">Health Packages</h1>
                    <p className="text-slate-500">Manage general health checkup packages (Wellness, Full Body, etc.)</p>
                </div>
                <div className="flex gap-2">
                    {packages.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors shadow-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" /> Clear All
                        </button>
                    )}
                    <button
                        onClick={() => { resetForm(); setModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Package
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search packages..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && !modalOpen ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPackages.map(pkg => (
                        <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => handleEdit(pkg)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(pkg.id)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{pkg.name}</h3>
                                    {pkg.popular && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Popular</span>}
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-2xl font-bold text-slate-800 flex items-center"><IndianRupee className="w-4 h-4" />{pkg.price}</span>
                                <span className="text-sm text-slate-400 line-through flex items-center"><IndianRupee className="w-3 h-3" />{pkg.original_price}</span>
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
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">{editingPkg ? 'Edit Package' : 'New Package'}</h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Package Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring" placeholder="e.g. Full Body Checkup" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price (₹)</label>
                                        <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹)</label>
                                        <input required type="number" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon Name (Lucide)</label>
                                    <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring">
                                        <option value="Stethoscope">Stethoscope</option>
                                        <option value="Heart">Heart</option>
                                        <option value="Shield">Shield</option>
                                        <option value="Activity">Activity</option>
                                        <option value="Brain">Brain</option>
                                        <option value="Baby">Baby</option>
                                        <option value="TestTube">TestTube</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="popular" checked={formData.popular} onChange={e => setFormData({ ...formData, popular: e.target.checked })} className="rounded text-primary focus:ring-primary" />
                                    <label htmlFor="popular" className="text-sm font-medium text-slate-700">Mark as Popular / Best Value</label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Included Tests</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newInclude}
                                            onChange={e => setNewInclude(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
                                            className="flex-1 h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring"
                                            placeholder="Add a test (e.g. CBC)"
                                        />
                                        <button type="button" onClick={handleAddInclude} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.includes.map((item, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                                                {item}
                                                <button type="button" onClick={() => handleRemoveInclude(i)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
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
