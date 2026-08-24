 
/* eslint-disable */
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { format } from 'date-fns';
import { Printer, Trash2, RotateCcw, Loader2, AlertTriangle, CheckCircle2, Tag } from 'lucide-react';
import { deleteInvoice, returnInvoice, returnInvoiceItems, clearPharmacyInvoicePayment, applyInvoiceDiscount } from '@/app/actions/billing';
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
        depositAmount?: number;
        paymentMethod: string;
        status?: string; // Added status
        items: any[];
    };
    onClose: () => void;
    readOnly?: boolean;
}

export default function InvoicePreview({ invoice: initialInvoice, onClose, readOnly = false }: InvoicePreviewProps) {
    const [currentInvoice, setCurrentInvoice] = useState(initialInvoice);
    const invoice = currentInvoice;

    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [showConfirm, setShowConfirm] = useState<'delete' | 'return' | 'partial' | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [showClearPayment, setShowClearPayment] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [isSavingDiscount, setIsSavingDiscount] = useState(false);
    const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
    const [discountVal, setDiscountVal] = useState<string>('');
    const router = useRouter();

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            setMounted(false);
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Sync state if initialInvoice prop updates
    useEffect(() => {
        setCurrentInvoice(initialInvoice);
    }, [initialInvoice]);

    // Populate discount inputs when modal opens
    useEffect(() => {
        if (showDiscountModal) {
            if (Number(invoice.discountRate) > 0) {
                setDiscountType('PERCENT');
                setDiscountVal(String(invoice.discountRate));
            } else if (Number(invoice.discountAmount) > 0) {
                setDiscountType('FLAT');
                setDiscountVal(String(invoice.discountAmount));
            } else {
                setDiscountType('PERCENT');
                setDiscountVal('');
            }
        }
    }, [showDiscountModal, invoice.discountRate, invoice.discountAmount]);

    const subTotal = Number(invoice.subTotal);
    const totalGst = Number(invoice.totalGst);
    const totalBeforeDiscount = subTotal + totalGst;

    let computedDiscountAmount = 0;
    let computedDiscountRate = 0;

    const parsedVal = Number(discountVal) || 0;

    if (discountType === 'PERCENT') {
        computedDiscountRate = parsedVal;
        computedDiscountAmount = Number((totalBeforeDiscount * (parsedVal / 100)).toFixed(2));
    } else {
        computedDiscountAmount = parsedVal;
        computedDiscountRate = totalBeforeDiscount > 0 ? Number(((parsedVal / totalBeforeDiscount) * 100).toFixed(2)) : 0;
    }

    const previewGrandTotal = Math.max(0, Number((totalBeforeDiscount - computedDiscountAmount).toFixed(2)));

    const handleSaveDiscount = async () => {
        if (computedDiscountAmount < 0 || computedDiscountAmount > totalBeforeDiscount) {
            showToast('Discount cannot exceed the total bill amount', 'error');
            return;
        }
        setIsSavingDiscount(true);
        try {
            const res = await applyInvoiceDiscount(invoice.id, computedDiscountRate, computedDiscountAmount);
            if (res.success) {
                setCurrentInvoice(prev => ({
                    ...prev,
                    discountRate: computedDiscountRate,
                    discountAmount: computedDiscountAmount,
                    grandTotal: previewGrandTotal
                }));
                showToast('Discount updated successfully', 'success');
                setShowDiscountModal(false);
                router.refresh();
            } else {
                showToast(res.error || 'Failed to update discount', 'error');
            }
        } catch (err) {
            showToast('An unexpected error occurred', 'error');
        } finally {
            setIsSavingDiscount(false);
        }
    };

    if (!mounted) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        let result;
        try {
            result = await deleteInvoice(invoice.id);
            if (result.success) {
                showToast('Invoice deleted successfully', 'success');
                router.refresh();
                setShowConfirm(null);
                setTimeout(() => onClose(), 1500);
            } else {
                showToast(result.error || 'Failed to delete invoice', 'error');
            }
        } catch (error) {
            showToast('Failed to delete invoice', 'error');
        } finally {
            setIsDeleting(false);
            if (!result?.success) setShowConfirm(null);
        }
    };

    const handleReturn = async () => {
        setIsReturning(true);
        let result;
        try {
            if (showConfirm === 'partial') {
                result = await returnInvoiceItems(invoice.id, selectedItems);
            } else {
                result = await returnInvoice(invoice.id);
            }

            if (result.success) {
                showToast(showConfirm === 'partial' ? 'Selected items returned' : 'Invoice returned successfully', 'success');
                router.refresh();
                setShowConfirm(null);
                setSelectedItems([]);
                setTimeout(() => onClose(), 1500);
            } else {
                showToast(result.error || 'Failed to return invoice', 'error');
            }
        } catch (error) {
            showToast('Failed to return invoice', 'error');
        } finally {
            setIsReturning(false);
            if (!result?.success) {
                setShowConfirm(null);
                setSelectedItems([]);
            }
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handlePrint = () => {
        const invoiceEl = printRef.current?.querySelector('.invoice-container') as HTMLElement | null;
        if (!invoiceEl) return;

        // 1. Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:100vw;height:100vh;border:none;visibility:hidden;';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) { document.body.removeChild(iframe); return; }

        // Clone parent stylesheets to ensure Tailwind works in print
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        // 2. Build responsive print styles
        const styles = `
            @page { 
                size: A5 portrait; 
                margin: 5mm 6mm; 
            }
            body { 
                margin: 0; 
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: #000;
                font-size: 10px;
                line-height: 1.25;
            }
            .invoice-container { 
                width: 100% !important; 
                max-width: 100% !important; 
                padding: 0 !important; 
                margin: 0 !important; 
                border: none !important; 
                box-shadow: none !important;
                background: transparent !important;
                page-break-inside: auto !important; 
                break-inside: auto !important;
            }
            .header-container {
                margin-bottom: 12px !important;
                padding-bottom: 8px !important;
                border-bottom: 1.5px solid #cbd5e1 !important;
            }
            .header-container h1 {
                font-size: 15px !important;
                margin-bottom: 2px !important;
            }
            .header-container p {
                font-size: 9px !important;
                line-height: 1.3 !important;
            }
            .header-container h2 {
                font-size: 15px !important;
                margin-bottom: 2px !important;
            }
            .header-container table {
                font-size: 9.5px !important;
                width: auto !important;
            }
            .header-logo {
                width: 52px !important;
                height: 52px !important;
                padding: 2px !important;
                border-radius: 8px !important;
            }
            .patient-info {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 8px !important;
                margin-bottom: 10px !important;
                padding: 6px 8px !important;
                font-size: 10px !important;
                border-radius: 6px !important;
            }
            .patient-info .info-block span:first-child {
                font-size: 8px !important;
            }
            .items-table-wrapper {
                border-radius: 6px !important;
                margin-bottom: 10px !important;
                border: 1px solid #cbd5e1 !important;
            }
            .items-table th {
                padding: 4px 6px !important;
                font-size: 8.5px !important;
                text-transform: uppercase !important;
            }
            .items-table td {
                padding: 4px 6px !important;
                font-size: 9px !important;
            }
            .items-table thead {
                display: table-header-group !important;
            }
            .items-table tbody {
                display: table-row-group !important;
            }
            .totals-container { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important; 
                margin-top: 10px !important;
                gap: 12px !important;
            }
            .totals-container > div:first-child {
                width: 56% !important;
            }
            .totals-container > div:last-child {
                width: 41% !important;
            }
            .gst-table th, .gst-table td {
                padding: 3px 4px !important;
                font-size: 8px !important;
            }
            .totals-box {
                padding-top: 6px !important;
            }
            .totals-box > div {
                margin-bottom: 6px !important;
                font-size: 9.5px !important;
            }
            .totals-box .bg-slate-900 {
                background-color: #0f172a !important;
                color: #fff !important;
                padding: 6px 10px !important;
                border-radius: 4px !important;
            }
            .footer { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important; 
                page-break-before: avoid !important; 
                break-before: avoid !important; 
                margin-top: 10px !important; 
                padding-top: 6px !important;
                font-size: 8px !important;
            }
            .footer ol {
                font-size: 7.5px !important;
                line-height: 1.25 !important;
            }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            tr { page-break-inside: avoid !important; }
            #print-area { padding: 0 !important; background: transparent !important; }
        `;

        // 3. Clone and Clean HTML
        const clonedInvoice = invoiceEl.cloneNode(true) as HTMLElement;
        clonedInvoice.querySelectorAll('.no-print').forEach(el => el.remove());
        clonedInvoice.querySelectorAll('.item-checkbox').forEach(el => el.remove());

        iframeDoc.write('<!DOCTYPE html><html><head><title>Print Invoice</title>');
        iframeDoc.write(stylesheets); // Inject Tailwind
        iframeDoc.write('<style>' + styles + '</style></head><body>');
        iframeDoc.write(clonedInvoice.outerHTML);
        iframeDoc.write('</body></html>');
        iframeDoc.close();

        // 4. Print & Cleanup
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 500);
        };
    };

    /* eslint-disable @typescript-eslint/no-require-imports */
    const gstGroups = invoice.items.reduce((acc: any, item: any) => {
        const rate = Number(item.gstRate);
        const mrp = Number(item.mrp);
        const qty = Number(item.qty);

        const basePrice = mrp / (1 + rate / 100);
        const gstAmount = (mrp - basePrice) * qty;
        const amount = mrp * qty;

        if (!acc[rate]) {
            acc[rate] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
        }

        acc[rate].taxable += amount - gstAmount; // Taxable amount is amount - gstAmount
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
                        {!readOnly && invoice.status !== 'RETURNED' && (
                            <>
                                {selectedItems.length > 0 && (
                                    <button
                                        onClick={() => setShowConfirm('partial')}
                                        className="bg-amber-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-amber-600 transition-all font-bold text-sm shadow-lg shadow-amber-500/10 animate-in fade-in zoom-in-95"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Return Selected ({selectedItems.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowConfirm('return')}
                                    className="bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all font-bold text-sm shadow-lg shadow-orange-500/10"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Return All
                                </button>
                                <button
                                    onClick={() => setShowConfirm('delete')}
                                    className="bg-red-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-all font-bold text-sm shadow-lg shadow-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Bill
                                </button>
                                {invoice.status === 'UNPAID' && (
                                    <button
                                        onClick={() => setShowClearPayment(true)}
                                        className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-600/10"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Clear Payment
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDiscountModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/10"
                                >
                                    <Tag className="w-4 h-4" />
                                    Apply Discount
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
                <div ref={printRef} className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100/50" id="print-area">
                    {/* Responsive Invoice Paper Design */}
                    <div className="invoice-container relative w-full max-w-4xl mx-auto text-slate-700 font-sans p-6 sm:p-10 shadow-2xl bg-white text-sm rounded-lg border border-slate-200">
                        {/* Hospital Header */}
                        <div className="relative z-10 flex justify-between items-start mb-8 border-b-2 border-slate-200 pb-6 header-container">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 relative header-logo flex-shrink-0 flex items-center justify-center p-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <Image src="/logo.png" alt="Logo" width={72} height={72} className="w-full h-full object-contain" priority />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-2">Wellness Hospital & Pharmacy</h1>
                                    <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                        Beside friend function hall, Gowribidnur main road, Palanjoghalli,<br />
                                        Doddaballapur - 561203, Karnataka, India<br />
                                        <span className="text-slate-600">Ph: +91 6366662245 | wellnesshospital8383@gmail.com</span>
                                    </p>
                                    <div>
                                        <p className="text-xs font-bold mt-2 text-slate-700 bg-slate-100 inline-block px-2 py-1 rounded">GSTIN: {invoice.gstin}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 flex flex-col items-end">
                                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-wider mb-2">Tax Invoice</h2>
                                <table className="text-xs text-right mt-1 w-48">
                                    <tbody>
                                        <tr>
                                            <td className="text-slate-500 pr-2">Bill No:</td>
                                            <td className="font-bold text-slate-900">{invoice.billNo}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-slate-500 pr-2">Date:</td>
                                            <td className="font-bold text-slate-900">{format(new Date(invoice.date), 'dd/MM/yyyy')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm patient-info bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="info-block flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient Details</span>
                                <span className="font-bold text-slate-900">{invoice.patientName}</span>
                            </div>
                            <div className="info-block flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">IP No / Insurance</span>
                                <span className="font-medium text-slate-800">{invoice.insuranceNo || 'N/A'}</span>
                            </div>
                            <div className="info-block flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consulting Doctor</span>
                                <span className="font-medium text-slate-800">{invoice.doctorName || 'Self / Walk-in'}</span>
                            </div>
                        </div>

                        {/* Items Table - Clean styling */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden mb-4 items-table-wrapper">
                            <table className="w-full border-collapse text-xs items-table">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                        {!readOnly && invoice.status !== 'RETURNED' && <th className="py-2.5 px-3 text-center w-6 no-print item-checkbox"></th>}
                                        <th className="py-2.5 px-3 text-center w-10 text-[10px] font-bold uppercase tracking-wider">#</th>
                                        <th className="py-2.5 px-3 text-left text-[10px] font-bold uppercase tracking-wider">Description of Medicines</th>
                                        <th className="py-2.5 px-3 text-center w-16 text-[10px] font-bold uppercase tracking-wider">HSN</th>
                                        <th className="py-2.5 px-3 text-center w-20 text-[10px] font-bold uppercase tracking-wider">Batch</th>
                                        <th className="py-2.5 px-3 text-center w-12 text-[10px] font-bold uppercase tracking-wider">Qty</th>
                                        <th className="py-2.5 px-3 text-right w-20 text-[10px] font-bold uppercase tracking-wider">MRP</th>
                                        <th className="py-2.5 px-3 text-center w-12 text-[10px] font-bold uppercase tracking-wider">GST%</th>
                                        <th className="py-2.5 px-3 text-right w-24 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.items.map((item: any, idx: number) => (
                                        <tr key={idx} className={cn(
                                            "hover:bg-slate-50 transition-colors group",
                                            !readOnly && selectedItems.includes(item.id) && "bg-amber-50"
                                        )}>
                                            {!readOnly && invoice.status !== 'RETURNED' && (
                                                <td className="py-2.5 px-3 no-print item-checkbox align-middle text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => toggleItemSelection(item.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="py-2.5 px-3 text-slate-400 font-medium align-middle text-center">{String(idx + 1).padStart(2, '0')}</td>
                                            <td className="py-2.5 px-3 font-bold text-slate-800 align-middle uppercase">{item.name}</td>
                                            <td className="py-2.5 px-3 text-slate-500 text-[10px] uppercase align-middle text-center">{item.hsnCode}</td>
                                            <td className="py-2.5 px-3 text-center uppercase font-bold text-slate-600 align-middle text-[10px]">{item.batchNo}</td>
                                            <td className="py-2.5 px-3 text-center font-black text-slate-700 align-middle">{item.qty}</td>
                                            <td className="py-2.5 px-3 text-right font-medium text-slate-600 align-middle">
                                                ₹{(Number(item.mrp) / (1 + Number(item.gstRate) / 100)).toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-500 align-middle">{item.gstRate}%</td>
                                            <td className="py-2.5 px-3 text-right font-black text-slate-900 align-middle">₹{Number(item.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Totals */}
                        <div className="flex gap-4 totals-container">
                            <div className="w-7/12">
                                <h3 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Tax Summary
                                </h3>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs text-center gst-table">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="py-2 px-3 font-bold text-slate-600">Rate</th>
                                                <th className="py-2 px-3 font-bold text-slate-600">Taxable Amt</th>
                                                <th className="py-2 px-3 font-bold text-slate-600">CGST</th>
                                                <th className="py-2 px-3 font-bold text-slate-600">SGST</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {Object.entries(gstGroups).map(([rate, vals]: [string, any]) => (
                                                <tr key={rate} className="hover:bg-slate-50/50">
                                                    <td className="py-2 px-3 font-bold text-slate-700">{rate}%</td>
                                                    <td className="py-2 px-3 text-slate-600">₹{vals.taxable.toFixed(2)}</td>
                                                    <td className="py-2 px-3 text-slate-600">₹{vals.cgst.toFixed(2)}</td>
                                                    <td className="py-2 px-3 text-slate-600">₹{vals.sgst.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500">
                                    <p className="font-bold text-slate-700 uppercase mb-0.5 flex justify-between items-center">
                                        <span>Payment Method</span>
                                        <span className="text-sm">{invoice.paymentMethod}</span>
                                    </p>
                                    <p className="italic">* All item amounts are inclusive of GST.</p>
                                </div>
                            </div>

                            <div className="w-5/12">
                                <div className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col pt-3 pb-0 overflow-hidden totals-box">
                                    <div className="px-5 space-y-3 mb-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-slate-500">Sub Total</span>
                                            <span className="font-bold text-slate-800">₹{Number(invoice.subTotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-slate-500">Total Tax (GST)</span>
                                            <span className="font-bold text-slate-800">₹{Number(invoice.totalGst).toFixed(2)}</span>
                                        </div>
                                        {Number(invoice.depositAmount || 0) > 0 && (
                                            <div className="flex justify-between items-center text-primary-dark text-sm border-t border-slate-200 pt-3">
                                                <span className="font-bold">Deposit Deducted</span>
                                                <span className="font-bold">-₹{Number(invoice.depositAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-red-600 text-sm border-t border-slate-200 pt-3">
                                            <span className="font-bold">Discount</span>
                                            <span className="font-bold">-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 text-white p-5 flex justify-between items-center mt-auto">
                                        <span className="text-sm font-bold uppercase tracking-widest">Grand Total</span>
                                        <span className="text-2xl font-black tabular-nums tracking-tight">₹{Number(invoice.grandTotal).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                                    <span className="font-medium">Total Items Quantity</span>
                                    <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{invoice.items.reduce((acc, item) => acc + item.qty, 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Signature */}
                        <div className="mt-4 pt-4 flex justify-between items-end border-t border-slate-200 footer" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div className="text-[10px] text-slate-500 max-w-[60%] leading-relaxed">
                                <p className="font-bold text-slate-700 mb-1 uppercase tracking-wider">Terms & Conditions:</p>
                                <ol className="list-decimal pl-3 space-y-0.5">
                                    <li>Goods once sold will not be taken back without original bill.</li>
                                    <li>Exchange within 7 days of purchase only for sealed items.</li>
                                    <li>Medicines kept in fridge will not be returned.</li>
                                </ol>
                            </div>
                            <div className="text-center w-48 relative">
                                <div className="h-16 flex items-center justify-center relative opacity-20">
                                </div>
                                <div className="border-t-2 border-slate-300 pt-2 pb-1">
                                    <p className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">Auth. Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Payment Dialog */}
            {showClearPayment && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4 rounded-2xl no-print">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="w-6 h-6 animate-pulse" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">Clear Pharmacy Bill?</h4>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Select the payment method received for this credit bill.</p>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {['CASH', 'UPI', 'CARD', 'TRANSFER'].map(m => (
                                <button
                                    key={m}
                                    disabled={isClearing}
                                    onClick={async () => {
                                        setIsClearing(true);
                                        try {
                                            const res = await clearPharmacyInvoicePayment(invoice.id, m);
                                            if (res.success) {
                                                showToast(`Payment of ₹${invoice.grandTotal} cleared via ${m}`, 'success');
                                                router.refresh();
                                                setShowClearPayment(false);
                                                setTimeout(() => onClose(), 1500);
                                            } else {
                                                showToast(res.error || 'Failed to clear payment', 'error');
                                            }
                                        } catch (error) {
                                            showToast('An unexpected error occurred', 'error');
                                        } finally {
                                            setIsClearing(false);
                                        }
                                    }}
                                    className="py-3 rounded-xl text-xs font-black bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-100 transition-all uppercase flex items-center justify-center gap-1.5"
                                >
                                    {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : m}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={isClearing}
                            onClick={() => setShowClearPayment(false)}
                            className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirm && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4 rounded-2xl no-print">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${showConfirm === 'delete' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">
                                {showConfirm === 'delete' ? 'Delete Bill?' : showConfirm === 'partial' ? 'Return Items?' : 'Return Invoice?'}
                            </h4>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            {showConfirm === 'delete'
                                ? 'This will permanently remove the invoice and restore stock. This action cannot be undone.'
                                : showConfirm === 'partial'
                                    ? `You are returning ${selectedItems.length} selected item(s). The invoice totals will be adjusted.`
                                    : 'This will mark the entire invoice as returned and restore all stock.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowConfirm(null); setSelectedItems([]); }}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm uppercase tracking-wide"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showConfirm === 'delete' ? handleDelete : handleReturn}
                                disabled={isDeleting || isReturning}
                                className={`flex-1 py-3 text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${showConfirm === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                            >
                                {(isDeleting || isReturning) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    showConfirm === 'delete' ? 'Delete Bill' : showConfirm === 'partial' ? 'Return Selected' : 'Confirm Return'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Discount Modal */}
            {showDiscountModal && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4 rounded-2xl no-print">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <Tag className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">Apply Bill Discount</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Bill No: {invoice.billNo}</p>
                            </div>
                        </div>

                        {/* Discount Type Selector */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                            <button
                                type="button"
                                onClick={() => { setDiscountType('PERCENT'); setDiscountVal(''); }}
                                className={cn(
                                    "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                                    discountType === 'PERCENT' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Percentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setDiscountType('FLAT'); setDiscountVal(''); }}
                                className={cn(
                                    "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                                    discountType === 'FLAT' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                Flat Amount (₹)
                            </button>
                        </div>

                        {/* Input Value */}
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                {discountType === 'PERCENT' ? 'Discount Rate (%)' : 'Discount Amount (₹)'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max={discountType === 'PERCENT' ? '100' : totalBeforeDiscount}
                                    step="any"
                                    value={discountVal}
                                    onChange={e => setDiscountVal(e.target.value)}
                                    placeholder={discountType === 'PERCENT' ? 'e.g. 10' : 'e.g. 150'}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                    {discountType === 'PERCENT' ? '%' : '₹'}
                                </span>
                            </div>
                        </div>

                        {/* Totals Breakdown Preview */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 mb-6">
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Bill Subtotal</span>
                                <span className="font-bold">₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Total GST</span>
                                <span className="font-bold">₹{totalGst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-600 font-bold border-t border-slate-200/60 pt-2">
                                <span>Discount {discountType === 'PERCENT' && discountVal ? `(${discountVal}%)` : ''}</span>
                                <span>-₹{computedDiscountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800 text-sm font-black border-t border-slate-200 pt-2">
                                <span>New Grand Total</span>
                                <span>₹{previewGrandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                disabled={isSavingDiscount}
                                onClick={() => setShowDiscountModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm uppercase tracking-wide disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSavingDiscount}
                                onClick={handleSaveDiscount}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSavingDiscount ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Apply'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={cn(
                    "absolute top-4 left-1/2 -translate-x-1/2 z-[2000] px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-2 font-bold text-sm",
                    toast.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    {toast.message}
                </div>
            )}
        </div>,
        document.body
    );
}
