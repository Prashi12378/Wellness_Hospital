'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

export default function LedgerPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    // Stats
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });

    const [formData, setFormData] = useState({
        transaction_type: 'income',
        category: '',
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
                category: '',
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Financial Ledger</h1>
                    <p className="text-slate-500">Track hospital income and daily expenses</p>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Entry
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Income</div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">₹{stats.income.toLocaleString()}</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Expenses</div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">₹{stats.expense.toLocaleString()}</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Net Balance</div>
                        <div className={`p-2 rounded-lg ${stats.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {stats.balance >= 0 ? '+' : ''}₹{stats.balance.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-semibold text-slate-700">Recent Transactions</h3>
                    <div className="flex gap-2">
                        {/* Filters could go here */}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date & Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Category & Pay Mode</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Description</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Recorded By</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Amount</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading ledger...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No transactions recorded yet.</td></tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{format(new Date(t.transaction_date), 'MMM d, yyyy')}</div>
                                            <div className={`text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${t.transaction_type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {t.transaction_type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {t.transaction_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 font-medium">{t.category}</div>
                                            <div className="text-xs text-slate-500 capitalize">{t.payment_method}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 break-words max-w-xs">
                                            {t.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {t.profiles?.full_name || 'Unknown'}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.transaction_type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {t.transaction_type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Add Transaction</h2>
                            <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex p-1 bg-slate-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, transaction_type: 'income' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.transaction_type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, transaction_type: 'expense' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.transaction_type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Expense
                                    </button>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Amount (₹)</label>
                                    <input
                                        type="number" required min="0" step="0.01"
                                        className="w-full h-12 px-3 rounded-lg border border-slate-200 text-lg font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Category</label>
                                    <input
                                        type="text" required
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder={formData.transaction_type === 'income' ? 'e.g. OPD Fees' : 'e.g. Electricity'}
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Date</label>
                                    <input
                                        type="date" required
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.transaction_date}
                                        onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Payment Method</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                        value={formData.payment_method}
                                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
                                    <textarea
                                        className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        placeholder="Add notes..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-600">Cancel</button>
                                <button type="submit" disabled={submitting} className={`flex-1 h-10 rounded-lg text-white font-medium flex items-center justify-center ${formData.transaction_type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                    {submitting ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
