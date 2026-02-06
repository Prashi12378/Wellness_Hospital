'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, FileText, User, Calendar, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function PrescriptionsPage() {
    const supabase = createClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [prescriptions, setPrescriptions] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Search profiles first to get ID, or search prescriptions directly by joining?
            // Supabase join syntax: prescriptions(..., patient:profiles!patient_id(full_name))

            await supabase
                .from('prescriptions')
                .select(`
                    *,
                    patient:profiles!patient_id(full_name, email),
                    doctor:profiles!doctor_id(full_name)
                `)
                .order('created_at', { ascending: false });

            // Note: simple ilike on joined column might need complex filter or separate query.
            // Let's try direct client side filter if list is small, or specialized RPC.
            // For now, simpler approach: fetch all recent and filter, or use exact ID if possible.
            // Let's try the relation filter: .rpc or .ilike on joined table is tricky in JS client without embedding.
            // Alternative: Search profiles first.

            // Step 1: Find patients
            const { data: patients } = await supabase
                .from('profiles')
                .select('id')
                .ilike('full_name', `%${searchTerm}%`);

            if (patients && patients.length > 0) {
                const patientIds = patients.map(p => p.id);
                const { data: rxData } = await supabase
                    .from('prescriptions')
                    .select(`
                        *,
                        patient:profiles!patient_id(full_name, email),
                        doctor:profiles!doctor_id(full_name)
                    `)
                    .in('patient_id', patientIds)
                    .order('created_at', { ascending: false });

                if (rxData) setPrescriptions(rxData);
            } else {
                setPrescriptions([]);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
                    <p className="text-slate-500">View and fulfill patient prescriptions</p>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg">
                <input
                    type="text"
                    placeholder="Search by Patient Name..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 outline-none transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <button type="submit" className="absolute right-2 top-2 h-8 px-4 bg-primary-light text-white rounded-lg text-sm font-medium hover:bg-primary">
                    Search
                </button>
            </form>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Searching records...</div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-700">No prescriptions found</h3>
                        <p className="text-slate-500 text-sm">Try searching for a patient name.</p>
                    </div>
                ) : (
                    prescriptions.map((rx) => (
                        <div key={rx.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-primary-light/30">
                            <div
                                onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
                                className="p-6 cursor-pointer flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-light/10 text-primary-light rounded-full flex items-center justify-center font-bold text-lg">
                                        {rx.patient?.full_name?.[0] || 'P'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{rx.patient?.full_name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> Dr. {rx.doctor?.full_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {format(new Date(rx.created_at), 'PPP')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full tracking-wide">
                                        {rx.medicines?.length || 0} Meds
                                    </span>
                                    {expandedId === rx.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </div>

                            {expandedId === rx.id && (
                                <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <span className="text-slate-400 block text-xs uppercase font-bold mb-1">Diagnosis</span>
                                            <div className="text-slate-800 font-medium">{rx.diagnosis || 'Not specified'}</div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                                            <span className="text-slate-400 block text-xs uppercase font-bold mb-1">Notes</span>
                                            <div className="text-slate-800 font-medium">{rx.notes || 'No notes'}</div>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-primary-light" />
                                        Prescribed Medicines
                                    </h4>
                                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-4 py-3">Medicine</th>
                                                    <th className="px-4 py-3">Dosage</th>
                                                    <th className="px-4 py-3">Duration</th>
                                                    <th className="px-4 py-3">Instructions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {rx.medicines?.map((med: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 font-medium text-slate-800">{med.name}</td>
                                                        <td className="px-4 py-3 text-slate-600">{med.dosage}</td>
                                                        <td className="px-4 py-3 text-slate-600">{med.duration}</td>
                                                        <td className="px-4 py-3 text-slate-600">{med.instruction}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
