'use client';

import { useState, useEffect } from 'react';
import { Search, ReceiptText, Filter, Eye, User, IndianRupee, CheckCircle2, X, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export default function AllBillsPage() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, IPD, OPD, PHARMACY, LABORATORY

    // Billing Modal State for unbilled IPD
    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useLockBodyScroll(billingModalOpen);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bills');
            if (res.ok) {
                const result = await res.json();
                setBills(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessBilling = async () => {
        if (!selectedAdmission) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/ipd/billing/${selectedAdmission.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discountAmount,
                    paymentMethod: 'CASH'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBillingModalOpen(false);
                fetchBills();
                window.open('/dashboard/ipd-billing/invoice/' + data.invoice.id, '_blank');
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Billing failed. Please check console.');
        } finally {
            setProcessing(false);
        }
    };

    const filteredBills = bills.filter(bill => {
        const matchTab = activeTab === 'ALL' || bill.type === activeTab;
        const matchSearch = bill.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.billNo.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });

    const totalRevenue = filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <ReceiptText className="w-8 h-8 text-primary" />
                        All Bills & Invoices
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Unified view of all hospital billing transactions</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Shown</div>
                    <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['ALL', 'IPD', 'OPD', 'PHARMACY', 'LABORATORY'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient or Bill No..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Bill No / ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                        <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-lg font-semibold text-slate-700">No bills found</p>
                                        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                {bill.billNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {format(new Date(bill.date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{bill.patientName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border
                                                ${bill.type === 'IPD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    bill.type === 'OPD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        bill.type === 'PHARMACY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            bill.type === 'LABORATORY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-slate-50 text-slate-700 border-slate-200'}`}
                                            >
                                                {bill.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">₹{bill.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{bill.paymentMethod}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${bill.status === 'PAID' || bill.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                    'bg-amber-100 text-amber-800'}`}
                                            >
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            {bill.type === 'IPD' && bill.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAdmission(bill);
                                                        setDiscountAmount(0);
                                                        setBillingModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors text-xs"
                                                    title="Discount & Finalize"
                                                >
                                                    <FileText className="w-4 h-4" /> Finalize
                                                </button>
                                            ) : bill.type === 'IPD' && (bill.status === 'PAID' || bill.status === 'COMPLETED') ? (
                                                <>
                                                    <button
                                                        onClick={() => window.open(`/dashboard/ipd-billing/invoice/${bill.id}`, '_blank')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition-colors text-xs"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer className="w-4 h-4" /> Print
                                                    </button>
                                                    <Link
                                                        href={`/dashboard/all-bills/view/${bill.id}?type=${bill.type}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-colors text-xs"
                                                    >
                                                        <Eye className="w-4 h-4" /> View
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    href={`/dashboard/all-bills/view/${bill.id}?type=${bill.type}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors text-xs"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Billing Modal */}
            {billingModalOpen && selectedAdmission && selectedAdmission.rawAdmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Generate Final Bill</h2>
                            <button onClick={() => setBillingModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Patient Summary */}
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900">{selectedAdmission.patientName}</h3>
                                    <p className="text-sm text-blue-600">IPD ID: {selectedAdmission.id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Charges Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Hospital Charges</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {selectedAdmission.rawAdmission.HospitalCharge?.map((charge: any) => (
                                        <div key={charge.id} className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                                            <span className="text-slate-600">{charge.description}</span>
                                            <span className="font-medium">₹{Number(charge.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {(!selectedAdmission.rawAdmission.HospitalCharge || selectedAdmission.rawAdmission.HospitalCharge.length === 0) && (
                                        <p className="text-center py-4 text-slate-400 text-sm italic">No hospital charges recorded</p>
                                    )}
                                </div>
                            </div>

                            {/* Discount Application */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{selectedAdmission.amount.toLocaleString()}</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 block">Apply Discount (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedAdmission.amount}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                            placeholder="Enter discount amount"
                                            value={discountAmount}
                                            onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800">Grand Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ₹{Math.max(0, selectedAdmission.amount - discountAmount).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleProcessBilling}
                                disabled={processing}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Finalize & Print Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
