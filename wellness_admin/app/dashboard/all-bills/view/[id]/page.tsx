import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

export default async function UniversalInvoicePage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const type = resolvedSearchParams.type as string;

    let invoiceData: any = null;
    let title = "HOSPITAL INVOICE";

    if (type === 'LABORATORY') {
        const labRequest = await prisma.labRequest.findUnique({
            where: { id },
            include: {
                patient: true
            }
        });

        if (labRequest) {
            title = "LABORATORY RECEIPT";
            invoiceData = {
                id: labRequest.id,
                billNo: `LAB-${labRequest.id.slice(0, 6).toUpperCase()}`,
                patientName: labRequest.patientName,
                patientPhone: labRequest.patient?.phone || '',
                uhid: labRequest.patient?.uhid || '',
                createdAt: labRequest.createdAt,
                subTotal: Number(labRequest.amount),
                discountAmount: 0,
                grandTotal: Number(labRequest.amount),
                doctorName: labRequest.requestedByName || 'Self Request',
                items: [
                    {
                        id: 'lab-1',
                        name: labRequest.testName,
                        amount: labRequest.amount
                    }
                ]
            };
        }
    } else {
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

        if (invoice) {
            if (type === 'PHARMACY' || invoice.billNo.startsWith('S-')) {
                title = "PHARMACY INVOICE";
            } else if (type === 'OPD' || invoice.billNo.startsWith('OPD-')) {
                title = "OPD CONSULTATION RECIEPT";
            } else if (type === 'IPD' || invoice.billNo.startsWith('INV-IPD-')) {
                title = "IPD FINAL BILL";
            }

            invoiceData = {
                id: invoice.id,
                billNo: invoice.billNo,
                patientName: invoice.patientName,
                patientPhone: invoice.patientPhone || invoice.admission?.patient?.phone || '',
                uhid: invoice.admission?.patient?.uhid || '',
                createdAt: invoice.createdAt,
                subTotal: Number(invoice.subTotal),
                discountAmount: Number(invoice.discountAmount),
                grandTotal: Number(invoice.grandTotal),
                doctorName: invoice.doctorName || (invoice.admission?.primaryDoctor ? `${invoice.admission.primaryDoctor.firstName} ${invoice.admission.primaryDoctor.lastName}` : ''),
                admissionId: invoice.admissionId,
                items: invoice.items.map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    amount: i.amount
                }))
            };
        }
    }

    if (!invoiceData) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="max-w-[800px] mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href={`/dashboard/all-bills`} className="flex items-center gap-2 text-slate-600 font-bold hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to All Bills
                </Link>
                <PrintButton />
            </div>

            {/* Invoice Document */}
            <div>
                <div className="max-w-[800px] mx-auto relative bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] print:opacity-[0.08] pointer-events-none z-0 select-none overflow-hidden print:fixed print:inset-0">
                        <img src="/logo.png" alt="Watermark" className="w-[50%] max-w-md object-contain grayscale-0" />
                    </div>

                    <div className="p-12 print:p-8 relative z-10">
                        {/* Header */}
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

                            <div className="w-24 print:w-20 shrink-0"></div>
                        </div>

                        {/* Document Title */}
                        <div className="text-center mb-8">
                            <span className="inline-block px-4 py-1.5 border-2 border-slate-900 text-slate-900 text-sm font-black tracking-[0.2em] uppercase">
                                {title}
                            </span>
                        </div>

                        {/* Patient Info */}
                        <div className="flex justify-between items-center mb-8 font-sans bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-slate-300 print:rounded-xl">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Billed To:</p>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{invoiceData.patientName}</h2>
                                {invoiceData.uhid && <p className="text-[11px] font-bold text-slate-600 uppercase">UHID: {invoiceData.uhid}</p>}
                                <p className="text-[11px] font-bold text-slate-600 uppercase">Phone: {invoiceData.patientPhone || '---'}</p>
                            </div>
                            <div className="text-right space-y-2">
                                <div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Bill No</p>
                                    <p className="text-base font-black text-slate-900 uppercase">{invoiceData.billNo}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Date & Time</p>
                                    <p className="text-[12px] font-bold text-slate-900 uppercase">
                                        {format(new Date(invoiceData.createdAt), 'dd-MMM-yyyy hh:mm a')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {(invoiceData.doctorName || invoiceData.admissionId) && (
                            <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex justify-between print:bg-white print:border-slate-200">
                                {invoiceData.doctorName && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consulting Doctor / Requested By</p>
                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                                            {invoiceData.doctorName.toLowerCase().includes('dr') ? invoiceData.doctorName : `Dr. ${invoiceData.doctorName}`}
                                        </p>
                                    </div>
                                )}
                                {invoiceData.admissionId && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IPD Admission No</p>
                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{invoiceData.admissionId.slice(0, 8)}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Table Section */}
                        <div className="mb-12">
                            <table className="w-full text-left border-collapse font-sans">
                                <thead>
                                    <tr className="border-y-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-50 print:bg-white">
                                        <th className="py-4 px-3 w-16">S.No</th>
                                        <th className="py-4 px-3">Description of Service / Items</th>
                                        <th className="py-4 px-3 text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {invoiceData.items.map((item: any, idx: number) => (
                                        <tr key={item.id} className="text-[13px] text-slate-800">
                                            <td className="py-4 px-3 font-bold text-slate-500">{idx + 1}</td>
                                            <td className="py-4 px-3 font-black uppercase tracking-tight">{item.name}</td>
                                            <td className="py-4 px-3 text-right font-black">₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {invoiceData.items.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 italic font-medium">No items found on this bill.</td>
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
                                    <ul className="space-y-1.5 text-[9px] font-semibold text-slate-600">
                                        <li>• All payments are non-refundable once billed.</li>
                                        <li>• Please produce this receipt for collecting lab reports.</li>
                                        <li>• Pharmacy returns accepted within 3 days with valid batch.</li>
                                    </ul>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-900 text-white rounded-2xl print:bg-white print:text-slate-900 print:border-2 print:border-slate-900 w-full text-center">
                                        <p className="text-[11px] font-black uppercase tracking-widest">Computer Generated</p>
                                        <p className="text-[9px] font-medium text-slate-300 print:text-slate-600 mt-0.5">No physical signature required</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sub Total</span>
                                        <span className="text-base font-bold text-slate-900">₹{invoiceData.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Items</span>
                                        <span className="text-sm font-bold text-slate-900">{invoiceData.items.length}</span>
                                    </div>
                                    {invoiceData.discountAmount > 0 && (
                                        <div className="flex justify-between items-center px-4">
                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Discount</span>
                                            <span className="text-base font-bold text-emerald-600">-₹{invoiceData.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-slate-900 text-slate-900 p-4 rounded-2xl bg-slate-50 print:bg-white print:border-t-2 print:border-slate-900">
                                        <span className="text-lg font-black uppercase tracking-tighter">Net Total</span>
                                        <span className="text-3xl font-black">₹{invoiceData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="pt-8 text-center">
                                    <div className="w-32 h-px bg-slate-300 mx-auto mb-2 print:bg-slate-900"></div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase">Authorized Signatory</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Wellness Hospital Accounts</p>
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
                            size: A4;
                        }
                        .max-w-\\[800px\\] {
                            max-width: 100% !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                    }
                ` }} />
                </div>
            </div>
        </div>
    );
}
