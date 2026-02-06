'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PrescriptionsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchCompletedAppointments();
    }, []);

    const fetchCompletedAppointments = async () => {
        try {
            // Fetch appointments that are completed or where a prescription might be needed
            // Ideally we fetch recently completed appointments
            // For now, fetching all relevant appointments
            const { data: { user } } = await supabase.auth.getUser();

            // This is a client-side fetch for now, can be optimized with server actions later
            const response = await fetch(`/api/doctor/appointments?status=completed`);
            // Ideally we use a server action here but reusing existing patterns if API exists
            // If no API, we fall back to a direct prisma call via server component? 
            // Let's stick to client pattern used elsewhere or use a new server action.
            // Given the context, I'll use a placeholder empty state or mock fetch for the UI first.

            // MOCK DATA for layout structure first
            setAppointments([
                { id: '1', patient: { firstName: 'John', lastName: 'Doe', uhid: 'UHID123' }, date: new Date(), status: 'completed' },
                { id: '2', patient: { firstName: 'Jane', lastName: 'Smith', uhid: 'UHID456' }, date: new Date(), status: 'completed' }
            ]);

            setLoading(false);

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
                    <p className="text-slate-500">Manage and write patient prescriptions</p>
                </div>
                {/* 
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    <Plus className="w-4 h-4" /> New Prescription
                </button>
                */}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700">Recent Patients</h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {/* 
                     Real implementation needs to fetch completed appointments.
                     For now, redirecting user to My Appointments as the main entry point is safer 
                     until we build a dedicated "Patient Selector" for prescriptions.
                     */}

                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Write a New Prescription</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            To write a prescription, please select a patient from your appointments list.
                        </p>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors">
                            Go to Appointments <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
