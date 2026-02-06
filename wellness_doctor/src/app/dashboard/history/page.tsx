'use client';

import { useState, useEffect } from 'react';
import { getConsultationHistory } from '@/app/actions/consultation';
import Link from 'next/link';
import { Search, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const { appointments: data, error } = await getConsultationHistory();
            if (data) {
                setAppointments(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    // Filter Logic
    const filteredAppointments = appointments.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient History</h1>
                    <p className="text-slate-500 mt-1">View past consultations and prescriptions</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading history...</div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Records Found</h3>
                        <p className="text-slate-500">
                            {searchTerm ? `No results for "${searchTerm}"` : "No completed consultations yet."}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reason / Diagnosis</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAppointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {apt.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{apt.patientName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {apt.patientAge ? `${apt.patientAge} Years` : ''}
                                                    {apt.patientGender ? ` • ${apt.patientGender}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium">
                                                {format(new Date(apt.date), 'dd MMM yyyy, hh:mm a')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-700 font-medium truncate max-w-xs">
                                            {apt.reason || 'Routine Checkup'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/consultation/${apt.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                                        >
                                            <FileText className="w-4 h-4" /> View Rx
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
