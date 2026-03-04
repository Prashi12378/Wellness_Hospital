import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            items: true,
            admission: {
                include: {
                    patient: true,
                    primaryDoctor: true
                }
            }
        }
    });

    if (!invoice) notFound();

    const { admission } = invoice;
    const patient = admission?.patient;
    const doctor = admission?.primaryDoctor;

    return (
        <>
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    html, body {
                        margin: 0 !important; padding: 0 !important;
                        background: white !important;
                        height: auto !important; overflow: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    /* Kill the min-h-screen stretch */
                    .outer-wrapper {
                        min-height: 0 !important;
                        height: auto !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .print-page {
                        padding: 10mm !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    table { page-break-inside: auto !important; break-inside: auto !important; }
                    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
                    thead { display: table-header-group !important; }
                    tfoot { display: table-footer-group !important; }
                    .keep-together { page-break-inside: avoid !important; break-inside: avoid !important; }
                }
            `}} />

            <div className="outer-wrapper min-h-screen bg-slate-100 py-10 px-4">
                {/* Action Bar — hidden in print */}
                <div className="no-print max-w-[800px] mx-auto mb-6 flex justify-between items-center">
                    <Link href="/dashboard/ipd-billing" className="flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Billing
                    </Link>
                    <PrintButton />
                </div>

                {/* Invoice Document */}
                <div className="print-page max-w-[800px] mx-auto bg-white shadow-lg p-10 text-slate-900 font-sans text-sm relative overflow-hidden">

                    {/* Watermark — absolute inside the card only */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.05] print:opacity-[0.06]" style={{ zIndex: 0 }}>
                        <img src="/logo.png" alt="" className="w-[50%] max-w-[400px] object-contain" />
                    </div>

                    <div className="relative" style={{ zIndex: 1 }}>
                        {/* ── HEADER ── */}
                        <div className="text-center border-b-2 border-slate-800 pb-5 mb-5">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
                                <div className="text-left">
                                    <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">Wellness Hospital</h1>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                                Beside friend function hall, Gowribidnur main road, Palanjoghalli, Doddaballapur – 561203, Karnataka, India
                            </p>
                            <p className="text-[10px] text-slate-600">
                                Ph: +91 8105666338 &nbsp;|&nbsp; wellnesshospital8383@gmail.com
                            </p>
                            <p className="text-[10px] font-bold text-slate-700 mt-1">
                                GST No: {invoice.gstin || '29JNVPS4919B2Z5'}
                            </p>
                        </div>

                        {/* ── TITLE ── */}
                        <div className="text-center mb-5">
                            <h2 className="text-base font-black uppercase tracking-[0.2em] border border-slate-800 inline-block px-6 py-1">
                                IPD Invoice
                            </h2>
                        </div>

                        {/* ── PATIENT & BILL INFO ── */}
                        <div className="grid grid-cols-2 gap-6 mb-5 border border-slate-300 p-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Patient Details</p>
                                <p className="font-black text-base uppercase">{invoice.patientName}</p>
                                <p className="text-[10px] text-slate-600">UHID: {patient?.uhid || '—'}</p>
                                <p className="text-[10px] text-slate-600">Phone: {invoice.patientPhone || patient?.phone || '—'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Bill Details</p>
                                <p className="font-black text-base">{invoice.billNo}</p>
                                <p className="text-[10px] text-slate-600">Date: {format(new Date(invoice.createdAt), 'dd MMM yyyy')}</p>
                                {admission && <p className="text-[10px] text-slate-600">IP No: {admission.id.slice(0, 8).toUpperCase()}</p>}
                            </div>
                        </div>

                        {/* ── ADMISSION INFO ── */}
                        <div className="grid grid-cols-3 gap-4 mb-6 border border-slate-300 border-t-0 p-4 pt-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Primary Doctor</p>
                                <p className="text-[11px] font-bold uppercase">{doctor?.firstName || '—'} {doctor?.lastName || ''}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ward / Bed</p>
                                <p className="text-[11px] font-bold uppercase">{admission?.ward || 'General'} / {admission?.bedNumber || '—'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Admission Date</p>
                                <p className="text-[11px] font-bold">{admission?.admissionDate ? format(new Date(admission.admissionDate), 'dd MMM yyyy') : '—'}</p>
                            </div>
                        </div>

                        {/* ── CHARGES TABLE ── */}
                        <table className="w-full border-collapse mb-6 text-[11px]">
                            <thead>
                                <tr className="border-y-2 border-slate-800 bg-slate-50">
                                    <th className="py-2 px-3 text-left font-black uppercase tracking-wide w-10">S.No</th>
                                    <th className="py-2 px-3 text-left font-black uppercase tracking-wide">Service / Item Description</th>
                                    <th className="py-2 px-3 text-right font-black uppercase tracking-wide">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item: any, idx: number) => (
                                    <tr key={item.id} className="border-b border-slate-200">
                                        <td className="py-2 px-3 text-slate-600">{idx + 1}</td>
                                        <td className="py-2 px-3 font-semibold uppercase">{item.name}</td>
                                        <td className="py-2 px-3 text-right font-bold">₹{Number(item.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {invoice.items.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-10 text-center text-slate-400 italic">No charges recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* ── FOOTER — keep entire block together (no page break inside) ── */}
                        <div className="keep-together grid grid-cols-2 gap-10 border-t-2 border-slate-800 pt-5">
                            {/* Terms */}
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Terms &amp; Notes</p>
                                <ul className="space-y-1 text-[9px] text-slate-600 leading-relaxed">
                                    <li>• All Major Credit / Debit Cards / Digital Payments accepted.</li>
                                    <li>• Please verify all items before leaving the billing desk.</li>
                                    <li>• This is a computer generated invoice.</li>
                                </ul>
                            </div>

                            {/* Totals + Signature — same column, can't split */}
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Sub Total</span>
                                    <span className="font-bold">₹{Number(invoice.subTotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Total Items</span>
                                    <span className="font-bold">{invoice.items.length}</span>
                                </div>
                                {Number(invoice.discountAmount) > 0 && (
                                    <div className="flex justify-between text-emerald-700">
                                        <span className="font-bold uppercase">Discount</span>
                                        <span className="font-bold">– ₹{Number(invoice.discountAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t-2 border-slate-800 pt-2 mt-2">
                                    <span className="text-base font-black uppercase">Grand Total</span>
                                    <span className="text-base font-black">₹{Number(invoice.grandTotal).toLocaleString()}</span>
                                </div>

                                {/* Signature directly below totals */}
                                <div className="pt-6 text-right">
                                    <div className="border-b border-slate-400 h-8 mb-1" />
                                    <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                                    <p className="text-[9px] text-slate-400">Wellness Hospital Management</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
