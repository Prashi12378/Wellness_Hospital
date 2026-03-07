'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { format } from 'date-fns';
import { Printer, Trash2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { deleteInvoice, returnInvoice } from '@/app/actions/billing';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface InvoicePreviewProps {
    invoice: {
        id: string; // Added id
        billNo: string;
        date: Date | string;
        patientName: string;
        patientPhone?: string;
        doctorName?: string;
        insuranceNo?: string;
        gstin: string;
        subTotal: number;
        totalGst: number;
        grandTotal: number;
        discountRate?: number;
        discountAmount?: number;
        paymentMethod: string;
        status?: string; // Added status
        items: any[];
    };
    onClose: () => void;
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [showConfirm, setShowConfirm] = useState<'delete' | 'return' | null>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const handlePrint = () => {
        const invoiceEl = printRef.current?.querySelector('.invoice-container') as HTMLElement | null;
        if (!invoiceEl) return;

        // 1. Create a hidden iframe — completely isolated from modal layout constraints
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:148mm;height:297mm;border:none;visibility:hidden;';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) { document.body.removeChild(iframe); return; }

        // 2. Copy all stylesheets from the main app so Tailwind classes work in iframe
        const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(el => el.outerHTML).join('\n');

        // 3. Write clean HTML — only the invoice content, no modal chrome
        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${styleLinks}
    <style>
        @page { size: A5 portrait; margin: 5mm; }
        html, body {
            margin: 0 !important; padding: 0 !important;
            height: auto !important; overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .invoice-container {
            display: block !important; position: static !important;
            width: 100% !important; max-width: 148mm !important;
            height: auto !important; overflow: visible !important;
            margin: 0 auto !important; padding: 5mm !important;
            border: none !important; box-shadow: none !important; float: none !important;
        }
        /* Watermark: fixed so it appears on every printed page */
        .invoice-watermark {
            position: fixed !important; inset: 0 !important; opacity: 0.06 !important;
        }
        /* Table: allow rows to break across pages */
        table {
            width: 100% !important; border-collapse: collapse !important;
            page-break-inside: auto !important; break-inside: auto !important;
        }
        tr {
            page-break-inside: avoid !important; break-inside: avoid !important;
            page-break-after: auto !important; break-after: auto !important;
        }
        thead { display: table-header-group !important; }
        tfoot { display: table-footer-group !important; }
        /* Footer: keep together on one page */
        .footer-section { page-break-inside: avoid !important; break-inside: avoid !important; }
        /* Typography */
        table tr td, table tr th { padding-top: 4px !important; padding-bottom: 4px !important; }
        h1 { font-size: 12pt !important; margin-bottom: 2px !important; }
        h2 { font-size: 10pt !important; margin-bottom: 2px !important; }
        p, span, td, th { font-size: 7.5pt !important; line-height: 1.1 !important; }
        .header-logo { width: 48px !important; height: 48px !important; }
        .header-container { margin-bottom: 8px !important; padding-bottom: 8px !important; }
        .patient-info { margin-bottom: 8px !important; }
        .items-table { margin-bottom: 8px !important; }
    </style>
</head>
<body>${invoiceEl.outerHTML}</body>
</html>`);
        iframeDoc.close();

        // 4. Print once iframe CSS is loaded
        const doPrint = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } finally {
                setTimeout(() => {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                }, 1000);
            }
        };

        if (iframeDoc.readyState === 'complete') {
            setTimeout(doPrint, 300);
        } else {
            iframe.addEventListener('load', () => setTimeout(doPrint, 300));
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteInvoice(invoice.id);
        if (result.success) {
            alert('Invoice deleted successfully');
            onClose();
            router.refresh();
        } else {
            alert(result.error || 'Failed to delete');
        }
        setIsDeleting(false);
        setShowConfirm(null);
    };

    const handleReturn = async () => {
        setIsReturning(true);
        const result = await returnInvoice(invoice.id);
        if (result.success) {
            alert('Invoice marked as returned and stock restored');
            onClose();
            router.refresh();
        } else {
            alert(result.error || 'Failed to return');
        }
        setIsReturning(false);
        setShowConfirm(null);
    };

    const taxGroups = invoice.items.reduce((acc: any, item: any) => {
        const rate = Number(item.gstRate);
        const amount = Number(item.amount);
        const gstAmount = (amount * rate) / 100;

        if (!acc[rate]) {
            acc[rate] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
        }

        acc[rate].taxable += amount;
        acc[rate].cgst += gstAmount / 2;
        acc[rate].sgst += gstAmount / 2;
        acc[rate].total += gstAmount;

        return acc;
    }, {});

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 invoice-modal-overlay">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col invoice-modal-container relative">
                {/* Modal Header */}
                <div className="p-4 border-b flex items-center justify-between no-print">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold">Invoice Preview</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pharmacy Billing System</p>
                    </div>
                    <div className="flex gap-2">
                        {invoice.status !== 'RETURNED' && (
                            <>
                                <button
                                    onClick={() => setShowConfirm('return')}
                                    className="bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all font-bold text-sm shadow-lg shadow-orange-500/10"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Return Items
                                </button>
                                <button
                                    onClick={() => setShowConfirm('delete')}
                                    className="bg-red-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-all font-bold text-sm shadow-lg shadow-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Bill
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrint}
                            className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print Now
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all font-bold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Status Badge (Overlay) */}
                {invoice.status === 'RETURNED' && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] rotate-[-12deg] pointer-events-none">
                        <div className="border-[6px] border-red-500/80 px-8 py-2 rounded-xl text-red-500/80 font-black text-4xl uppercase tracking-widest backdrop-blur-[2px]">
                            Returned
                        </div>
                    </div>
                )}

                {/* Print Area — for screen preview only */}
                <div ref={printRef} className="flex-1 overflow-auto p-8 bg-white" id="print-area">
                    {/* Invoice Paper Design for A5 */}
                    <div className="invoice-container relative max-w-[148mm] mx-auto text-slate-800 font-sans border border-slate-200 p-4 sm:p-6 shadow-sm bg-white text-xs">
                        {/* Watermark */}
                        <div className="invoice-watermark absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0 select-none overflow-hidden">
                            <img src="/logo.png" alt="Watermark" className="w-[60%] max-w-[300px] object-contain" />
                        </div>

                        {/* Hospital Header */}
                        <div className="relative z-10 flex justify-between items-start mb-4 border-b-2 border-slate-900 pb-4 header-container">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative grayscale header-logo flex-shrink-0">
                                    <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none mb-1">Wellness Hospital & Pharmacy</h1>
                                    <p className="text-[9px] leading-tight max-w-[260px] text-slate-600">
                                        Beside friend function hall, Gowribidnur main road, Palanjoghalli,<br />
                                        Doddaballapur - 561203, Karnataka, India<br />
                                        Ph: +91 6366662245 | wellnesshospital8383@gmail.com
                                    </p>
                                    <p className="text-[10px] font-bold mt-1">GSTIN: {invoice.gstin}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <h2 className="text-base font-bold uppercase mb-1">GST Invoice</h2>
                                <div className="mt-2 text-[10px] font-medium leading-tight">
                                    <p>Bill No : <span className="font-bold">{invoice.billNo}</span></p>
                                    <p>Date : <span className="font-bold">{format(new Date(invoice.date), 'dd-MM-yy')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-6 text-sm patient-info">
                            <div className="flex gap-2">
                                <span className="font-bold uppercase w-20">Patient:</span>
                                <span>{invoice.patientName}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold uppercase w-20">IP No:</span>
                                <span>{invoice.insuranceNo || 'N/A'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-bold uppercase w-20">Doctor:</span>
                                <span>{invoice.doctorName || 'Self'}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full border-collapse mb-6 text-[10px] items-table">
                            <thead className="bg-slate-50 border-y-2 border-slate-900">
                                <tr>
                                    <th className="py-1 px-1 text-left w-8">S.No</th>
                                    <th className="py-1 px-1 text-left">Item Name</th>
                                    <th className="py-1 px-1 text-left">Hsn Code</th>
                                    <th className="py-1 px-1 text-center w-8">Qty</th>
                                    <th className="py-1 px-1 text-right">Batch</th>
                                    <th className="py-1 px-1 text-right">MRP</th>
                                    <th className="py-1 px-1 text-right">GST%</th>
                                    <th className="py-1 px-1 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-200">
                                        <td className="py-1 px-1">{index + 1}</td>
                                        <td className="py-1 px-1 font-bold">{item.name}</td>
                                        <td className="py-1 px-1">{item.hsnCode}</td>
                                        <td className="py-1 px-1 text-center">{item.qty}</td>
                                        <td className="py-1 px-1 uppercase text-right">{item.batchNo}</td>
                                        <td className="py-1 px-1 text-right">
                                            {(Number(item.mrp) / (1 + Number(item.gstRate) / 100)).toFixed(2)}
                                        </td>
                                        <td className="py-1 px-1 text-right">{item.gstRate}</td>
                                        <td className="py-1 px-1 text-right font-bold">
                                            {Number(item.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Section */}
                        <div className="footer-section pt-4">
                            <div className="flex justify-between items-start gap-8">
                                {/* Terms */}
                                <div className="w-1/2">
                                    <div className="mt-2 text-[9px] leading-tight opacity-70">
                                        <p>1. Major Credit/Debit/Digital Cards accepted.</p>
                                        <p>2. E & O E Goods Once Sold Cannot Be Exchanged.</p>
                                    </div>
                                </div>

                                {/* Totals & Signature */}
                                <div className="w-1/2 flex flex-col items-end">
                                    <div className="w-full space-y-0.5 text-sm border-t-2 border-slate-900 pt-1 mb-4">
                                        <div className="flex justify-between">
                                            <span>Sub Total :</span>
                                            <span className="font-bold">{invoice.subTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total GST :</span>
                                            <span className="font-bold">{invoice.totalGst.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Items :</span>
                                            <span className="font-bold">{invoice.items.length}</span>
                                        </div>
                                        {Number(invoice.discountAmount || 0) > 0 && (
                                            <div className="flex justify-between text-red-600 font-bold">
                                                <span>Discount ({invoice.discountRate}%):</span>
                                                <span>-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xl font-black mt-2 border-t border-slate-200 pt-1">
                                            <span>Total :</span>
                                            <span>₹{invoice.grandTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1 uppercase">
                                            <span>Mode :</span>
                                            <span>{invoice.paymentMethod}</span>
                                        </div>
                                    </div>

                                    <div className="text-center mt-2 w-full max-w-[150px]">
                                        <div className="h-10 border-b border-slate-400 mb-1">
                                            {/* Signature Placeholder */}
                                        </div>
                                        <p className="text-[10px] font-bold uppercase">Signature</p>
                                        <p className="text-[8px] text-slate-500 uppercase">Registered Pharmacist</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialogs */}
            {showConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                            showConfirm === 'delete' ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
                        )}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-bold text-slate-900">
                                {showConfirm === 'delete' ? 'Delete this Invoice?' : 'Process Item Return?'}
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {showConfirm === 'delete'
                                    ? 'This will completely remove the bill from records and restore item stock. This action cannot be undone.'
                                    : 'This will mark the bill as RETURNED and restore items to stock. A reversal entry will be added to the ledger.'}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                disabled={isDeleting || isReturning}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showConfirm === 'delete' ? handleDelete : handleReturn}
                                className={cn(
                                    "flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                                    showConfirm === 'delete'
                                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                        : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                )}
                                disabled={isDeleting || isReturning}
                            >
                                {(isDeleting || isReturning) ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    showConfirm === 'delete' ? 'Delete Bill' : 'Confirm Return'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
