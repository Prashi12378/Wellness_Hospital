'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, UserPlus, Clock, ArrowLeft, Loader2, CheckCircle2, Hospital } from 'lucide-react';
import { searchPatients, getDoctors, createDirectAppointment } from '@/app/actions/appointments';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';

export default function DirectVisitPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 300);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [formData, setFormData] = useState({
        doctorId: '',
        reason: '',
        department: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            const res = await getDoctors();
            if (res.success) setDoctors(res.doctors || []);
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (debouncedSearch.length < 2) {
            setPatients([]);
            setIsSearching(false);
            return;
        }

        const handleSearch = async () => {
            setIsSearching(true);
            const res = await searchPatients(debouncedSearch);
            if (res.success) setPatients(res.patients || []);
            setIsSearching(false);
        };
        handleSearch();
    }, [debouncedSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !formData.doctorId) {
            setError('Please select both a patient and a doctor.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await createDirectAppointment({
                patientId: selectedPatient.id,
                doctorId: formData.doctorId,
                reason: formData.reason,
                department: formData.department
            });

            if (res.success) {
                router.push('/dashboard/appointments');
            } else {
                setError(res.error || 'Failed to create appointment');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">OPD Registration</h1>
                    <p className="text-slate-500 font-medium">Book a walk-in outpatient appointment immediately.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Selection Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-primary" />
                            Step 1: Select Patient
                        </h2>

                        {!selectedPatient ? (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by UHID, Name, or Phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                />

                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    </div>
                                )}

                                {patients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20">
                                        {patients.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedPatient(p)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {p.firstName[0]}{p.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{p.firstName} {p.lastName}</p>
                                                    <p className="text-xs text-slate-500">{p.uhid} • {p.phone}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {debouncedSearch.length >= 2 && !isSearching && patients.length === 0 && (
                                    <div className="mt-6 p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-600 font-bold">No patient found</p>
                                        <p className="text-slate-500 text-sm mb-4">Would you like to register them first?</p>
                                        <a href="/dashboard/patients/register" className="text-primary font-bold hover:underline">Register New Patient</a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary flex items-center gap-1.5">
                                            {selectedPatient.firstName} {selectedPatient.lastName}
                                            <CheckCircle2 className="w-4 h-4" />
                                        </p>
                                        <p className="text-xs text-slate-500">{selectedPatient.uhid} • {selectedPatient.phone}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    Change Patient
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all", !selectedPatient && "opacity-50 pointer-events-none")}>
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Step 2: Visit Details
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Select Doctor</label>
                                    <select
                                        required
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="">Choose a doctor...</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.firstName} {d.lastName} ({d.specialization})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Department (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Cardiology"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Reason for Visit</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Brief description of the visit..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-slate-200 text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Confirm Appointment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                        <Hospital className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-xl font-black mb-2 tracking-tight">OPD Policy</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            OPD registrations are for immediate walk-in appointments. These are prioritized based on medical emergency and doctor availability.
                        </p>
                        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Auto-Scheduled</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Real-time Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
