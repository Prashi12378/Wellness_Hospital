'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function HistoryPage() {
    const supabase = createClient();
    const [logs, setLogs] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const request = supabase
                .from('pharmacy_logs')
                .select('*, medicines(name), performed_by_profile:profiles!performed_by(full_name)')
                .order('created_at', { ascending: false })
                .limit(50);

            const { data } = await request;
            if (data) setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-6 h-6 text-primary-light" />
                            Dispense History
                        </h1>
                        <p className="text-slate-500">Track all medicine movements and fulfillments</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Medicine</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Performed By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading history...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No records found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {log.medicines?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${log.action === 'RESTOCK'
                                                ? 'bg-primary-light/10 text-primary-light'
                                                : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {log.performed_by_profile?.full_name || 'System'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
