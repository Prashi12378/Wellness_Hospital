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
                                margin: 5mm;
                            }
                            
                            /* 1. HIDE ALL BACKGROUND CONTENT */
                            body > *:not(.invoice-modal-overlay) {
                                display: none !important;
                            }

                            /* 2. RESET BODY & HTML */
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                height: auto !important;
                                width: 100% !important;
                                background: white !important;
                                overflow: visible !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }

                            /* 3. ISOLATE INVOICE MODAL */
                            .invoice-modal-overlay {
                                position: static !important; /* Allow natural page flow */
                                width: 100% !important;
                                display: block !important;
                                background: white !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                overflow: visible !important;
                            }

                            .invoice-modal-container {
                                width: 100% !important;
                                max-width: none !important;
                                max-height: none !important;
                                height: auto !important;
                                border: none !important;
                                border-radius: 0 !important;
                                box-shadow: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                display: block !important;
                                overflow: visible !important;
                            }

                            #print-area {
                                padding: 0 !important;
                                margin: 0 !important;
                                width: 100% !important;
                                display: block !important;
                                overflow: visible !important;
                            }

                            .no-print {
                                display: none !important;
                            }

                            /* 4. COMPACT INVOICE CONTENT */
                            .invoice-container {
                                width: 100% !important;
                                max-width: 148mm !important;
                                margin: 0 auto !important;
                                padding: 5mm !important;
                                border: none !important;
                                box-shadow: none !important;
                                background: white !important;
                                display: block !important;
                                height: auto !important;
                            }

                            /* Fix Table Row Spacing */
                            table tr td, table tr th {
                                padding-top: 4px !important;
                                padding-bottom: 4px !important;
                            }

                            /* Table Pagination */
                            table {
                                width: 100% !important;
                                border-collapse: collapse !important;
                                page-break-inside: auto !important;
                            }
                            tr {
                                page-break-inside: avoid !important;
                                page-break-after: auto !important;
                            }
                            thead {
                                display: table-header-group !important;
                            }

                            /* Footer Fix: Prevent Split */
                            .footer-section {
                                page-break-inside: avoid !important;
                                display: block !important;
                                width: 100% !important;
                            }

                            /* Font Scaling */
                            h1 { font-size: 12pt !important; margin-bottom: 2px !important; }
                            h2 { font-size: 10pt !important; margin-bottom: 2px !important; }
                            p, span, td, th { font-size: 7.5pt !important; line-height: 1.1 !important; }
                            .tax-table th, .tax-table td { font-size: 6.5pt !important; padding: 2px !important; }
                            
                            .header-logo { width: 48px !important; height: 48px !important; }
                            .header-container { margin-bottom: 8px !important; padding-bottom: 8px !important; }
                            .patient-info { margin-bottom: 8px !important; }
                            .items-table { margin-bottom: 8px !important; }
                        }
                    `}} />

                    {/* Invoice Paper Design for A5 */}
                    <div className="invoice-container max-w-[148mm] mx-auto text-slate-800 font-sans border border-slate-200 p-4 sm:p-6 shadow-sm print:border-none print:shadow-none bg-white text-xs">
                        {/* Hospital Header */}
                        <div className="flex justify-between items-start mb-4 border-b-2 border-slate-900 pb-4 header-container">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative grayscale print:grayscale-0 header-logo flex-shrink-0">
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
                                <div className="text-2xl font-black text-slate-400 opacity-20 select-none no-print">24/7</div>
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
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200">
                                        <td className="py-1 px-1">{index + 1}</td>
                                        <td className="py-1 px-1 font-bold">{item.name}</td>
                                        <td className="py-1 px-1">{item.hsnCode}</td>
                                        <td className="py-1 px-1 text-center">{item.qty}</td>
                                        <td className="py-1 px-1 uppercase text-right">{item.batchNo}</td>
                                        <td className="py-1 px-1 text-right">{Number(item.mrp).toFixed(2)}</td>
                                        <td className="py-1 px-1 text-right">{item.gstRate}</td>
                                        <td className="py-1 px-1 text-right font-bold">{Number(item.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Section */}
                        <div className="footer-section pt-4">
                            <div className="flex justify-between items-start gap-8">
                                {/* Tax Summary Table */}
                                <div className="w-1/2">
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
                                        <div className="h-10 border-b border-slate-400 mb-1 italic text-slate-300 pointer-events-none">
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
        </div>
    );

    return createPortal(modalContent, document.body);
}
