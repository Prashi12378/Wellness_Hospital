'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    User,
    Bed,
    Stethoscope,
    FileText,
    ReceiptText,
    FlaskConical,
    Activity,
    Plus,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Scissors,
    ShieldCheck,
    Printer,
    FileSearch,
    Sparkles,
    Wand2,
    Trash2
} from 'lucide-react';
import {
    getAdmissionDetails,
    addHospitalCharge,
    addLabRecord,
    addSurgery,
    addClinicalNote,
    dischargePatient,
    generateAIDischargeSummary,
    updateAdmissionDates,
    updateDischargeSummary,
    updateHospitalCharge,
    updateLabRecord,
    updateSurgery,
    updateClinicalNote,
    deleteAdmission
} from '@/app/actions/ipd';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

type TabType = 'overview' | 'billing' | 'clinical' | 'files';

export default function AdmissionDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [admission, setAdmission] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editingDate, setEditingDate] = useState<'admission' | 'discharge' | null>(null);

    // Modals
    const [modalType, setModalType] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        fetchDetails();
        // Check for edit query param
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('edit') === 'true') {
            setModalType('edit_discharge');
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [id]);

    const fetchDetails = async () => {
        setIsLoading(true);
        const res = await getAdmissionDetails(id);
        if (res.success) setAdmission(res.admission);
        setIsLoading(false);
    };

    const handleAction = async (action: () => Promise<any>) => {
        setIsActionLoading(true);
        const res = await action();
        if (res.success) {
            setModalType(null);
            setEditingItem(null);
            fetchDetails();
        }
        setIsActionLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete the IPD record for ${admission.patient.firstName} ${admission.patient.lastName}? This action cannot be undone.`)) return;

        setIsActionLoading(true);
        const res = await deleteAdmission(id);
        if (res.success) {
            router.push('/dashboard/ipd');
        } else {
            alert(res.error || "Failed to delete record");
            setIsActionLoading(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Case File...</p>
        </div>
    );

    if (!admission) return (
        <div className="p-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800">Case File Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Return to Dashboard</button>
        </div>
    );

    const totalBill = admission.charges?.reduce((acc: number, c: any) => acc + Number(c.amount), 0) || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Context Header */}
            <div className="flex items-start justify-between bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                {admission.patient.firstName} {admission.patient.lastName}
                            </h1>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                admission.status === 'admitted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                {admission.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 font-medium">
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                {admission.patient.uhid}
                            </span>
                            <span className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-primary" />
                                {admission.ward} • {admission.bedNumber}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {editingDate === 'admission' ? (
                                    <input
                                        type="date"
                                        autoFocus
                                        defaultValue={format(new Date(admission.admissionDate), 'yyyy-MM-dd')}
                                        onBlur={async (e) => {
                                            if (e.target.value) {
                                                await updateAdmissionDates(id, { admissionDate: e.target.value });
                                                fetchDetails();
                                            }
                                            setEditingDate(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                            if (e.key === 'Escape') setEditingDate(null);
                                        }}
                                        className="px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setEditingDate('admission')}
                                        className="hover:text-primary hover:underline transition-colors cursor-pointer"
                                        title="Click to edit admission date"
                                    >
                                        Adm: {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                                    </button>
                                )}
                            </span>
                            {admission.dischargeDate && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-red-400" />
                                    {editingDate === 'discharge' ? (
                                        <input
                                            type="date"
                                            autoFocus
                                            defaultValue={format(new Date(admission.dischargeDate), 'yyyy-MM-dd')}
                                            onBlur={async (e) => {
                                                if (e.target.value) {
                                                    await updateAdmissionDates(id, { dischargeDate: e.target.value });
                                                    fetchDetails();
                                                }
                                                setEditingDate(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                                if (e.key === 'Escape') setEditingDate(null);
                                            }}
                                            className="px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-red-200"
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setEditingDate('discharge')}
                                            className="hover:text-red-500 hover:underline transition-colors cursor-pointer"
                                            title="Click to edit discharge date"
                                        >
                                            Disc: {format(new Date(admission.dischargeDate), 'MMM dd, yyyy')}
                                        </button>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={isActionLoading}
                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all border border-transparent hover:border-red-100"
                        title="Delete IPD Record"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                    {admission.status === 'admitted' ? (
                        <button
                            onClick={() => setModalType('discharge')}
                            className="px-8 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-3xl font-black shadow-sm transition-all active:scale-95 border border-red-100"
                        >
                            Initiate Discharge
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setModalType('edit_discharge')}
                                className="px-6 py-4 bg-slate-900 text-white rounded-3xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                <FileSearch className="w-5 h-5" />
                                Edit Summary
                            </button>
                            <Link
                                href={`/dashboard/ipd/${id}/discharge-summary`}
                                className="px-8 py-4 bg-primary text-white rounded-3xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Discharge Summary
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded-3xl border border-slate-100 backdrop-blur-sm self-start inline-flex">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'billing', label: 'Billing & Charges', icon: ReceiptText },
                    { id: 'clinical', label: 'Clinical Records', icon: Stethoscope },
                    { id: 'files', label: 'Medical Files', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all",
                            activeTab === tab.id
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                : "text-slate-500 hover:bg-white hover:shadow-sm"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Case Summary */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-primary" />
                                    Clinical Summary
                                </h3>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Physician</p>
                                        <p className="text-lg font-black text-slate-800 leading-tight">
                                            {admission.primaryDoctor ? `${admission.primaryDoctor.firstName} ${admission.primaryDoctor.lastName}` : "Unassigned"}
                                        </p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">{admission.primaryDoctor?.specialization || "--"}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entry Status</p>
                                        <p className="text-lg font-black text-emerald-600 leading-tight uppercase">{admission.status}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Days since admission: {Math.floor((new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 3600 * 24))} Days</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Latest Clinical Records</h4>
                                    <div className="space-y-3">
                                        {admission.clinicalNotes?.slice(0, 3).map((note: any) => (
                                            <div key={note.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                                                <div className="p-2 bg-primary/5 rounded-xl">
                                                    <Stethoscope className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{note.note}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                        {note.doctorName} • {format(new Date(note.createdAt), 'MMM dd, HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {admission.clinicalNotes?.length === 0 && (
                                            <p className="text-sm text-slate-400 italic py-4">No clinical notes recorded yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ReceiptText className="w-24 h-24" />
                                </div>
                                <h3 className="text-xl font-black mb-6 tracking-tight">Billing Summary</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Running Balance</p>
                                        <p className="text-5xl font-black tracking-tighter">₹{totalBill.toLocaleString()}</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-800 space-y-3">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">Medicine Charges</span>
                                            <span>₹{(admission.charges?.filter((c: any) => c.type === 'medicine').reduce((a: number, c: any) => a + Number(c.amount), 0) || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">Hospital Fees</span>
                                            <span>₹{(admission.charges?.filter((c: any) => c.type !== 'medicine').reduce((a: number, c: any) => a + Number(c.amount), 0) || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('billing')}
                                        className="w-full py-4 bg-primary text-white rounded-3xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
                                    >
                                        Detailed Bill Breakdown
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Financial Ledger</h3>
                                <p className="text-slate-500 font-medium">Daily breakdowns and service charges.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/dashboard/ipd/${id}/invoice`}
                                    className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print Bill
                                </Link>
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        setModalType('charge');
                                    }}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary transition-all active:scale-95"
                                >
                                    <Plus className="w-5 h-5 text-primary" />
                                    Add Daily Charge
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-4">Transaction Date</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {admission.charges?.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-sm font-bold text-slate-800">{format(new Date(c.date), 'MMM dd, yyyy HH:mm')}</td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-600 uppercase tracking-tight">{c.description}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {c.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right text-base font-black text-slate-900">₹{Number(c.amount).toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(c);
                                                        setModalType('charge');
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-primary transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {admission.charges?.length === 0 && (
                                        <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">No charges recorded yet.</td></tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white rounded-2xl overflow-hidden">
                                        <td colSpan={3} className="px-6 py-5 text-lg font-black tracking-tight text-slate-400 lowercase">T O T A L   B I L L</td>
                                        <td className="px-6 py-5 text-right text-2xl font-black">₹{totalBill.toLocaleString()}</td>
                                        <td className="px-6 py-5"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'clinical' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Clinical Notes & Suggestions */}
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[600px]">
                            <div className="flex items-center justify-between mb-8 shrink-0">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <Stethoscope className="w-6 h-6 text-primary" />
                                    Clinical Notes
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        setModalType('note');
                                    }}
                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {admission.clinicalNotes?.map((note: any) => (
                                    <div key={note.id} className="p-6 bg-slate-50/50 rounded-[30px] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2.5 py-1 bg-white text-primary border border-primary/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                {note.type}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                                {format(new Date(note.createdAt), 'MMM dd, HH:mm')}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingItem(note);
                                                    setModalType('note');
                                                }}
                                                className="p-1.5 hover:bg-white rounded-lg text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">{note.note}</p>
                                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {note.doctorName[0]}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recorded by {note.doctorName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Lab Records */}
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[284px]">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                        <FlaskConical className="w-6 h-6 text-purple-500" />
                                        Lab Records
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setEditingItem(null);
                                            setModalType('lab');
                                        }}
                                        className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-500 hover:text-white transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                    {admission.labRecords?.map((lab: any) => (
                                        <div key={lab.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-purple-50 rounded-xl text-purple-500">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{lab.testName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(lab.recordedAt), 'MMM dd, yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(lab);
                                                        setModalType('lab');
                                                    }}
                                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-purple-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">{lab.result || "Pending"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Surgery Records */}
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[284px]">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                        <Scissors className="w-6 h-6 text-emerald-500" />
                                        Surgery Log
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setEditingItem(null);
                                            setModalType('surgery');
                                        }}
                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                    {admission.surgeries?.map((sur: any) => (
                                        <div key={sur.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{sur.surgeryName}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(sur.surgeryDate), 'MMM dd, yyyy')}</p>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">By {sur.surgeonName}</p>
                                            <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(sur);
                                                        setModalType('surgery');
                                                    }}
                                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-emerald-500 transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'files' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Medical Files Archive</h3>
                            <p className="text-slate-500 font-medium font-medium text-sm">Aggregated reports and documents from clinical records.</p>
                        </div>

                        {/* Aggregated Files List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Clinical Note Files */}
                            {admission.clinicalNotes?.filter((n: any) => n.fileUrl).map((note: any) => (
                                <a
                                    key={note.id}
                                    href={note.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group p-6 bg-slate-50 rounded-[30px] border border-slate-100 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <Download className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="font-black text-slate-800 text-sm mb-1 truncate">{note.type} Document</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Ref: {note.doctorName} • {format(new Date(note.createdAt), 'MMM dd')}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                        <span>View Document</span>
                                        <Activity className="w-3 h-3" />
                                    </div>
                                </a>
                            ))}

                            {/* Lab Record Files */}
                            {admission.labRecords?.filter((l: any) => l.fileUrl).map((lab: any) => (
                                <a
                                    key={lab.id}
                                    href={lab.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group p-6 bg-purple-50 rounded-[30px] border border-purple-100 hover:bg-white hover:shadow-xl hover:border-purple-200 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <FileSearch className="w-6 h-6" />
                                        </div>
                                        <Download className="w-5 h-5 text-purple-200 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                    <p className="font-black text-slate-800 text-sm mb-1 truncate">Lab: {lab.testName}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                        Ref: {format(new Date(lab.recordedAt), 'MMM dd, yyyy')}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest">
                                        <span>Open Lab Report</span>
                                        <Activity className="w-3 h-3" />
                                    </div>
                                </a>
                            ))}

                            {/* No Files Check */}
                            {(!admission.clinicalNotes?.some((n: any) => n.fileUrl) && !admission.labRecords?.some((l: any) => l.fileUrl)) && (
                                <div className="col-span-full p-20 text-center bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200">
                                    <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-400">No medical files found</h3>
                                    <p className="text-slate-400 text-sm mt-1">Attachments from lab records and notes will appear here.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[40px] text-white flex items-center justify-between overflow-hidden relative group cursor-pointer">
                            <div className="relative z-10">
                                <h4 className="text-xl font-black mb-1">Add New Document</h4>
                                <p className="text-slate-400 text-sm font-bold">Upload patient-specific reports or consent forms.</p>
                            </div>
                            <button className="relative z-10 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
                                <Plus className="w-6 h-6" />
                            </button>
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                                <FileText className="w-32 h-32" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals Section */}
            {modalType && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Record {modalType}</h3>
                            <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {modalType === 'charge' && (
                            <form className="p-8 space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    admissionId: id,
                                    description: fd.get('description') as string,
                                    amount: Number(fd.get('amount')),
                                    type: fd.get('type') as string,
                                    date: fd.get('date') as string
                                };
                                handleAction(() => editingItem ? updateHospitalCharge(editingItem.id, data) : addHospitalCharge(data));
                            }}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
                                        <input name="date" type="datetime-local" defaultValue={editingItem?.date ? format(new Date(editingItem.date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                                        <select name="type" defaultValue={editingItem?.type || "bed"} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none">
                                            <option value="bed">Bed Charge</option>
                                            <option value="nursing">Nursing</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="operating_theatre">OT Fee</option>
                                            <option value="medicine">Pharmacy</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
                                    <input name="description" required defaultValue={editingItem?.description} placeholder="e.g., Bed Charge (Day 1)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                    <input name="amount" type="number" required defaultValue={editingItem?.amount} placeholder="1500" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-primary text-white rounded-3xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (editingItem ? "Update Transaction" : "Save Transaction")}
                                </button>
                            </form>
                        )}

                        {modalType === 'note' && (
                            <form className="p-8 space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    admissionId: id,
                                    doctorName: fd.get('doctorName') as string,
                                    note: fd.get('note') as string,
                                    type: fd.get('type') as string,
                                    createdAt: fd.get('createdAt') as string
                                };
                                handleAction(() => editingItem ? updateClinicalNote(editingItem.id, data) : addClinicalNote(data));
                            }}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Date & Time</label>
                                        <input name="createdAt" type="datetime-local" defaultValue={editingItem?.createdAt ? format(new Date(editingItem.createdAt), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physician Name</label>
                                        <input name="doctorName" required defaultValue={editingItem?.doctorName} placeholder="Dr. Smith" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Note / Suggestion</label>
                                    <textarea name="note" required rows={4} defaultValue={editingItem?.note} placeholder="Detailed medical summary..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Priority</label>
                                    <select name="type" defaultValue={editingItem?.type || "suggestion"} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none">
                                        <option value="suggestion">Regular Suggestion</option>
                                        <option value="daily_note">Daily Condition Update</option>
                                        <option value="instruction">Critical Instruction</option>
                                    </select>
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black shadow-xl flex items-center justify-center gap-2">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (editingItem ? "Update Record" : "Publish Record")}
                                </button>
                            </form>
                        )}

                        {modalType === 'lab' && (
                            <form className="p-8 space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    admissionId: id,
                                    testName: fd.get('testName') as string,
                                    result: fd.get('result') as string,
                                    recordedAt: fd.get('recordedAt') as string
                                };
                                handleAction(() => editingItem ? updateLabRecord(editingItem.id, data) : addLabRecord(data));
                            }}>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recording Date & Time</label>
                                    <input name="recordedAt" type="datetime-local" defaultValue={editingItem?.recordedAt ? format(new Date(editingItem.recordedAt), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Name</label>
                                    <input name="testName" required defaultValue={editingItem?.testName} placeholder="Full Blood Count" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Result Summary</label>
                                    <input name="result" defaultValue={editingItem?.result} placeholder="e.g., Stable / Normal" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 font-bold" />
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-purple-600 text-white rounded-3xl font-black shadow-xl shadow-purple-200 flex items-center justify-center gap-2">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (editingItem ? "Update Lab Result" : "Record Lab Result")}
                                </button>
                            </form>
                        )}

                        {modalType === 'surgery' && (
                            <form className="p-8 space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    admissionId: id,
                                    surgeryName: fd.get('surgeryName') as string,
                                    surgeonName: fd.get('surgeonName') as string,
                                    surgeryDate: new Date(fd.get('surgeryDate') as string),
                                    notes: fd.get('notes') as string
                                };
                                handleAction(() => editingItem ? updateSurgery(editingItem.id, data) : addSurgery(data));
                            }}>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operation / Surgery Name</label>
                                    <input name="surgeryName" required defaultValue={editingItem?.surgeryName} placeholder="Appendectomy" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surgeon Name</label>
                                        <input name="surgeonName" required defaultValue={editingItem?.surgeonName} placeholder="Dr. Doe" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surgery Date & Time</label>
                                        <input name="surgeryDate" type="datetime-local" required defaultValue={editingItem?.surgeryDate ? format(new Date(editingItem.surgeryDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Procedure Notes</label>
                                    <textarea name="notes" rows={3} defaultValue={editingItem?.notes} placeholder="Key details of the procedure..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-200 font-bold resize-none" />
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-emerald-600 text-white rounded-3xl font-black shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (editingItem ? "Update Surgery Log" : "Finalize Surgery Entry")}
                                </button>
                            </form>
                        )}

                        {modalType === 'discharge' && (
                            <form className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    diagnoses: fd.get('diagnoses') as string,
                                    presentingSymptoms: fd.get('presentingSymptoms') as string,
                                    physicalFindings: fd.get('physicalFindings') as string,
                                    investigations: fd.get('investigations') as string,
                                    hospitalCourse: fd.get('hospitalCourse') as string,
                                    dischargeMedication: fd.get('dischargeMedication') as string,
                                    dischargeCondition: fd.get('dischargeCondition') as string,
                                    dischargeAdvice: fd.get('dischargeAdvice') as string,
                                    noteAndReview: fd.get('noteAndReview') as string,
                                    doctorDesignation: fd.get('doctorDesignation') as string,
                                    paymentMethod: fd.get('paymentMethod') as string,
                                };
                                handleAction(() => dischargePatient(id, data));
                            }}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest">Clinical Discharge Details</h4>
                                        <button
                                            type="button"
                                            disabled={isAILoading}
                                            onClick={async () => {
                                                setIsAILoading(true);
                                                const res = await generateAIDischargeSummary(id);
                                                if (res.success && res.summary) {
                                                    const form = document.querySelector('form');
                                                    if (form) {
                                                        const fields = [
                                                            'diagnoses', 'presentingSymptoms', 'physicalFindings',
                                                            'investigations', 'hospitalCourse', 'dischargeMedication',
                                                            'dischargeCondition', 'dischargeAdvice', 'noteAndReview'
                                                        ];
                                                        fields.forEach(field => {
                                                            const element = (form.elements as any).namedItem(field) as HTMLTextAreaElement | HTMLInputElement;
                                                            if (element) element.value = res.summary[field] || '';
                                                        });
                                                    }
                                                }
                                                setIsAILoading(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {isAILoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            AI Magic Draft
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Diagnoses</label>
                                        <textarea name="diagnoses" required rows={3} placeholder="List final diagnoses (one per line)..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presenting Symptoms</label>
                                        <textarea name="presentingSymptoms" rows={2} placeholder="Chief complaints and history..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Findings (Vitals/Examination)</label>
                                        <textarea name="physicalFindings" rows={3} placeholder="Temp, Pulse, BP, SpO2, CVS, RS, PA, CNS..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Investigations Summary</label>
                                        <textarea name="investigations" rows={2} placeholder="Key lab/radiology results..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course in the Hospital</label>
                                        <textarea name="hospitalCourse" rows={4} placeholder="Summary of treatment and response..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discharge Medication</label>
                                        <textarea name="dischargeMedication" rows={3} placeholder="List medications with dosage/frequency..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition on Discharge</label>
                                            <input name="dischargeCondition" placeholder="e.g., Satisfactory / Improved" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold uppercase" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attending Doctor Designation</label>
                                            <input name="doctorDesignation" placeholder="e.g., CONSULTANT AYURVEDA" defaultValue={admission.primaryDoctor?.specialization || "CONSULTANT AYURVEDA"} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold uppercase" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advice on Discharge</label>
                                        <textarea name="dischargeAdvice" rows={2} placeholder="Follow-up instructions, diet, etc..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Mode (Bill Settlement)</label>
                                        <select name="paymentMethod" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-200 font-bold uppercase">
                                            <option value="CASH">CASH</option>
                                            <option value="UPI">UPI / QR CODE</option>
                                            <option value="CARD">DEBIT / CREDIT CARD</option>
                                            <option value="TRANSFER">BANK TRANSFER</option>
                                        </select>
                                    </div>
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-red-600 text-white rounded-3xl font-black shadow-xl shadow-red-200 flex items-center justify-center gap-2 mt-4">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirm Patient Discharge & Finalize Bill"}
                                </button>
                            </form>
                        )}

                        {modalType === 'edit_discharge' && (
                            <form className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    diagnoses: fd.get('diagnoses') as string,
                                    presentingSymptoms: fd.get('presentingSymptoms') as string,
                                    physicalFindings: fd.get('physicalFindings') as string,
                                    investigations: fd.get('investigations') as string,
                                    hospitalCourse: fd.get('hospitalCourse') as string,
                                    dischargeMedication: fd.get('dischargeMedication') as string,
                                    dischargeCondition: fd.get('dischargeCondition') as string,
                                    dischargeAdvice: fd.get('dischargeAdvice') as string,
                                    noteAndReview: fd.get('noteAndReview') as string,
                                    doctorDesignation: fd.get('doctorDesignation') as string,
                                };
                                handleAction(() => updateDischargeSummary(id, data));
                            }}>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Edit Discharge Summary</h4>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Diagnoses</label>
                                        <textarea name="diagnoses" required rows={3} defaultValue={admission.diagnoses} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presenting Symptoms</label>
                                        <textarea name="presentingSymptoms" rows={2} defaultValue={admission.presentingSymptoms} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Findings</label>
                                        <textarea name="physicalFindings" rows={3} defaultValue={admission.physicalFindings} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Investigations Summary</label>
                                        <textarea name="investigations" rows={2} defaultValue={admission.investigations} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course in the Hospital</label>
                                        <textarea name="hospitalCourse" rows={4} defaultValue={admission.hospitalCourse} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discharge Medication</label>
                                        <textarea name="dischargeMedication" rows={3} defaultValue={admission.dischargeMedication} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition on Discharge</label>
                                            <input name="dischargeCondition" defaultValue={admission.dischargeCondition} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold uppercase" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attending Doctor Designation</label>
                                            <input name="doctorDesignation" defaultValue={admission.doctorDesignation || admission.primaryDoctor?.specialization || "CONSULTANT AYURVEDA"} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold uppercase" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advice on Discharge</label>
                                        <textarea name="dischargeAdvice" rows={2} defaultValue={admission.dischargeAdvice} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note and Review</label>
                                        <textarea name="noteAndReview" rows={2} defaultValue={admission.noteAndReview} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none uppercase" />
                                    </div>
                                </div>
                                <button disabled={isActionLoading} className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black shadow-xl flex items-center justify-center gap-2 mt-4">
                                    {isActionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "Update Summary Changes"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
