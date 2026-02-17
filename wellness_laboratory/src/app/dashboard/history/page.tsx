"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    CheckCircle2,
    Loader2,
    User as UserIcon,
    Printer,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLabRequests } from "@/app/actions/lab";
import { format } from "date-fns";

export default function ResultsArchivePage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const res = await getLabRequests();
        if (res.success) {
            // Filter only completed
            const history = (res.data || []).filter((r: any) => r.status === 'completed');
            setRequests(history);
        }
        setLoading(false);
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.patientName.toLowerCase().includes(search.toLowerCase()) ||
            req.testName.toLowerCase().includes(search.toLowerCase()) ||
            req.patient?.uhid?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Results Archive</h1>
                    <p className="text-slate-500 font-medium">Access and review all completed clinical diagnostic reports.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm self-start"
                    disabled={loading}
                >
                    <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
                </button>
            </div>

            {/* Main Worklist Area */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search clinical archives..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-8 py-5">Archive ID</th>
                                <th className="px-8 py-5">Patient Information</th>
                                <th className="px-8 py-5">Diagnostic Test</th>
                                <th className="px-8 py-5">Completion Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Archives...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">
                                        No archived results found.
                                    </td>
                                </tr>
                            ) : filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            #{req.id.slice(0, 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{req.patientName}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {req.patient?.gender || 'N/A'} • {req.patient?.uhid || 'OPD'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm inline-block min-w-[180px]">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{req.testName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                By {req.requestedByName || "Self"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                                {format(new Date(req.updatedAt), 'MMM dd, yyyy • HH:mm')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/dashboard/report/${req.id}`}
                                                className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-md hover:border-emerald-200 border border-transparent rounded-2xl transition-all group-hover:scale-105"
                                                title="View Report"
                                            >
                                                <Printer className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/dashboard/report/${req.id}`}
                                                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-white hover:shadow-md hover:border-blue-200 border border-transparent rounded-2xl transition-all group-hover:scale-105"
                                                title="Full Analysis"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
