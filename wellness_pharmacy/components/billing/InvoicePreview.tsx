'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { format } from 'date-fns';
import { Printer, Trash2, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { deleteInvoice, returnInvoice, returnInvoiceItems } from '@/app/actions/billing';
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
    readOnly?: boolean;
}

export default function InvoicePreview({ invoice, onClose, readOnly = false }: InvoicePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [showConfirm, setShowConfirm] = useState<'delete' | 'return' | 'partial' | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
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

        // 1. Create a hidden iframe — completely isolated from modal layout constraints
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:148mm;height:297mm;border:none;visibility:hidden;';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) { document.body.removeChild(iframe); return; }

        // 2. Build print styles specialized for A5
        const styles = `
            @page { 
                size: A5 portrait; 
                margin: 0; 
            }
            body { 
                margin: 0; 
                padding: 8mm;
                font-family: 'Inter', system-ui, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-size: 10px;
            }
            .invoice-container { width: 100%; color: #0f172a; }
            .no-print { display: none !important; }
            
            .header-info { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
            .header-left { display: flex; align-items: center; gap: 12px; }
            .header-logo { width: 50px !important; height: 50px !important; }
            .header-logo img { width: 50px !important; height: 50px !important; object-fit: contain !important; }
            .hospital-details h1 { font-size: 16px; font-weight: 900; margin: 0; text-transform: uppercase; }
            .hospital-details p { font-size: 8px; color: #475569; margin: 1px 0; line-height: 1.1; }
            .gstin { font-weight: 900; font-size: 10px; margin-top: 3px; }
            .header-right { text-align: right; }
            .header-right h1 { font-size: 18px; font-weight: 900; margin: 0 0 4px 0; text-transform: uppercase; }
            .meta-info { font-size: 10px; font-weight: 700; }
            
            .patient-grid { display: grid; grid-template-cols: auto 1fr auto 1fr; gap: 8px 15px; margin-bottom: 20px; }
            .info-label { font-weight: 900; text-transform: uppercase; font-size: 11px; }
            .info-value { border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 11px; }
            
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .items-table thead { background-color: #0f172a !important; color: white !important; }
            .items-table th { padding: 6px 4px; font-size: 9px; text-transform: uppercase; border: 1px solid #0f172a; font-weight: 900; }
            .items-table td { padding: 5px 4px; font-size: 10px; border: 1px solid #e2e8f0; }
            
            .summary-container { display: flex; justify-content: space-between; margin-top: 20px; }
            .gst-analysis { width: 50%; }
            .gst-table { width: 100%; border-collapse: collapse; font-size: 8px; border: 1px solid #e2e8f0; }
            .gst-table th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px; font-weight: 900; }
            .gst-table td { border: 1px solid #e2e8f0; padding: 4px; font-weight: 700; }
            
            .totals-section { width: 40%; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; font-weight: 700; }
            .discount-label, .discount-value { color: #dc2626 !important; font-weight: 900; }
            .grand-total-box { background-color: #0f172a !important; color: white !important; padding: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
            .grand-total-label { font-size: 10px; font-weight: 900; text-transform: uppercase; }
            .grand-total-value { font-size: 16px; font-weight: 900; }
            
            .footer-hr { border: none; border-top: 2px solid #0f172a; margin: 30px 0 5px 0; }
            .seal-text { text-align: center; color: #94a3b8; font-style: italic; font-size: 8px; margin-bottom: 2px; }
            .auth-text { text-align: center; font-weight: 900; font-size: 11px; text-transform: uppercase; }
        `;

        // 3. Clone and Clean HTML
        const clonedInvoice = invoiceEl.cloneNode(true) as HTMLElement;
        clonedInvoice.querySelectorAll('.no-print').forEach(el => el.remove());
        // Remove checkboxes from printed version
        clonedInvoice.querySelectorAll('.item-checkbox').forEach(el => el.remove());

        iframeDoc.write('<html><head><title>Print Invoice</title><style>' + styles + '</style></head><body>');
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

                {/* Print Area — designed for A5 pixel-perfect layout */}
                <div ref={printRef} className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50" id="print-area">
                    <div className="invoice-container bg-white shadow-xl mx-auto p-6 sm:p-10 border border-slate-200 relative overflow-hidden max-w-[148mm] min-h-[200mm]">
                        {/* Header Section */}
                        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-8 header-info">
                            <div className="flex items-center gap-5 header-left">
                                <div className="w-16 h-16 relative flex-shrink-0 header-logo">
                                    <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" />
                                </div>
                                <div className="hospital-details">
                                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 border-none p-0 m-0">Wellness Hospital & Pharmacy</h1>
                                    <p className="text-[10px] leading-tight text-slate-600 mt-1">
                                        Beside friend function hall, Gowribidnur main road, Palanjoghalli,<br />
                                        Doddaballapur - 561203, Karnataka, India<br />
                                        Ph: +91 6366662245 | wellnesshospital8383@gmail.com
                                    </p>
                                    <p className="text-xs font-black text-slate-900 mt-2 gstin">GSTIN: {invoice.gstin}</p>
                                </div>
                            </div>
                            <div className="text-right header-right">
                                <h1 className="text-2xl font-black uppercase text-slate-900 mb-1">GST INVOICE</h1>
                                <div className="text-sm font-bold text-slate-700 space-y-0.5 meta-info">
                                    <p>Bill No : <span className="font-black text-slate-900">{invoice.billNo}</span></p>
                                    <p>Date : <span className="font-black text-slate-900">{format(new Date(invoice.date), 'dd-MM-yy')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Information Grid */}
                        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-10 gap-y-4 mb-8 px-2 patient-grid align-baseline">
                            <span className="info-label font-black text-slate-900">Patient:</span>
                            <span className="info-value text-slate-800 font-semibold border-b border-slate-200">{invoice.patientName}</span>

                            <span className="info-label font-black text-slate-900">IP NO:</span>
                            <span className="info-value text-slate-800 font-semibold border-b border-slate-200">{invoice.insuranceNo || 'N/A'}</span>

                            <span className="info-label font-black text-slate-900">Doctor:</span>
                            <span className="info-value text-slate-800 font-semibold border-b border-slate-200">{invoice.doctorName || 'self'}</span>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8 border border-slate-200 rounded-sm overflow-hidden">
                            <table className="w-full border-collapse items-table">
                                <thead className="bg-[#0f172a] text-white print:bg-[#0f172a] print:text-white">
                                    <tr className="border-b border-slate-900">
                                        {!readOnly && invoice.status !== 'RETURNED' && <th className="py-2 px-1 text-left w-6 no-print item-checkbox"></th>}
                                        <th className="py-2.5 px-2 text-center text-[11px] font-black tracking-wider w-12 border-r border-slate-700">S.No</th>
                                        <th className="py-2.5 px-3 text-left text-[11px] font-black tracking-wider border-r border-slate-700">Item Name</th>
                                        <th className="py-2.5 px-2 text-center text-[11px] font-black tracking-wider border-r border-slate-700">Hsn Code</th>
                                        <th className="py-2.5 px-2 text-center text-[11px] font-black tracking-wider border-r border-slate-700">Qty</th>
                                        <th className="py-2.5 px-2 text-center text-[11px] font-black tracking-wider border-r border-slate-700">Batch</th>
                                        <th className="py-2.5 px-3 text-right text-[11px] font-black tracking-wider border-r border-slate-700">MRP</th>
                                        <th className="py-2.5 px-2 text-center text-[11px] font-black tracking-wider border-r border-slate-700">GST%</th>
                                        <th className="py-2.5 px-3 text-right text-[11px] font-black tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px]">
                                    {invoice.items.map((item: any, idx: number) => (
                                        <tr key={idx} className={cn(
                                            "border-b border-slate-100 last:border-none",
                                            !readOnly && selectedItems.includes(item.id) && "bg-amber-50"
                                        )}>
                                            {!readOnly && invoice.status !== 'RETURNED' && (
                                                <td className="py-2 px-1 no-print item-checkbox text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => toggleItemSelection(item.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-all cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="py-2.5 px-2 text-center font-bold text-slate-500 border-r border-slate-100">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-black text-slate-900 border-r border-slate-100">{item.name}</td>
                                            <td className="py-2.5 px-2 text-center font-medium text-slate-500 uppercase border-r border-slate-100">{item.hsnCode}</td>
                                            <td className="py-2.5 px-2 text-center font-black text-slate-900 border-r border-slate-100">{item.qty}</td>
                                            <td className="py-2.5 px-2 text-center font-semibold text-slate-600 border-r border-slate-100 uppercase">{item.batchNo}</td>
                                            <td className="py-2.5 px-3 text-right font-bold text-slate-700 border-r border-slate-100">₹{Number(item.mrp).toFixed(2)}</td>
                                            <td className="py-2.5 px-2 text-center font-bold text-slate-600 border-r border-slate-100">{item.gstRate}%</td>
                                            <td className="py-2.5 px-3 text-right font-black text-slate-900">₹{Number(item.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="flex justify-between items-start mb-10 summary-container">
                            <div className="w-[45%] gst-analysis">
                                <h3 className="text-[11px] font-black uppercase mb-3 underline underline-offset-4 decoration-2">GST Analysis</h3>
                                <table className="w-full text-center border border-slate-100 text-[10px] gst-table font-bold">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="text-slate-500 uppercase">
                                            <th className="py-2 border-r border-slate-200">Rate</th>
                                            <th className="py-2 border-r border-slate-200">Taxable Amt</th>
                                            <th className="py-2 border-r border-slate-200">CGST</th>
                                            <th className="py-2 font-bold">SGST</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(gstGroups).map(([rate, vals]: [string, any]) => (
                                            <tr key={rate} className="border-b border-slate-100 last:border-none">
                                                <td className="py-2 font-black border-r border-slate-100">{rate}%</td>
                                                <td className="py-2 border-r border-slate-100">₹{vals.taxable.toFixed(2)}</td>
                                                <td className="py-2 border-r border-slate-100">₹{vals.cgst.toFixed(2)}</td>
                                                <td className="py-2">₹{vals.sgst.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-5 text-[10px] text-slate-500 italic space-y-1">
                                    <p>Note: MRP is inclusive of all taxes (GST).</p>
                                    <p>Method of Payment: <span className="font-bold text-slate-700">{invoice.paymentMethod}</span></p>
                                </div>
                            </div>

                            <div className="w-[40%] space-y-2 totals-section">
                                <div className="flex justify-between items-center px-2 total-row">
                                    <span className="uppercase text-slate-500 font-bold">Sub Total:</span>
                                    <span className="font-black text-slate-900 text-base">₹{Number(invoice.subTotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center px-2 total-row">
                                    <span className="uppercase text-slate-500 font-bold">Total GST:</span>
                                    <span className="font-black text-slate-900 text-base">₹{Number(invoice.totalGst).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center px-2 total-row text-red-600">
                                    <span className="uppercase font-black discount-label">Discount:</span>
                                    <span className="font-black text-base discount-value">-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                                </div>

                                <div className="bg-[#0f172a] print:bg-[#0f172a] text-white p-4 rounded-md shadow-lg flex justify-between items-center mt-4 grand-total-box">
                                    <span className="uppercase text-xs font-black grand-total-label">Grand Total:</span>
                                    <span className="text-2xl font-black grand-total-value">₹{Number(invoice.grandTotal).toFixed(2)}</span>
                                </div>

                                <div className="pt-3 px-2 flex justify-between items-center">
                                    <span className="uppercase text-[11px] font-bold text-slate-400">Quantity:</span>
                                    <span className="text-[11px] font-black text-slate-500">{invoice.items.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="mt-auto pt-10">
                            <hr className="footer-hr border-t-2 border-slate-900 mb-2" />
                            <div className="text-center space-y-1">
                                <p className="text-[10px] text-slate-300 italic font-medium seal-text">Pharmacist Seal</p>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest auth-text">Auth. Pharmacist</p>
                            </div>
                        </div>
                    </div>
                </div>

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
            </div>
        </div>,
        document.body
    );
}
