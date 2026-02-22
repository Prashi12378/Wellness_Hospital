'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    History,
    Hospital,
    Calendar,
    Stethoscope,
    FileText,
    ReceiptText,
    FlaskConical,
    Activity,
    Scissors,
    ShieldCheck,
    Phone,
    User,
    ChevronRight,
    ExternalLink,
    FileEdit
} from 'lucide-react';
import { getPatientHistory } from '@/app/actions/history';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PatientHistoryDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'ipd' | 'opd'>('ipd');

    useEffect(() => {
        const fetchHistory = async () => {
            const res = await getPatientHistory(id);
            if (res.success) setData(res.history);
            setIsLoading(false);
        };
        fetchHistory();
    }, [id]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving Longitudinal Medical Records...</p>
        </div>
    );

    if (!data) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-black text-slate-800">Patient History Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Go Back</button>
        </div>
    );

    const { patient, admissions, appointments } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header / Profile Header */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary relative border-4 border-white shadow-xl">
                            <User className="w-12 h-12" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                    {patient.firstName} {patient.lastName}
                                </h1>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                    {patient.uhid}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-slate-500 font-medium">
                                <span className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    {patient.phone}
                                </span>
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    {patient.gender || 'Not Specified'} • {patient.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()) : '--'} YRS
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Registered: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                    <button
                        onClick={() => setActiveSection('ipd')}
                        className={cn(
                            "px-8 py-4 rounded-[20px] font-black text-sm transition-all flex items-center gap-2",
                            activeSection === 'ipd' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:bg-white"
                        )}
                    >
                        <Hospital className="w-5 h-5" />
                        IPD History
                        <span className="ml-2 px-2 py-0.5 bg-slate-800 text-[10px] rounded-md">{admissions.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('opd')}
                        className={cn(
                            "px-8 py-4 rounded-[20px] font-black text-sm transition-all flex items-center gap-2",
                            activeSection === 'opd' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:bg-white"
                        )}
                    >
                        <Stethoscope className="w-5 h-5" />
                        OPD Visits
                        <span className="ml-2 px-2 py-0.5 bg-slate-800 text-[10px] rounded-md">{appointments.length}</span>
                    </button>
                </div>
            </div>

            {/* Main History View */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeSection === 'ipd' && (
                    <div className="space-y-6">
                        {admissions.map((adm: any) => (
                            <div key={adm.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 group-hover:bg-primary/5 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-primary">
                                            <Hospital className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">In-Patient Admission Record</p>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                                {format(new Date(adm.admissionDate), 'MMMM dd, yyyy')} — {adm.dischargeDate ? format(new Date(adm.dischargeDate), 'MMMM dd, yyyy') : 'Current'}
                                            </h3>
                                            <p className="text-sm font-bold text-slate-400 mt-1">
                                                ID: {adm.id.split('-')[0].toUpperCase()} • {adm.ward} / {adm.bedNumber} • Consultant: Dr. {adm.primaryDoctor?.firstName} {adm.primaryDoctor?.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/dashboard/ipd/${adm.id}`}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                    >
                                        Full Case File
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>

                                <div className="px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <div className="space-y-4 col-span-1">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3" />
                                            Clinical Brief
                                        </h4>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed line-clamp-4">
                                            {adm.diagnoses || "No diagnoses recorded for this session."}
                                        </p>
                                    </div>

                                    <div className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Link
                                            href={`/dashboard/ipd/${adm.id}/discharge-summary`}
                                            className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-primary/20 transition-all group/card"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover/card:bg-primary group-hover/card:text-white transition-all">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/ipd/${adm.id}/discharge-summary?edit=true`} className="p-2 hover:bg-primary/10 rounded-lg text-slate-300 hover:text-primary transition-all">
                                                        <FileEdit className="w-4 h-4" />
                                                    </Link>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover/card:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-800 text-sm mb-1">Discharge Summary</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formal Medical Report</p>
                                        </Link>

                                        <Link
                                            href={`/dashboard/ipd/${adm.id}/invoice`}
                                            className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 hover:bg-white hover:shadow-lg hover:border-emerald-200 transition-all group/card"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover/card:bg-emerald-600 group-hover/card:text-white transition-all">
                                                    <ReceiptText className="w-6 h-6" />
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover/card:translate-x-1 transition-all" />
                                            </div>
                                            <p className="font-black text-slate-800 text-sm mb-1">Billing Dossier</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                ₹{adm.charges?.reduce((a: number, c: any) => a + Number(c.amount), 0).toLocaleString()} Total
                                            </p>
                                        </Link>

                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Interventions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600">
                                                        {adm.labRecords?.length || 0} LABS
                                                    </span>
                                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600">
                                                        {adm.surgeries?.length || 0} SURGERY
                                                    </span>
                                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-600">
                                                        {adm.clinicalNotes?.length || 0} NOTES
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-slate-400 uppercase">
                                                <span>Final Status:</span>
                                                <span className={cn("px-2 py-0.5 rounded", adm.status === 'discharged' ? "bg-slate-200 text-slate-500" : "bg-emerald-100 text-emerald-600")}>
                                                    {adm.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {admissions.length === 0 && (
                            <div className="bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
                                <Hospital className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No IPD History</h3>
                                <p className="text-slate-400 max-w-sm mx-auto mt-1">This patient has never been admitted to the IPD section.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'opd' && (
                    <div className="grid grid-cols-1 gap-6">
                        {appointments.map((apt: any) => (
                            <div key={apt.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Stethoscope className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Out-Patient Consultation</p>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                            {format(new Date(apt.appointmentDate), 'MMMM dd, yyyy')} — {apt.appointmentTime}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">
                                            Consultant: Dr. {apt.doctor?.firstName} {apt.doctor?.lastName} ({apt.doctor?.specialization})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right pr-6 border-r border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for visit</p>
                                        <p className="text-sm font-bold text-slate-700 italic">"{apt.reason || 'General Checkup'}"</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {apt.prescription ? (
                                            <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                                                <FileText className="w-4 h-4" />
                                                Prescription Issued
                                            </div>
                                        ) : (
                                            <div className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-slate-100">
                                                <History className="w-4 h-4" />
                                                No Prescription
                                            </div>
                                        )}
                                        <span className={cn(
                                            "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                            apt.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/10"
                                        )}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {appointments.length === 0 && (
                            <div className="bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
                                <Stethoscope className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No OPD Visits</h3>
                                <p className="text-slate-400 max-w-sm mx-auto mt-1">This patient has no recorded out-patient appointments.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
