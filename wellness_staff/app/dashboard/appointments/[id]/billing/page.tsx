'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    User,
    Stethoscope,
    FileText,
    ReceiptText,
    Plus,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Printer,
    Trash2,
    Pencil
} from 'lucide-react';
import {
    getAppointmentBillingDetails,
    addOPDCharge,
    updateOPDCharge,
    deleteOPDCharge,
    generateOPDInvoice,
    getAllDoctors
} from '@/app/actions/billing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OPDBillingPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [appointment, setAppointment] = useState<any>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [modalType, setModalType] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

    useEffect(() => {
        fetchDetails();
        fetchDoctors();
    }, [id]);

    const fetchDetails = async () => {
        setIsLoading(true);
        const res = await getAppointmentBillingDetails(id);
        if (res.success) setAppointment(res.appointment);
        setIsLoading(false);
    };

    const fetchDoctors = async () => {
        const res = await getAllDoctors();
        if (res.success && res.doctors) setDoctors(res.doctors);
    };

    const handleAction = async (action: () => Promise<any>) => {
        setIsActionLoading(true);
        const res = await action();
        if (res.success) {
            setModalType(null);
            setEditingItem(null);
            fetchDetails();
        } else {
            alert(res.error || "Action failed");
        }
        setIsActionLoading(false);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Billing Data...</p>
        </div>
    );

    if (!appointment) return (
        <div className="p-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800">Appointment Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Return to Dashboard</button>
        </div>
    );

    const totalBill = appointment.charges?.reduce((acc: number, c: any) => acc + Number(c.amount), 0) || 0;
    const hasInvoice = appointment.invoices?.length > 0;

    const handleGenerateInvoice = async () => {
        if (appointment.charges.length === 0) {
            alert("No charges to invoice.");
            return;
        }

        const data = {
            appointmentId: id,
            patientName: appointment.patientName || `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            patientPhone: appointment.patientPhone || appointment.patient.phone,
            doctorName: appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : undefined,
            subTotal: totalBill,
            totalGst: 0, // Simplified for now
            grandTotal: totalBill,
            paymentMethod: paymentMethod,
            items: appointment.charges.map((c: any) => ({
                name: c.description,
                qty: 1,
                mrp: Number(c.amount),
                gstRate: 0,
                amount: Number(c.amount)
            }))
        };

        handleAction(() => generateOPDInvoice(data));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                {appointment.patientName || `${appointment.patient.firstName} ${appointment.patient.lastName}`}
                            </h1>
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                OPD Billing
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 font-medium">
                            <span className="flex items-center gap-2 text-xs">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')} • {appointment.appointmentTime}
                            </span>
                            <span className="flex items-center gap-2 text-xs">
                                <Stethoscope className="w-4 h-4 text-primary" />
                                {appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : "No Doctor Assigned"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!hasInvoice ? (
                        <button
                            onClick={handleGenerateInvoice}
                            disabled={isActionLoading || appointment.charges?.length === 0}
                            className="px-8 py-4 bg-primary text-white rounded-3xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            <ReceiptText className="w-5 h-5" />
                            Finalize & Print Bill
                        </button>
                    ) : (
                        <Link
                            href={`/dashboard/history/invoices/${appointment.invoices[0].id}`}
                            className="px-8 py-4 bg-emerald-500 text-white rounded-3xl font-black shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Printer className="w-5 h-5" />
                            Print Existing Invoice
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ledger */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Services & Charges</h3>
                            <p className="text-sm text-slate-500 font-medium">Add consultation fees and Other OPD services.</p>
                        </div>
                        {!hasInvoice && (
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setModalType('charge');
                                }}
                                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary transition-all active:scale-95"
                            >
                                <Plus className="w-5 h-5 text-primary" />
                                Add Service
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-left">Type</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    {!hasInvoice && <th className="px-6 py-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {appointment.charges?.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-800">{format(new Date(c.date), 'MMM dd, HH:mm')}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-600 uppercase tracking-tight">{c.description}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-base font-black text-slate-900">₹{Number(c.amount).toLocaleString()}</td>
                                        {!hasInvoice && (
                                            <td className="px-6 py-5 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(c);
                                                        setModalType('charge');
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-primary transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Delete this charge?")) {
                                                            handleAction(() => deleteOPDCharge(c.id, id));
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {appointment.charges?.length === 0 && (
                                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">No charges recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="space-y-8">
                    <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ReceiptText className="w-24 h-24" />
                        </div>
                        <h3 className="text-xl font-black mb-6 tracking-tight">Payment Summary</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                                <p className="text-5xl font-black tracking-tighter">₹{totalBill.toLocaleString()}</p>
                            </div>
                            <div className="pt-6 border-t border-slate-800 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Payment Mode</p>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        disabled={hasInvoice}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary appearance-none"
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="UPI">UPI / QR CODE</option>
                                        <option value="CARD">DEBIT / CREDIT CARD</option>
                                        <option value="TRANSFER">BANK TRANSFER</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs font-bold text-slate-500">Status</p>
                                    <p className={cn(
                                        "text-lg font-black uppercase tracking-tight",
                                        hasInvoice ? "text-emerald-400" : "text-amber-400"
                                    )}>
                                        {hasInvoice ? "Invoice Generated" : "Draft Bill"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Tips</h4>
                        <ul className="space-y-3 text-xs text-slate-600 font-medium">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                Manual Consultant fee entry allows flexibility for different visit types.
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                Invoices cannot be edited once generated. Delete charges before finalizing.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Charge Modal */}
            {modalType === 'charge' && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Record OPD Charge</h3>
                            <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form className="p-8 space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            const data = {
                                appointmentId: id,
                                description: fd.get('description') as string,
                                amount: Number(fd.get('amount')),
                                type: fd.get('type') as string,
                                date: fd.get('date') as string
                            };
                            handleAction(() => editingItem ? updateOPDCharge(editingItem.id, data) : addOPDCharge(data));
                        }}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                                <select
                                    name="type"
                                    defaultValue={editingItem?.type || "consultation"}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none"
                                    onChange={(e) => {
                                        const form = e.target.form;
                                        if (e.target.value === 'consultation' && form) {
                                            const doctorSelect = form.elements.namedItem('doctorSelect') as HTMLSelectElement;
                                            if (doctorSelect && doctorSelect.value) {
                                                const doctor = doctors.find(d => d.id === doctorSelect.value);
                                                if (doctor) {
                                                    (form.elements.namedItem('description') as HTMLInputElement).value = `Consultation Fee - Dr. ${doctor.firstName} ${doctor.lastName}`;
                                                    (form.elements.namedItem('amount') as HTMLInputElement).value = doctor.consultationFee.toString();
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <option value="consultation">Doctor Consultation</option>
                                    <option value="registration">Registration Fee</option>
                                    <option value="procedure">Minor Procedure</option>
                                    <option value="other">Other Service</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Doctor (Optional Guide)</label>
                                <select
                                    name="doctorSelect"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none text-slate-400"
                                    onChange={(e) => {
                                        const doctor = doctors.find(d => d.id === e.target.value);
                                        const form = e.target.form;
                                        if (doctor && form) {
                                            (form.elements.namedItem('description') as HTMLInputElement).value = `Consultation Fee - Dr. ${doctor.firstName} ${doctor.lastName}`;
                                            (form.elements.namedItem('amount') as HTMLInputElement).value = doctor.consultationFee.toString();
                                        }
                                    }}
                                >
                                    <option value="">Select a doctor to fill details...</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
                                <input name="description" required defaultValue={editingItem?.description} placeholder="e.g., General Consultation" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                    <input name="amount" type="number" required defaultValue={editingItem?.amount} placeholder="500" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input name="date" type="datetime-local" defaultValue={editingItem?.date ? format(new Date(editingItem.date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                </div>
                            </div>

                            <button disabled={isActionLoading} className="w-full py-4 bg-primary text-white rounded-3xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                                {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "Save Charge"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
