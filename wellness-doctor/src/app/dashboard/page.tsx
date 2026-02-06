'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getDoctorAppointments } from '@/app/actions/appointments';

export default function AppointmentsPage() {
    // const supabase = createClient(); // Use Server Action instead
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await getDoctorAppointments();

            if (error) {
                setError(error);
                setAppointments([]);
            } else {
                setAppointments(data || []);
            }

        } catch (err: any) {
            setError(err.message);
            setAppointments([]); // Clear on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                    <p className="text-slate-500">Today's Appointments</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">{format(new Date(), 'EEEE, MMMM do')}</p>
                    <p className="text-sm text-slate-500 text-right">Today</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 text-sm mb-1">Pending</div>
                    <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 text-sm mb-1">Completed</div>
                    <div className="text-2xl font-bold text-emerald-600">0</div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}



            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-800">Upcoming Patients</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading schedule...</div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-800 font-medium">No appointments scheduled</h3>
                        <p className="text-slate-500 text-sm mt-1">Enjoy your free time!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="p-4 md:p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase tracking-wide">
                                            {apt.appointment_time || format(new Date(apt.appointment_date), 'h:mm a')}
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">#{apt.id.slice(0, 6)}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">
                                        {apt.patient_name || 'Unknown Patient'}
                                    </h3>
                                    <p className="text-slate-500 text-sm flex items-center gap-4 mt-1">
                                        {apt.department && <span className="flex items-center gap-1 font-medium text-blue-600">{apt.department}</span>}
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {apt.patient_phone || 'N/A'}</span>
                                        {apt.reason && <span>• Reason: {apt.reason}</span>}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {apt.status === 'completed' && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                        </span>
                                    )}
                                    <Link
                                        href={`/dashboard/consultation/${apt.id}`}
                                        className={`px-6 py-2.5 font-medium rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-2 ${apt.status === 'completed'
                                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                                            : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                                            }`}
                                    >
                                        {apt.status === 'completed' ? 'Edit / Print Rx' : 'Start Consult'}
                                        {apt.status !== 'completed' && <ArrowRight className="w-4 h-4" />}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
