import { getAdmissionDetails } from '@/app/actions/ipd';
import { format } from 'date-fns';
import { Printer, ArrowLeft, Hospital, Activity } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getAdmissionDetails(id);

    if (!result.success || !result.admission) {
        notFound();
    }

    const { admission } = result;
    const totalBill = admission.charges?.reduce((acc: number, c: any) => acc + Number(c.amount), 0) || 0;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0">
            {/* Action Bar */}
            <div className="max-w-[800px] mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href={`/dashboard/ipd/${id}`} className="flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>
                <button
                    id="print-btn"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Printer className="w-5 h-5" /> Print Invoice
                </button>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                document.getElementById('print-btn').onclick = function() {
                    window.print();
                }
            ` }} />

            {/* Invoice Document */}
            <div className="max-w-[800px] mx-auto bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                <div className="p-12 print:p-8">
                    {/* Header matching User Mockup - Refactored to prevent overlap */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                        <div className="w-24 h-24 print:w-20 print:h-20 shrink-0">
                            <img src="/logo.png" alt="Hospital Logo" className="w-full h-full object-contain" />
                        </div>

                        <div className="text-center flex-1 px-4">
                            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-1">Wellness Hospital</h1>
                            <p className="text-[11px] font-bold text-slate-600 max-w-md mx-auto leading-snug mb-2">
                                Beside friend function hall, Gowribidnur main road, Palanjoghalli,<br />
                                Doddaballapur - 561203, Karnataka, India<br />
                                <span className="text-slate-900">Ph No. +91 8105666338 | E-mail: wellnesshospital8383@gmail.com</span>
                            </p>
                            <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                GST NO: 29JNVPS4919B2Z5
                            </div>
                        </div>

                        <div className="w-24 print:w-20 shrink-0"></div> {/* Spacer for symmetry */}
                    </div>

                    <div className="flex justify-between items-center mb-8 font-sans">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-slate-600 uppercase">Bill To:</p>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{admission.patient?.firstName} {admission.patient?.lastName}</h2>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">UHID: {admission.patient?.uhid || '---'}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[11px] font-black text-slate-900 uppercase">Bill No: <span className="font-sans text-primary">IPD-{admission.id.slice(-6).toUpperCase()}</span></p>
                            <p className="text-[11px] font-black text-slate-900 uppercase">Date: {format(new Date(), 'dd-MM-yy')}</p>
                            <p className="text-[11px] font-black text-slate-900 uppercase">IP No: {admission.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between print:bg-white print:border-slate-200">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Consultant</p>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Dr. {admission.primaryDoctor?.firstName} {admission.primaryDoctor?.lastName}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ward / Bed</p>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{admission.ward || 'General'} / {admission.bedNumber || '---'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admission Date</p>
                            <p className="text-sm font-bold text-slate-900">{format(new Date(admission.admissionDate), 'dd MMM yyyy')}</p>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mb-12">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="border-y-2 border-slate-900 text-[10px] font-black uppercase text-slate-900">
                                    <th className="py-3 px-2">S.No</th>
                                    <th className="py-3 px-2">Service / Item Description</th>
                                    <th className="py-3 px-2">Service Type</th>
                                    <th className="py-3 px-2 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {admission.charges?.map((charge: any, idx: number) => (
                                    <tr key={charge.id} className="text-xs text-slate-800">
                                        <td className="py-4 px-2 font-bold">{idx + 1}</td>
                                        <td className="py-4 px-2 font-black uppercase tracking-tight">{charge.description}</td>
                                        <td className="py-4 px-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">
                                                {charge.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-right font-black">₹{Number(charge.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {admission.charges?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 italic">No charges recorded for this admission.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="grid grid-cols-2 gap-12 mt-auto font-sans">
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl print:bg-white">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase mb-2 italic underline">Important Notes:</h4>
                                <ul className="grid grid-cols-1 gap-1.5 text-[9px] font-bold text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                        All Major Credit / Debit Cards / Digital Payments accepted.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                        Please check all items and amounts before leaving.
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Computer Generated Invoice</p>
                                    <p className="text-[10px] font-black text-slate-900 italic">Wellness Hospital IPD</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2 pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[11px] font-black text-slate-500 uppercase">Sub Total</span>
                                    <span className="text-sm font-bold text-slate-900">₹{totalBill.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[11px] font-black text-slate-500 uppercase">Total Items</span>
                                    <span className="text-sm font-bold text-slate-900">{admission.charges?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 bg-slate-900 text-white p-4 rounded-2xl print:bg-white print:text-slate-900 print:border-2 print:border-slate-900">
                                    <span className="text-lg font-black uppercase tracking-tighter">Grand Total</span>
                                    <span className="text-3xl font-black">₹{totalBill.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-8 text-center">
                                <p className="text-[11px] font-black text-slate-900 uppercase underline decoration-slate-300 underline-offset-4">Authorized Signatory</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1">Wellness Hospital Management</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        nav, aside, header, footer, .sidebar, .topbar, .no-print, .print\\:hidden {
                            display: none !important;
                            height: 0 !important;
                            width: 0 !important;
                            overflow: hidden !important;
                        }
                        body {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        @page {
                            margin: 0;
                        }
                        .max-w-\\[800px\\] {
                            max-width: 100% !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 1.5cm !important;
                            box-shadow: none !important;
                            position: absolute;
                            top: 0;
                            left: 0;
                        }
                    }
                ` }} />
            </div>
        </div>
    );
}
