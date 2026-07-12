'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getInvoiceById } from '@/app/actions/billing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function UniversalInvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState<any>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            const res = await getInvoiceById(id);
            if (res.success && res.invoice) {
                setInvoice(res.invoice);
            }
            setLoading(false);
        };
        fetchInvoice();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving Invoice...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center bg-slate-50">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-800">Invoice Not Found</h2>
                <p className="text-slate-500 mt-2">The requested invoice ID does not exist or has been deleted.</p>
                <button onClick={() => router.back()} className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                    Go Back
                </button>
            </div>
        );
    }

    // Determine invoice type/title
    let title = "TAX INVOICE";
    let typeLabel = "Hospital Bill";
    const billNo = invoice.billNo || "";
    if (billNo.startsWith("OPD-")) {
        title = "OPD CONSULTATION RECEIPT";
        typeLabel = "OPD Consultation";
    } else if (billNo.startsWith("OBS-")) {
        title = "OBSERVATION INVOICE";
        typeLabel = "Observation Service";
    } else if (billNo.startsWith("IPD-") || billNo.startsWith("INV-IPD-")) {
        title = "IPD FINAL BILL";
        typeLabel = "In-Patient Department";
    } else if (billNo.startsWith("S-")) {
        title = "PHARMACY INVOICE";
        typeLabel = "Pharmacy Sale";
    } else if (billNo.startsWith("LAB-") || billNo.startsWith("LAB/")) {
        title = "LABORATORY RECEIPT";
        typeLabel = "Laboratory Diagnostics";
    }

    const items = invoice.items || [];
    const total = invoice.grandTotal ?? 0;
    const dateStr = invoice.date ? format(new Date(invoice.date), 'dd MMM yyyy, hh:mm a') : format(new Date(invoice.createdAt), 'dd MMM yyyy, hh:mm a');

    // Get patient and doctor details from relations if available, falling back to top-level fields
    const patientName = invoice.patientName || (invoice.Appointment?.patient ? `${invoice.Appointment.patient.firstName} ${invoice.Appointment.patient.lastName}` : (invoice.admission?.patient ? `${invoice.admission.patient.firstName} ${invoice.admission.patient.lastName}` : "Walk-in Patient"));
    const patientPhone = invoice.patientPhone || invoice.Appointment?.patient?.phone || invoice.admission?.patient?.phone || "N/A";
    const uhid = invoice.Appointment?.patient?.uhid || invoice.admission?.patient?.uhid || "N/A";
    const doctorName = invoice.doctorName || (invoice.Appointment?.doctor ? `${invoice.Appointment.doctor.firstName} ${invoice.Appointment.doctor.lastName}` : (invoice.admission?.primaryDoctor ? `${invoice.admission.primaryDoctor.firstName} ${invoice.admission.primaryDoctor.lastName}` : "Self / Walk-in"));

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0" id="invoice-overlay">
            {/* Action Bar */}
            <div className="max-w-[800px] mx-auto mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Printer className="w-5 h-5" /> Print Invoice
                </button>
            </div>

            {/* Print Styles inline targeting overlay container */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: A4;
                        margin: 0 !important; 
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        background: white !important;
                    }
                    body > *:not(#invoice-overlay) {
                        display: none !important;
                    }
                    #invoice-overlay {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #print-invoice-container {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        display: block !important;
                        border: none !important;
                    }
                    #print-invoice {
                        width: 100% !important;
                        padding: 20mm !important;
                        box-sizing: border-box !important;
                        background: white !important;
                        display: block !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            ` }} />

            {/* Invoice Document Wrapper */}
            <div id="print-invoice-container" className="max-w-[800px] mx-auto relative bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                {/* Watermark Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04] select-none print:opacity-[0.06] z-0">
                    <img src="/logo.png" alt="Watermark" className="w-[450px] h-[450px] object-contain" />
                </div>

                <div className="p-12 print:p-8 relative z-10 flex flex-col min-h-[900px]" id="print-invoice">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                        <div className="flex gap-5 items-start">
                            <img src="/logo.png" alt="Hospital Logo" className="w-20 h-20 object-contain rounded-2xl" />
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">WELLNESS HOSPITAL</h1>
                                <p className="text-slate-600 text-[11px] font-semibold max-w-sm leading-relaxed uppercase tracking-wide">
                                    Beside friend function hall, Gowribidnur main road,<br />
                                    Palanjoghalli, Doddaballapur - 561203<br />
                                    <span className="text-primary font-black mt-1 block">PH: 8105666338 | wellnesshospital8383@gmail.com</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest mb-4">
                                {title}
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Bill Number</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{billNo}</p>
                            <p className="text-slate-500 text-xs font-medium mt-1">{dateStr}</p>
                        </div>
                    </div>

                    {/* Patient & Invoice Meta */}
                    <div className="grid grid-cols-3 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8 print:bg-transparent print:p-0 print:border-0">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                            <p className="font-bold text-slate-800 text-lg leading-tight uppercase">{patientName}</p>
                            <p className="text-[10px] font-semibold text-slate-500">UHID: {uhid} · Ph: {patientPhone}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Doctor</p>
                            <p className="font-bold text-slate-800 text-lg leading-tight">
                                {doctorName.toLowerCase().includes('dr') ? doctorName : `Dr. ${doctorName}`}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-lg leading-tight">{invoice.paymentMethod}</span>
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                                    invoice.status === 'PAID' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                )}>
                                    {invoice.status === 'PAID' ? <><CheckCircle2 className="w-2.5 h-2.5" /> PAID</> : 'UNPAID'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ward / Hours Details if OBS or IPD */}
                    {(invoice.ward || invoice.observationHours) && (
                        <div className="mb-8 p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl flex justify-between text-sm print:bg-white print:border-slate-200">
                            {invoice.ward && (
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Ward / Bed Room</span>
                                    <span className="font-bold text-slate-800 uppercase">{invoice.ward}</span>
                                </div>
                            )}
                            {invoice.observationHours && (
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Observation Period</span>
                                    <span className="font-bold text-slate-800 uppercase">{invoice.observationHours} Hours</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="flex-1 mb-12">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="border-y-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    <th className="py-3.5 px-3 w-16">S.No</th>
                                    <th className="py-3.5 px-3">Description of Services / Medicine Items</th>
                                    <th className="py-3.5 px-3 text-center w-24">Quantity</th>
                                    <th className="py-3.5 px-3 text-right w-32">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item: any, idx: number) => (
                                    <tr key={item.id || idx} className="text-sm text-slate-800">
                                        <td className="py-4 px-3 font-bold text-slate-500">{idx + 1}</td>
                                        <td className="py-4 px-3 font-black uppercase tracking-tight">{item.name}</td>
                                        <td className="py-4 px-3 text-center font-bold text-slate-600">{item.qty || 1}</td>
                                        <td className="py-4 px-3 text-right font-black text-lg">₹{Number(item.amount || item.mrp * (item.qty || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 italic font-medium">No items charged on this bill.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="grid grid-cols-2 gap-12 mt-auto font-sans print:break-inside-avoid">
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl print:bg-white print:border-slate-300">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase mb-2">Terms & Conditions:</h4>
                                <ul className="space-y-1.5 text-[9px] font-semibold text-slate-500 leading-relaxed">
                                    <li>• This is a computer generated invoice and does not require a physical signature.</li>
                                    <li>• Fees once paid are non-refundable.</li>
                                    <li>• Please retain this receipt for future medical follow-ups.</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-slate-900 text-white rounded-2xl print:bg-white print:text-slate-900 print:border-2 print:border-slate-900 text-center">
                                <p className="text-[11px] font-black uppercase tracking-widest">Wellness Hospital Management</p>
                                <p className="text-[9px] font-medium text-slate-300 print:text-slate-600 mt-0.5">Thank you for choosing Wellness. Get Well Soon!</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sub Total</span>
                                    <span className="text-base font-bold text-slate-900">₹{Number(invoice.subTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {Number(invoice.discountAmount) > 0 && (
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">Discount</span>
                                        <span className="text-base font-bold text-red-500">-₹{Number(invoice.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {Number(invoice.depositAmount) > 0 && (
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Advance Deducted</span>
                                        <span className="text-base font-bold text-blue-500">-₹{Number(invoice.depositAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-slate-900 text-slate-900 p-4 rounded-2xl bg-slate-50 print:bg-white print:border-t-2 print:border-slate-900">
                                    <span className="text-lg font-black uppercase tracking-tighter">Grand Total</span>
                                    <span className="text-3xl font-black">₹{Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="pt-10 w-48 border-t border-slate-200 ml-auto">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
