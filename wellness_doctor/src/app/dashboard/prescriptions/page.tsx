'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PrescriptionsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { data: session } = useSession();

    useEffect(() => {
        fetchCompletedAppointments();
    }, []);

    const fetchCompletedAppointments = async () => {
        try {
            // Mock data or fetch from API
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
