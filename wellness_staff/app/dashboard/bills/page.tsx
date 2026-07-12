'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, IndianRupee, Loader2, Download, ReceiptText, Printer } from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { getAllFrontDeskInvoices } from '@/app/actions/billing';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AuditBillsPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    // Audit filters
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'RETURNED'>('ALL');

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        const result = await getAllFrontDeskInvoices();
        if (result.success) setInvoices(result.invoices || []);
        setLoading(false);
    };

    // Audit-filtered invoices (for PDF)
    const auditInvoices = invoices.filter(inv => {
        let ok = true;
        const invDate = new Date(inv.date || inv.createdAt || new Date());
        if (fromDate) {
             const from = new Date(fromDate + 'T00:00:00');
             ok = ok && invDate >= from;
        }
        if (toDate) {
             const to = new Date(toDate + 'T23:59:59');
             ok = ok && invDate <= to;
        }
        if (statusFilter !== 'ALL') ok = ok && inv.status === statusFilter;
        return ok;
    });

    const filteredInvoices = auditInvoices.filter(inv => {
        const matchesSearch =
            inv.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.billNo?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Summary totals for audit
    const auditTotals = auditInvoices.reduce((acc, inv) => {
        acc.subTotal += Number(inv.subTotal || 0);
        acc.totalGst += Number(inv.totalGst || 0);
        acc.discountAmount += Number(inv.discountAmount || 0);
        acc.grandTotal += Number(inv.grandTotal || 0);
        return acc;
    }, { subTotal: 0, totalGst: 0, discountAmount: 0, grandTotal: 0 });

    const handleDownloadPdf = () => {
        setIsDownloading(true);
        try {
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:100vw;height:100vh;border:none;';
            document.body.appendChild(iframe);
            const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iDoc) { document.body.removeChild(iframe); setIsDownloading(false); return; }

            const dateLabel = fromDate && toDate
                ? `${format(parseISO(fromDate), 'dd MMM yyyy')} to ${format(parseISO(toDate), 'dd MMM yyyy')}`
                : fromDate ? `From ${format(parseISO(fromDate), 'dd MMM yyyy')}` : toDate ? `Up to ${format(parseISO(toDate), 'dd MMM yyyy')}` : 'All Time';

            const rows = auditInvoices.map((inv, i) => `
                <tr style="border-bottom:1px solid #e2e8f0;${inv.status==='RETURNED'?'color:#94a3b8;text-decoration:line-through;':''}">
                    <td style="padding:6px 8px;text-align:center;color:#94a3b8;">${i + 1}</td>
                    <td style="padding:6px 8px;font-family:monospace;font-weight:700;color:#1d4ed8;">${inv.billNo}</td>
                    <td style="padding:6px 8px;">${format(new Date(inv.date), 'dd/MM/yyyy')}</td>
                    <td style="padding:6px 8px;font-weight:600;">${inv.patientName}</td>
                    <td style="padding:6px 8px;color:#64748b;font-size:11px;">${inv.patientPhone || '-'}</td>
                    <td style="padding:6px 8px;color:#64748b;font-size:11px;">${inv.doctorName || 'Self'}</td>
                    <td style="padding:6px 8px;font-size:11px;">${inv.paymentMethod}</td>
                    <td style="padding:6px 8px;text-align:right;">₹${Number(inv.subTotal).toFixed(2)}</td>
                    <td style="padding:6px 8px;text-align:right;color:#16a34a;">₹${Number(inv.totalGst).toFixed(2)}</td>
                    <td style="padding:6px 8px;text-align:right;color:#dc2626;">₹${Number(inv.discountAmount||0).toFixed(2)}</td>
                    <td style="padding:6px 8px;text-align:right;font-weight:800;">₹${Number(inv.grandTotal).toFixed(2)}</td>
                    <td style="padding:6px 8px;text-align:center;">
                        <span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:${inv.status==='PAID'?'#dcfce7':inv.status==='RETURNED'?'#fee2e2':'#fef3c7'};color:${inv.status==='PAID'?'#166534':inv.status==='RETURNED'?'#991b1b':'#92400e'};">${inv.status}</span>
                    </td>
                </tr>`).join('');

            const html = `<!DOCTYPE html><html><head><title>Front Desk Bills Audit Report</title>
            <style>
                @page { size: A4 landscape; margin: 12mm; }
                body { font-family: system-ui, sans-serif; color: #1e293b; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #1e293b; color: #fff; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
                th:last-child, th:nth-child(n+8) { text-align: right; }
                th:nth-child(12) { text-align: center; }
                .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; display: inline-block; margin: 4px; }
            </style></head><body>
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #e2e8f0;padding-bottom:12px;margin-bottom:12px;">
                    <div>
                        <h1 style="margin:0 0 4px;font-size:20px;font-weight:900;">Wellness Hospital</h1>
                        <p style="margin:0;font-size:11px;color:#64748b;">Beside friend function hall, Gowribidnur main road, Palanjoghalli, Doddaballapur - 561203</p>
                        <p style="margin:2px 0 0;font-size:11px;color:#64748b;">Ph: +91 8105666338 | GSTIN: 29JNVPS4919B2Z5</p>
                    </div>
                    <div style="text-align:right;">
                        <h2 style="margin:0 0 4px;font-size:16px;font-weight:900;color:#1e40af;">FRONT DESK BILLS AUDIT REPORT</h2>
                        <p style="margin:0;font-size:11px;color:#64748b;">Period: ${dateLabel}</p>
                        <p style="margin:2px 0 0;font-size:11px;color:#64748b;">Status Filter: ${statusFilter} | Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                        <p style="margin:2px 0 0;font-size:11px;color:#64748b;">Total Bills: ${auditInvoices.length}</p>
                    </div>
                </div>
                <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
                    <div class="summary-box"><div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700;">Taxable Amount</div><div style="font-size:18px;font-weight:900;">₹${auditTotals.subTotal.toFixed(2)}</div></div>
                    <div class="summary-box"><div style="font-size:10px;color:#16a34a;text-transform:uppercase;font-weight:700;">Total GST Collected</div><div style="font-size:18px;font-weight:900;color:#16a34a;">₹${auditTotals.totalGst.toFixed(2)}</div></div>
                    <div class="summary-box"><div style="font-size:10px;color:#dc2626;text-transform:uppercase;font-weight:700;">Total Discounts</div><div style="font-size:18px;font-weight:900;color:#dc2626;">₹${auditTotals.discountAmount.toFixed(2)}</div></div>
                    <div class="summary-box" style="background:#1e293b;border-color:#1e293b;"><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Grand Total Revenue</div><div style="font-size:20px;font-weight:900;color:#fff;">₹${auditTotals.grandTotal.toFixed(2)}</div></div>
                </div>
            </div>
            <table>
                <thead><tr>
                    <th style="width:30px;">#</th>
                    <th>Bill No</th><th>Date</th><th>Patient Name</th><th>Phone</th><th>Doctor</th><th>Payment</th>
                    <th style="text-align:right;">Taxable</th><th style="text-align:right;">GST</th><th style="text-align:right;">Discount</th><th style="text-align:right;">Grand Total</th>
                    <th style="text-align:center;">Status</th>
                </tr></thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="background:#f1f5f9;font-weight:900;border-top:2px solid #1e293b;">
                        <td colspan="7" style="padding:8px;font-weight:900;font-size:12px;">TOTALS (${auditInvoices.length} bills)</td>
                        <td style="padding:8px;text-align:right;">₹${auditTotals.subTotal.toFixed(2)}</td>
                        <td style="padding:8px;text-align:right;color:#16a34a;">₹${auditTotals.totalGst.toFixed(2)}</td>
                        <td style="padding:8px;text-align:right;color:#dc2626;">₹${auditTotals.discountAmount.toFixed(2)}</td>
                        <td style="padding:8px;text-align:right;font-size:14px;">₹${auditTotals.grandTotal.toFixed(2)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;">
                <span>This is a computer-generated audit report for tax filing purposes. GSTIN: 29JNVPS4919B2Z5</span>
                <span>Wellness Hospital, Doddaballapur</span>
            </div>
            </body></html>`;

            iDoc.write(html);
            iDoc.close();
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    document.body.removeChild(iframe);
                    setIsDownloading(false);
                }, 600);
            };
        } catch (e) {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Audit Bills
                    </h1>
                    <p className="text-slate-500">View, search, and audit all front desk bills (OPD &amp; Observation).</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-4 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bills</p>
                        <p className="text-lg font-bold text-slate-800">{invoices.length}</p>
                    </div>
                </div>
            </div>

            {/* Audit PDF Download Card */}
            <div className="bg-gradient-to-br from-primary to-slate-900 rounded-2xl p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ReceiptText className="w-5 h-5 text-blue-400" />
                            <h2 className="text-white font-bold text-base">Audit Report — Download All Bills as PDF</h2>
                        </div>
                        <p className="text-slate-400 text-xs">Filter by date range &amp; status, then download a comprehensive PDF with payer info, GST breakdown, and totals for tax filing.</p>
                    </div>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading || auditInvoices.length === 0}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? 'Generating...' : `Download PDF (${auditInvoices.length} bills)`}
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="ALL" className="text-slate-900">All Statuses</option>
                            <option value="PAID" className="text-slate-900">Paid Only</option>
                            <option value="UNPAID" className="text-slate-900">Unpaid / Credit</option>
                            <option value="RETURNED" className="text-slate-900">Returned Only</option>
                        </select>
                    </div>
                </div>

                {/* Live Summary */}
                {auditInvoices.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Taxable Amt', value: `₹${auditTotals.subTotal.toFixed(2)}`, color: 'text-white' },
                            { label: 'GST Collected', value: `₹${auditTotals.totalGst.toFixed(2)}`, color: 'text-emerald-400' },
                            { label: 'Total Discount', value: `₹${auditTotals.discountAmount.toFixed(2)}`, color: 'text-red-400' },
                            { label: 'Grand Total', value: `₹${auditTotals.grandTotal.toFixed(2)}`, color: 'text-blue-300' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-base font-black ${stat.color} tabular-nums`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by Patient Name or Bill Number..."
                    className="flex-1 outline-none text-sm font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
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
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold font-mono">
                                                {invoice.billNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                <span className="text-sm font-medium">{format(new Date(invoice.date), 'dd MMM yyyy')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{invoice.patientName}</p>
                                                    {invoice.patientPhone && <p className="text-[10px] text-slate-400">{invoice.patientPhone}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 font-black text-slate-900 text-base">
                                                <IndianRupee className="w-3.5 h-3.5" />
                                                {Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                invoice.status === 'RETURNED' ? "bg-red-100 text-red-700"
                                                    : invoice.status === 'PAID' ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                            )}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/dashboard/history/invoices/${invoice.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-sm"
                                                title="Print Invoice"
                                            >
                                                <Printer className="w-3.5 h-3.5 text-primary" />
                                                Print
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
