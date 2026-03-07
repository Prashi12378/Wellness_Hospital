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
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [showConfirm, setShowConfirm] = useState<'delete' | 'return' | 'partial' | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const router = useRouter();

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
        try {
            const result = await deleteInvoice(invoice.id);
            if (result.success) {
                alert('Invoice deleted successfully');
                onClose();
                router.refresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to delete invoice');
        } finally {
            setIsDeleting(false);
            setShowConfirm(null);
        }
    };

    const handleReturn = async () => {
        setIsReturning(true);
        try {
            let result;
            if (showConfirm === 'partial') {
                result = await returnInvoiceItems(invoice.id, selectedItems);
            } else {
                result = await returnInvoice(invoice.id);
            }

            if (result.success) {
                alert(showConfirm === 'partial' ? 'Selected items returned' : 'Invoice returned successfully');
                onClose();
                router.refresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to return invoice');
        } finally {
            setIsReturning(false);
            setShowConfirm(null);
            setSelectedItems([]);
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
                padding: 10mm;
                font-family: system-ui, -apple-system, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .invoice-container {
                width: 100%;
                color: #1e293b;
            }
            .no-print { display: none !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .border-slate-900 { border-color: #0f172a !important; }
            .font-black { font-weight: 900 !important; }
            .font-bold { font-weight: 700 !important; }
            .uppercase { text-transform: uppercase !important; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px; border-bottom: 1px solid #e2e8f0; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
            .patient-info { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 11px; }
            .totals-container { margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 10px; }
            .grand-total { font-size: 14px; font-weight: 900; margin-top: 8px; border-top: 1px solid #0f172a; padding-top: 4px; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; }
            .qr-code { width: 60px; height: 60px; border: 1px solid #e2e8f0; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; width: 60%; z-index: -1; }
            .gst-table { font-size: 9px; margin-top: 10px; }
            .gst-table th, .gst-table td { border: 1px solid #e2e8f0; text-align: center; }
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
                        {invoice.status !== 'RETURNED' && (
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
                                    {invoice.status !== 'RETURNED' && <th className="py-1 px-1 text-left w-6 no-print item-checkbox"></th>}
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
                            <tbody className="divide-y divide-slate-200">
                                {invoice.items.map((item: any, idx: number) => (
                                    <tr key={idx} className={cn(
                                        "hover:bg-slate-50 transition-colors",
                                        selectedItems.includes(item.id) && "bg-amber-50"
                                    )}>
                                        {invoice.status !== 'RETURNED' && (
                                            <td className="py-1.5 px-1 no-print item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 transition-all cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="py-1.5 px-1 text-slate-500">{idx + 1}</td>
                                        <td className="py-1.5 px-1 font-bold">{item.name}</td>
                                        <td className="py-1.5 px-1 text-slate-500 uppercase">{item.hsnCode}</td>
                                        <td className="py-1.5 px-1 text-center font-bold">{item.qty}</td>
                                        <td className="py-1.5 px-1 text-right uppercase text-slate-600 font-medium">{item.batchNo}</td>
                                        <td className="py-1.5 px-1 text-right">₹{Number(item.mrp).toFixed(2)}</td>
                                        <td className="py-1.5 px-1 text-right">{item.gstRate}%</td>
                                        <td className="py-1.5 px-1 text-right font-black">₹{Number(item.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary Totals */}
                        <div className="flex justify-between items-start totals-container">
                            <div className="w-1/2">
                                <h3 className="text-[9px] font-black uppercase tracking-wider mb-2 border-b-2 border-slate-900 inline-block">GST Analysis</h3>
                                <table className="w-full text-center gst-table">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="py-1">Rate</th>
                                            <th className="py-1">Taxable Amt</th>
                                            <th className="py-1">CGST</th>
                                            <th className="py-1">SGST</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium border border-slate-200">
                                        {Object.entries(gstGroups).map(([rate, vals]: [string, any]) => (
                                            <tr key={rate}>
                                                <td className="py-1 font-bold">{rate}%</td>
                                                <td className="py-1">₹{vals.taxable.toFixed(2)}</td>
                                                <td className="py-1">₹{vals.cgst.toFixed(2)}</td>
                                                <td className="py-1">₹{vals.sgst.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 text-[9px] text-slate-500 italic">
                                    <p>Note: MRP is inclusive of all taxes (GST).</p>
                                    <p>Method of Payment: {invoice.paymentMethod}</p>
                                </div>
                            </div>
                            <div className="w-1/3 space-y-1.5 text-right font-medium">
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="uppercase text-slate-500 font-bold">Sub total:</span>
                                    <span className="font-bold">₹{Number(invoice.subTotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="uppercase text-slate-500 font-bold">Total GST:</span>
                                    <span className="font-bold">₹{Number(invoice.totalGst).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 border-b border-slate-100 pb-1">
                                    <span className="uppercase font-bold">Discount:</span>
                                    <span className="font-bold">-₹{Number(invoice.discountAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between bg-slate-900 text-white p-2 rounded grand-total">
                                    <span className="uppercase text-[10px] font-black">Grand Total:</span>
                                    <span className="text-sm font-black tracking-tight">₹{Number(invoice.grandTotal).toFixed(2)}</span>
                                </div>
                                <div className="pt-2 text-[10px] text-slate-400 font-bold flex justify-between uppercase">
                                    <span>Quantity:</span>
                                    <span>{invoice.items.reduce((acc, item) => acc + item.qty, 0)} Items</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Signature */}
                        <div className="mt-12 flex justify-between items-end footer">
                            <div className="text-center w-32 border-t border-slate-900 pt-2">
                                <p className="font-bold uppercase">Customer Sign</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 qr-code mx-auto mb-2 flex items-center justify-center bg-slate-50 text-[10px] text-slate-300">
                                    QR CODE
                                </div>
                                <p className="text-[8px] font-bold text-slate-400">Scan to Verify</p>
                            </div>
                            <div className="text-center w-40 border-t border-slate-900 pt-6 relative">
                                <p className="font-black italic text-slate-400 text-[10px] absolute top-1 left-0 w-full text-center pointer-events-none opacity-20">Pharmacist Seal</p>
                                <p className="font-bold uppercase">Auth. Pharmacist</p>
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
            </div>
        </div>,
        document.body
    );
}
