'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, IndianRupee, Eye, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { getInvoices } from '@/app/actions/billing';
import InvoicePreview from '@/components/billing/InvoicePreview';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        const result = await getInvoices();
        if (result.success) {
            setInvoices(result.invoices || []);
        }
        setLoading(false);
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.billNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (invoice: any) => {
        setSelectedInvoice(invoice);
        setShowPreview(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Billing History
                    </h1>
                    <p className="text-slate-500">View and manage past customer invoices.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-4 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoices</p>
                        <p className="text-lg font-bold text-slate-800">{invoices.length}</p>
                    </div>
                </div>
            </div>

            {/* Search Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by Patient Name or Bill Number..."
                    className="flex-1 outline-none text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Invoice Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Bill No</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold font-mono">
                                                {invoice.billNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                <span className="text-sm font-medium">
                                                    {format(new Date(invoice.date), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">{invoice.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 font-black text-slate-900 text-base">
                                                <IndianRupee className="w-3.5 h-3.5" />
                                                {Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetails(invoice)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-xs font-bold"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Bill
                                                <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {showPreview && selectedInvoice && (
                <InvoicePreview
                    invoice={selectedInvoice}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}
