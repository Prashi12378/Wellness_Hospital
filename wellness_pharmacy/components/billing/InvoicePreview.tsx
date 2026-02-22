'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

interface InvoicePreviewProps {
    invoice: {
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
        items: any[];
    };
    onClose: () => void;
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const handlePrint = () => {
        window.print();
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

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 invoice-modal-overlay">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col invoice-modal-container relative">
                {/* Modal Header */}
                <div className="p-4 border-b flex items-center justify-between no-print">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold">Invoice Preview</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pharmacy Billing System</p>
                    </div>
                    <div className="flex gap-2">
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

                {/* Print Area */}
                <div ref={printRef} className="flex-1 overflow-auto p-8 bg-white print:p-0 print:overflow-visible" id="print-area">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                size: A5 portrait;
                                margin: 0;
                            }
                            
                            /* 1. HIDE ALL BACKGROUND CONTENT */
                            /* We target every direct child of body except our modal portal */
                            body > *:not(.invoice-modal-overlay) {
                                display: none !important;
                            }

                            /* 2. RESET BODY FOR PRINT */
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                height: auto !important;
                                width: 148mm !important; /* Force A5 Width */
                                min-height: 100% !important;
                                background: white !important;
                                overflow: visible !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }

                            /* 3. POSITION MODAL FOR PRINT */
                            .invoice-modal-overlay {
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: 100% !important;
                                display: block !important;
                                background: white !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                z-index: auto !important;
                            }

                            .invoice-modal-container {
                                width: 100% !important;
                                border: none !important;
                                border-radius: 0 !important;
                                box-shadow: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                display: block !important;
                            }

                            #print-area {
                                padding: 0 !important;
                                margin: 0 !important;
                                width: 100% !important;
                                display: block !important;
                            }

                            .no-print {
                                display: none !important;
                            }

                            /* 4. INVOICE LAYOUT FIXES */
                            .invoice-container {
                                width: 148mm !important;
                                height: auto !important; /* Let it flow naturally */
                                min-height: 210mm !important;
                                padding: 10mm !important;
                                margin: 0 !important;
                                border: none !important;
                                box-shadow: none !important;
                                background: white !important;
                            }

                            /* Table Print Optimizations */
                            table {
                                page-break-inside: auto !important;
                            }
                            tr {
                                page-break-inside: avoid !important;
                                page-break-after: auto !important;
                            }
                            thead {
                                display: table-header-group !important;
                            }

                            /* Font Scaling for A5 */
                            h1 { font-size: 14pt !important; }
                            h2 { font-size: 12pt !important; }
                            p, span, td, th { font-size: 8pt !important; }
                            .tax-table th, .tax-table td { font-size: 7pt !important; }
                        }
                    `}} />

                    {/* Invoice Paper Design */}
                    <div className="invoice-container max-w-[800px] mx-auto text-slate-800 font-sans border border-slate-200 p-8 shadow-sm print:border-none print:shadow-none bg-white">
                        {/* Hospital Header */}
                        <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 relative grayscale print:grayscale-0">
                                    <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Wellness Hospital & Pharmacy</h1>
                                    <p className="text-[10px] leading-tight max-w-[400px]">
                                        Beside friend function hall, Gowribidnur main road, Palanjoghalli,<br />
                                        Doddaballapur - 561203, Karnataka, India<br />
                                        Ph: 8105666338 | Email: wellnesshospital8383@gmail.com
                                    </p>
                                    <p className="text-xs font-bold mt-1">GSTIN: {invoice.gstin}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold uppercase mb-1">GST Invoice</h2>
                                <div className="text-4xl font-black text-slate-400 opacity-20 select-none">24/7</div>
                                <div className="mt-4 text-sm font-medium">
                                    <p>Bill No : <span className="font-bold">{invoice.billNo}</span></p>
                                    <p>Date : <span className="font-bold">{format(new Date(invoice.date), 'dd-MM-yy')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-6 text-sm">
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
                        <table className="w-full border-collapse mb-8 text-xs">
                            <thead className="bg-slate-50 border-y-2 border-slate-900">
                                <tr>
                                    <th className="py-2 px-2 text-left w-10">S.No</th>
                                    <th className="py-2 px-2 text-left">Item Name</th>
                                    <th className="py-2 px-2 text-left">Hsn Code</th>
                                    <th className="py-2 px-2 text-center w-10">Qty</th>
                                    <th className="py-2 px-2 text-right">Batch</th>
                                    <th className="py-2 px-2 text-right">MRP</th>
                                    <th className="py-2 px-2 text-right">GST%</th>
                                    <th className="py-2 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200">
                                        <td className="py-2 px-2">{index + 1}</td>
                                        <td className="py-2 px-2 font-bold">{item.name}</td>
                                        <td className="py-2 px-2">{item.hsnCode}</td>
                                        <td className="py-2 px-2 text-center">{item.qty}</td>
                                        <td className="py-2 px-2 uppercase text-right">{item.batchNo}</td>
                                        <td className="py-2 px-2 text-right">{Number(item.mrp).toFixed(2)}</td>
                                        <td className="py-2 px-2 text-right">{item.gstRate}</td>
                                        <td className="py-2 px-2 text-right font-bold">{Number(item.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Section */}
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            {/* Tax Summary Table */}
                            <div>
                                <table className="tax-table w-full text-[10px] border border-slate-300">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-300">
                                            <th className="px-1 py-1 text-left">TAX</th>
                                            <th className="px-1 py-1 text-right">TAXABLE</th>
                                            <th className="px-1 py-1 text-right">CGST</th>
                                            <th className="px-1 py-1 text-right">SGST</th>
                                            <th className="px-1 py-1 text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(taxGroups).map(([rate, vals]: [string, any]) => (
                                            <tr key={rate} className="border-b border-slate-200">
                                                <td className="px-1 py-1 font-bold">{rate}%</td>
                                                <td className="px-1 py-1 text-right">{vals.taxable.toFixed(2)}</td>
                                                <td className="px-1 py-1 text-right">{vals.cgst.toFixed(2)}</td>
                                                <td className="px-1 py-1 text-right">{vals.sgst.toFixed(2)}</td>
                                                <td className="px-1 py-1 text-right font-bold">{vals.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 text-[10px] leading-tight opacity-70">
                                    <p>1. All Major Credit / Debit Cards / Digital Payments accepted.</p>
                                    <p>2. E & O E Goods Once Sold Cannot Be Taken Back Or Exchanged.</p>
                                </div>
                            </div>

                            {/* Totals & Signature */}
                            <div className="flex flex-col items-end">
                                <div className="w-full space-y-1 text-sm border-t-2 border-slate-900 pt-2 mb-8">
                                    <div className="flex justify-between">
                                        <span>Sub Total :</span>
                                        <span className="font-bold">{invoice.subTotal.toFixed(2)}</span>
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
                                    <div className="flex justify-between text-2xl font-black mt-4 border-t border-slate-200 pt-2">
                                        <span>Total :</span>
                                        <span>₹{invoice.grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-2 uppercase">
                                        <span>Mode :</span>
                                        <span>{invoice.paymentMethod}</span>
                                    </div>
                                </div>

                                <div className="text-center mt-auto w-full max-w-[200px]">
                                    <div className="h-12 border-b border-slate-400 mb-2 italic text-slate-300 pointer-events-none">
                                        {/* Signature Placeholder */}
                                    </div>
                                    <p className="text-xs font-bold uppercase">Signature</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Registered Pharmacist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
