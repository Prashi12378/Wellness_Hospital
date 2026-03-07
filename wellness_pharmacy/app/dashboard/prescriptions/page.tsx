'use client';

import { useState, useEffect } from 'react';
import { Search, Pill, Calendar, User, Eye, X, Activity } from 'lucide-react';
import { getPrescriptions } from '@/app/actions/prescriptions';
import { format } from 'date-fns';

interface Medicine {
    name: string;
    strength: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
}

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        if (selectedPrescription) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedPrescription]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const res = await getPrescriptions();
            if (res.success && res.data) {
                setPrescriptions(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrescriptions = prescriptions.filter(rx =>
        rx.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.patientPhone?.includes(searchQuery)
    );

    const parseNotes = (notes: string | null) => {
        if (!notes) return { diagnosis: '', advice: '' };
        try {
            if (notes.startsWith('{')) {
                return JSON.parse(notes);
            }
        } catch (e) {
            // Ignore
        }
        return { diagnosis: '', advice: notes };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Pill className="w-8 h-8 text-primary" />
                        Prescriptions
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">View digital prescriptions saved by consulting doctors</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name, phone, or doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal"
                    />
                </div>
                <button
                    onClick={fetchPrescriptions}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                    Refresh List
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Patient Details</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Prescribed By</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading prescriptions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPrescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                        <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-lg font-semibold text-slate-700">No prescriptions found</p>
                                        <p className="text-sm mt-1">Try adjusting your search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPrescriptions.map((rx) => (
                                    <tr key={rx.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-700">
                                                    {format(new Date(rx.date), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center">
                                                    {rx.patientName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{rx.patientName}</p>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                                                        <span>{rx.patientPhone || 'No Phone'}</span>
                                                        {rx.patientAge && <span>• {rx.patientAge} Yrs</span>}
                                                        {rx.patientGender && <span className="uppercase">• {rx.patientGender}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">Dr. {rx.doctorName.replace(/Dr\.\s*/ig, '')}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{rx.doctorSpecialization}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPrescription(rx)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-bold rounded-lg transition-colors text-sm"
                                            >
                                                <Eye className="w-4 h-4" /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Prescription Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-primary" />
                                    Prescription Details
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    Prescribed on {format(new Date(selectedPrescription.date), 'dd MMM yyyy')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPrescription(null)}
                                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient</p>
                                        <p className="font-black text-slate-800 text-lg">{selectedPrescription.patientName}</p>
                                        <p className="text-sm font-medium text-slate-600">
                                            {selectedPrescription.patientAge && `${selectedPrescription.patientAge} Yrs `}
                                            {selectedPrescription.patientGender && `• ${selectedPrescription.patientGender} `}
                                            {selectedPrescription.patientPhone && `• ${selectedPrescription.patientPhone}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
                                        <p className="font-black text-slate-800 text-lg">Dr. {selectedPrescription.doctorName.replace(/Dr\.\s*/ig, '')}</p>
                                        <p className="text-sm font-medium text-slate-600">{selectedPrescription.doctorSpecialization}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Notes */}
                            {(() => {
                                const notes = parseNotes(selectedPrescription.additionalNotes);
                                if (notes.diagnosis || notes.advice) {
                                    return (
                                        <div className="mb-8">
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                Clinical Notes
                                            </h4>
                                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                                                {notes.diagnosis && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</span>
                                                        <p className="font-semibold text-slate-700">{notes.diagnosis}</p>
                                                    </div>
                                                )}
                                                {notes.advice && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Advice</span>
                                                        <div className="font-medium text-slate-600 whitespace-pre-wrap">{notes.advice}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Medicines List */}
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    Prescribed Medicines
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Medicine Name</th>
                                                <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Strength</th>
                                                <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Freq</th>
                                                <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Days</th>
                                                <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider">Instructions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedPrescription.medicines.map((med: Medicine, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-slate-900">{med.name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-600">{med.strength || '-'}</td>
                                                    <td className="px-4 py-3 text-sm font-black text-slate-700">{med.frequency || '-'}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-600">{med.duration || '-'}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-500">{med.notes || '-'}</td>
                                                </tr>
                                            ))}
                                            {(!selectedPrescription.medicines || selectedPrescription.medicines.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm font-medium">
                                                        No medicines listed in this prescription.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
