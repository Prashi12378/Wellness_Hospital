'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Pill, Users, IndianRupee, Microscope, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    { id: 'pharmacy', name: 'Pharmacy', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'staff', name: 'Staff/Reception', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'salary', name: 'Salary', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'lab', name: 'Lab Section', icon: Microscope, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'other', name: 'Other', icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export default function LedgerPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Stats
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

    const [formData, setFormData] = useState({
        transaction_type: 'income',
        category: 'pharmacy',
        description: '',
        amount: '',
        payment_method: 'cash',
        transaction_date: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ledger');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const calculateStats = (data: any[]) => {
        const income = data.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = data.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
        setStats({ income, expense, balance: income - expense });
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/ledger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save');

            setAddModalOpen(false);
            setFormData({
                transaction_type: 'income',
                category: 'pharmacy',
                description: '',
                amount: '',
                payment_method: 'cash',
                transaction_date: new Date().toISOString().split('T')[0]
            });
            fetchTransactions();
        } catch (err: any) {
            alert('Error adding transaction: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this transaction?')) return;
        try {
            await fetch(`/api/ledger?id=${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch (e) {
            alert("Delete failed");
        }
    };

    const filteredTransactions = activeTab === 'all'
        ? transactions
        : transactions.filter(t => t.category.toLowerCase() === activeTab.toLowerCase());

    const displayStats = activeTab === 'all'
        ? stats
        : {
            income: filteredTransactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
            expense: filteredTransactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
            balance: filteredTransactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) - filteredTransactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
        };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Ledger</h1>
                    <p className="text-slate-500 text-sm">Track and manage hospital-wide income and expenses by category.</p>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm font-bold text-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Entry
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        activeTab === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    All Entries
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === cat.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <cat.icon className={cn("w-4 h-4", activeTab === cat.id ? cat.color : "text-slate-400")} />
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Income</p>
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">₹{displayStats.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Gross revenue in {activeTab}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Expenses</p>
                        <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">₹{displayStats.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Total outgoings in {activeTab}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Balance</p>
                        <div className={cn(
                            "p-2.5 rounded-xl",
                            displayStats.balance >= 0 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        )}>
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className={cn(
                        "text-3xl font-black tracking-tight",
                        displayStats.balance >= 0 ? "text-blue-600" : "text-orange-600"
                    )}>
                        {displayStats.balance >= 0 ? '+' : ''}₹{displayStats.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Profit/Loss for {activeTab}</p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {activeTab === 'all' ? 'Recent Transactions' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} History`}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Method</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Loading ledger...</td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No transactions found for this category.</td></tr>
                            ) : (
                                filteredTransactions.map((t) => {
                                    const category = CATEGORIES.find(c => c.id === t.category.toLowerCase()) || CATEGORIES[4];
                                    return (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{format(new Date(t.transaction_date), 'dd MMM yyyy')}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-tighter inline-flex items-center gap-0.5 ${t.transaction_type === 'income' ? 'text-emerald-600 font-black' : 'text-red-600 font-black'}`}>
                                                    {t.transaction_type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {t.transaction_type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("p-1.5 rounded-lg", category.bg, category.color)}>
                                                        <category.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-900 font-bold text-sm tracking-tight">{category.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.payment_method}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs font-medium max-w-xs truncate">
                                                {t.description || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                        {t.profiles?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{t.profiles?.full_name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black text-base ${t.transaction_type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {t.transaction_type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Record Entry</h2>
                                <p className="text-xs text-slate-500 font-medium">Add a new income or expense to the hospital ledger.</p>
                            </div>
                            <button onClick={() => setAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                            <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transaction_type: 'income' })}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2",
                                        formData.transaction_type === 'income' ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    INCOME
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transaction_type: 'expense' })}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2",
                                        formData.transaction_type === 'expense' ? "bg-white text-red-600 shadow-md" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <TrendingDown className="w-4 h-4" />
                                    EXPENSE
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Section</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={cn(
                                                    "p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                                                    formData.category === cat.id
                                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                                                )}
                                            >
                                                <cat.icon className={cn("w-4 h-4", formData.category === cat.id ? "text-primary" : "text-slate-400")} />
                                                <span className={cn("text-xs font-bold", formData.category === cat.id ? "text-slate-900" : "text-slate-600")}>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                                        <input
                                            type="number" required min="0" step="0.01"
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 text-lg font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                                        <input
                                            type="date" required
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                                            value={formData.transaction_date}
                                            onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Mode</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-bold text-sm appearance-none cursor-pointer"
                                        value={formData.payment_method}
                                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <option value="cash">Cash Payment</option>
                                        <option value="upi">UPI / Scanner</option>
                                        <option value="card">Debit/Credit Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="insurance">Insurance Claim</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes / Description</label>
                                    <textarea
                                        className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm font-medium placeholder:text-slate-300"
                                        placeholder="Enter transaction details..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={cn(
                                    "w-full h-14 rounded-2xl text-white font-black text-sm tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2",
                                    formData.transaction_type === 'income'
                                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50"
                                        : "bg-red-600 hover:bg-red-700 shadow-red-200/50"
                                )}
                            >
                                {submitting ? 'RECORDING...' : 'SAVE LEDGER ENTRY'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
