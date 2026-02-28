
'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    IndianRupee,
    User,
    Calendar,
    ArrowRight,
    FileText,
    Percent,
    CheckCircle2,
    Clock,
    X,
    Receipt,
    Printer
} from 'lucide-react';

export default function IPDBillingPage() {
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Billing Modal State
    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ipd/admissions');
            if (res.ok) {
                const data = await res.json();
                setAdmissions(data);
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
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
                    paymentMethod: 'CASH' // Can be made dynamic later
                })
            });

            if (res.ok) {
                const data = await res.json();
                setBillingModalOpen(false);
                fetchAdmissions();
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

    const filteredAdmissions = admissions.filter(adm =>
        adm.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">IPD Billing</h1>
                    <p className="text-slate-500">Manage hospital charges and finalize bills for in-patients</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient or IPD ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Charges</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading admissions...</td></tr>
                        ) : filteredAdmissions.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No records found</td></tr>
                        ) : (
                            filteredAdmissions.map((adm) => (
                                <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                {adm.patient?.firstName?.[0]}{adm.patient?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{adm.patient?.firstName} {adm.patient?.lastName}</p>
                                                <p className="text-xs text-slate-500">ID: {adm.id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(adm.admissionDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${adm.status === 'discharged'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {adm.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-900">₹{adm.totalCharges?.toLocaleString() || 0}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            {adm.pharmacyInvoices?.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        const latestInvoice = adm.pharmacyInvoices[adm.pharmacyInvoices.length - 1];
                                                        window.open(`/dashboard/ipd-billing/invoice/${latestInvoice.id}`, '_blank');
                                                    }}
                                                    className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                                                    title="Print Bill"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedAdmission(adm);
                                                    setDiscountAmount(0);
                                                    setBillingModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                title="Bill Record"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Billing Modal */}
            {billingModalOpen && selectedAdmission && (
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
                                    <h3 className="font-bold text-blue-900">{selectedAdmission.patient?.firstName} {selectedAdmission.patient?.lastName}</h3>
                                    <p className="text-sm text-blue-600">IPD ID: {selectedAdmission.id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Charges Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Hospital Charges</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {selectedAdmission.HospitalCharge.map((charge: any) => (
                                        <div key={charge.id} className="flex justify-between items-center py-2 border-b border-slate-50 text-sm">
                                            <span className="text-slate-600">{charge.description}</span>
                                            <span className="font-medium">₹{Number(charge.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {selectedAdmission.HospitalCharge.length === 0 && (
                                        <p className="text-center py-4 text-slate-400 text-sm italic">No hospital charges recorded</p>
                                    )}
                                </div>
                            </div>

                            {/* Discount Application */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900">₹{selectedAdmission.totalCharges.toLocaleString()}</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 block">Apply Discount (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedAdmission.totalCharges}
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
                                        ₹{Math.max(0, selectedAdmission.totalCharges - discountAmount).toLocaleString()}
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
