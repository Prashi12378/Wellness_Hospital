'use client';

import React, { useRef } from 'react';
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

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 invoice-modal-overlay">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col invoice-modal-container">
                {/* Modal Header */}
                <div className="p-4 border-b flex items-center justify-between no-print">
                    <h3 className="text-lg font-bold">Invoice Preview</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            Print Invoice
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
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
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                height: 100vh !important;
                                overflow: hidden !important;
                                -webkit-print-color-adjust: exact;
                            }
                            body * {
                                visibility: hidden;
                            }
                            .invoice-modal-overlay,
                            .invoice-modal-overlay *,
                            .invoice-modal-container,
                            .invoice-modal-container *,
                            #print-area,
                            #print-area * {
                                visibility: visible !important;
                            }
                            .invoice-modal-overlay {
                                position: fixed !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: 100% !important;
                                height: 100% !important;
                                z-index: 99999 !important;
                                background: white !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                display: block !important;
                            }
                            .invoice-modal-container {
                                width: 100% !important;
                                height: 100% !important;
                                max-width: none !important;
                                max-height: none !important;
                                border: none !important;
                                box-shadow: none !important;
                                padding: 0 !important;
                                margin: 0 !important;
                            }
                            #print-area {
                                width: 148mm !important;
                                height: 210mm !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                overflow: hidden !important;
                            }
                            .no-print { display: none !important; }
                            
                            /* Ensure content fits exactly on A5 / Half-A4 */
                            .invoice-container {
                                border: none !important;
                                box-shadow: none !important;
                                width: 148mm !important;
                                height: 210mm !important;
                                padding: 8mm !important;
                                margin: 0 !important;
                                display: flex;
                                flex-direction: column;
                            }
                            
                            /* Adjust font sizes for smaller paper */
                            h1 { font-size: 14pt !important; }
                            h2 { font-size: 12pt !important; }
                            p, span, td, th { font-size: 8pt !important; line-height: 1.2 !important; }
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
}
