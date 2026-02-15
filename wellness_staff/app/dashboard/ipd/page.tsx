'use client';

import { useState, useEffect } from 'react';
import {
    Hospital,
    UserPlus,
    Bed,
    User,
    Search,
    ArrowRight,
    Loader2,
    Plus,
    X,
    ClipboardList,
    Stethoscope
} from 'lucide-react';
import { getAdmittedPatients, admitPatient } from '@/app/actions/ipd';
import { getDoctors, searchPatients } from '@/app/actions/appointments';
import { format } from 'date-fns';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TOTAL_BEDS = 50;

export default function IPDDashboard() {
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [view, setView] = useState<'active' | 'history'>('active');
    const [dashboardSearch, setDashboardSearch] = useState('');

    // Admission Modal State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 300);
    const [patientResults, setPatientResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        bedNumber: '',
        ward: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAdmissions();
        fetchDoctorsList();
    }, []);

    const fetchAdmissions = async () => {
        setIsLoading(true);
        // We'll update getAdmittedPatients to accept a status if needed, 
        // but for now let's just filter or fetch all and filter in JS if the list is small.
        // Or better yet, we can add a new action for history.
        const res = await getAdmittedPatients();
        if (res.success) setAdmissions(res.admissions || []);
        setIsLoading(false);
    };

    const fetchDoctorsList = async () => {
        const res = await getDoctors();
        if (res.success) setDoctors(res.doctors || []);
    };

    useEffect(() => {
        if (debouncedSearch.length < 2) {
            setPatientResults([]);
            return;
        }
        const handleSearch = async () => {
            setIsSearching(true);
            const res = await searchPatients(debouncedSearch);
            if (res.success) setPatientResults(res.patients || []);
            setIsSearching(false);
        };
        handleSearch();
    }, [debouncedSearch]);

    const handleAdmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;

        setIsSubmitting(true);
        const res = await admitPatient({
            patientId: selectedPatient.id,
            doctorId: formData.doctorId || undefined,
            bedNumber: formData.bedNumber,
            ward: formData.ward
        });

        if (res.success) {
            setShowAdmitModal(false);
            setSelectedPatient(null);
            setSearchTerm('');
            setFormData({ doctorId: '', bedNumber: '', ward: '' });
            fetchAdmissions();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Hospital className="w-8 h-8 text-primary" />
                        IPD Management
                    </h1>
                    <p className="text-slate-500 font-medium ml-11">Monitor and manage admitted patients effectively.</p>
                </div>
                <button
                    onClick={() => setShowAdmitModal(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
                >
                    <UserPlus className="w-5 h-5" />
                    New Admission
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Admitted Patients</p>
                        <p className="text-2xl font-black text-slate-900">{admissions.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                        <Bed className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bed Occupancy</p>
                        <p className="text-2xl font-black text-slate-900">{admissions.filter(a => a.status === 'admitted').length} / {TOTAL_BEDS}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Doctors</p>
                        <p className="text-2xl font-black text-slate-900">{new Set(admissions.filter(a => a.status === 'admitted').map(a => a.doctorId).filter(Boolean)).size}</p>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-100 backdrop-blur-sm self-start inline-flex">
                <button
                    onClick={() => setView('active')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                        view === 'active' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white"
                    )}
                >
                    Current Admissions
                </button>
                <button
                    onClick={() => setView('history')}
                    className={cn(
                        "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                        view === 'history' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-white"
                    )}
                >
                    Discharge History
                </button>
            </div>

            {/* Admissions List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        {view === 'active' ? 'Current Admissions' : 'Discharge History'}
                    </h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={dashboardSearch}
                            onChange={(e) => setDashboardSearch(e.target.value)}
                            placeholder="Find patient by name or UHID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Patients...</p>
                    </div>
                ) : admissions.length === 0 ? (
                    <div className="p-20 text-center">
                        <Hospital className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No {view === 'active' ? 'active admissions' : 'discharge history'} found</h3>
                        <p className="text-slate-400 text-sm mt-1">Start by admitting a new patient to the IPD.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4">Patient Profile</th>
                                    <th className="px-6 py-4">Status & Location</th>
                                    <th className="px-6 py-4">Primary Doctor</th>
                                    <th className="px-6 py-4">{view === 'active' ? 'Admission Date' : 'Discharge Date'}</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {admissions
                                    .filter(adm => {
                                        const statusMatch = view === 'active' ? adm.status === 'admitted' : adm.status === 'discharged';
                                        if (!statusMatch) return false;

                                        if (!dashboardSearch) return true;
                                        const search = dashboardSearch.toLowerCase();
                                        return (
                                            adm.patient.firstName.toLowerCase().includes(search) ||
                                            adm.patient.lastName.toLowerCase().includes(search) ||
                                            adm.patient.uhid.toLowerCase().includes(search)
                                        );
                                    })
                                    .map((adm) => (
                                        <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg">
                                                        {adm.patient.firstName[0]}{adm.patient.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-lg leading-tight uppercase">
                                                            {adm.patient.firstName} {adm.patient.lastName}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-400 tracking-wider">
                                                            UHID: {adm.patient.uhid}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "w-2.5 h-2.5 rounded-full",
                                                            adm.status === 'admitted' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                        )} />
                                                        <span className={cn(
                                                            "text-xs font-black uppercase tracking-widest",
                                                            adm.status === 'admitted' ? "text-emerald-600" : "text-slate-400"
                                                        )}>
                                                            {adm.status === 'admitted' ? 'Active Admission' : 'Discharged'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                                                        <Bed className="w-4 h-4 text-primary" />
                                                        {adm.ward} - {adm.bedNumber}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {adm.primaryDoctor ? (
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">Dr. {adm.primaryDoctor.firstName} {adm.primaryDoctor.lastName}</p>
                                                        <p className="text-xs font-bold text-slate-400 tracking-wider">{adm.primaryDoctor.specialization}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-300 italic">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-sm font-black text-slate-800">
                                                    {format(new Date(adm.status === 'admitted' ? adm.admissionDate : adm.dischargeDate), 'MMM dd, yyyy')}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 tracking-wider">
                                                    {adm.status === 'admitted' ? 'Entry Date' : 'Exit Date'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Link
                                                    href={`/dashboard/ipd/${adm.id}`}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-slate-200 active:scale-95"
                                                >
                                                    View Records
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Admission Modal */}
            {showAdmitModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <ClipboardList className="w-7 h-7 text-primary" />
                                    IPD Admission Form
                                </h2>
                                <p className="text-slate-500 font-medium">Assign bed and doctor for patient admission.</p>
                            </div>
                            <button onClick={() => setShowAdmitModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-red-500 shadow-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAdmit} className="p-8 space-y-8">
                            {/* Patient Search */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">1. Select Patient</label>
                                {!selectedPatient ? (
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by UHID, Name, or Phone..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold placeholder:text-slate-300"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            </div>
                                        )}
                                        {patientResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2">
                                                {patientResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setSelectedPatient(p)}
                                                        className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                                                            {p.firstName[0]}{p.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 uppercase text-sm">{p.firstName} {p.lastName}</p>
                                                            <p className="text-[10px] font-black text-slate-400 tracking-widest">{p.uhid} • {p.phone}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-5 bg-primary/5 border-2 border-primary/10 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black text-xl">
                                                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary uppercase text-lg leading-tight">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                                <p className="text-[10px] font-black text-slate-400 tracking-widest">{selectedPatient.uhid} • {selectedPatient.phone}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">Change</button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">2. Lead Doctor</label>
                                    <select
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold appearance-none"
                                    >
                                        <option value="">Assign Doctor...</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">3. Ward/Location</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                        placeholder="e.g. General Ward 1"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">4. Bed Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bedNumber}
                                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                                    placeholder="e.g. B-102"
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedPatient}
                                className="w-full py-5 bg-primary hover:bg-primary-dark disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-3xl font-black text-lg shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <>Admit to Hospital <ArrowRight className="w-6 h-6" /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
