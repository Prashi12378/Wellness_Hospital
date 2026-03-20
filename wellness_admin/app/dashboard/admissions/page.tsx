'use client';

import { useState, useEffect } from 'react';
import { Search, Bed, Filter, CheckCircle2, Lock, Unlock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AdmissionsPage() {
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ipd/admissions');
            if (res.ok) {
                const result = await res.json();
                setAdmissions(result || []);
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = async (admissionId: string, currentStatus: boolean) => {
        setActionLoadingId(admissionId);
        try {
            const res = await fetch(`/api/ipd/admissions/${admissionId}/unlock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ editUnlocked: !currentStatus })
            });
            if (res.ok) {
                fetchAdmissions();
            } else {
                alert('Failed to update lock status');
            }
        } catch (error) {
            alert('Failed to update lock status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredAdmissions = admissions.filter(adm => {
        const name = `${adm.patient?.firstName} ${adm.patient?.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Bed className="w-8 h-8 text-primary" />
                        IPD Admissions
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage IPD records and discharge summary locks</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Bed/Ward</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <p className="text-slate-500 font-medium">Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                        <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-lg font-semibold text-slate-700">No admissions found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmissions.map((adm) => (
                                    <tr key={adm.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{adm.patient?.firstName} {adm.patient?.lastName}</p>
                                                    <p className="text-xs text-slate-500">ID: {adm.id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-600">
                                                In: {format(new Date(adm.admissionDate), 'dd MMM yyyy')}
                                            </p>
                                            {adm.dischargeDate && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Out: {format(new Date(adm.dischargeDate), 'dd MMM yyyy')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {adm.ward || '-'} / {adm.bedNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border
                                                ${adm.status === 'discharged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                                            >
                                                {adm.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            {adm.status === 'discharged' ? (
                                                <button
                                                    onClick={() => handleToggleLock(adm.id, adm.editUnlocked)}
                                                    disabled={actionLoadingId === adm.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-lg transition-colors text-xs ${adm.editUnlocked ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                    title={adm.editUnlocked ? "Lock Discharge Summary" : "Unlock Discharge Summary"}
                                                >
                                                    {actionLoadingId === adm.id ? (
                                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                                    ) : adm.editUnlocked ? (
                                                        <><Unlock className="w-4 h-4" /> Unlocked</>
                                                    ) : (
                                                        <><Lock className="w-4 h-4" /> Locked</>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">In Progress</span>
                                            )}
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
