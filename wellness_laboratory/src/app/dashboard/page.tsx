"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ClipboardList,
    History,
    Timer,
    Microscope,
    ClipboardCheck,
    ShieldAlert,
    Search,
    Filter,
    ArrowRight,
    Plus,
    Loader2,
    Check,
    X,
    User as UserIcon,
    FileText,
    Printer,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLabRequests, updateLabRequestStatus } from "@/app/actions/lab";
import { format } from "date-fns";
import ManualEntryModal from "@/components/modals/ManualEntryModal";
import ResultEntryModal from "@/components/modals/ResultEntryModal";

export default function LabDashboardPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Modals state
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const res = await getLabRequests();
        if (res.success) {
            setRequests(res.data || []);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const res = await updateLabRequestStatus(id, newStatus);
        if (res.success) {
            fetchRequests();
        }
        setUpdatingId(null);
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === "all" || req.status === filter;
        const matchesSearch = req.patientName.toLowerCase().includes(search.toLowerCase()) ||
            req.testName.toLowerCase().includes(search.toLowerCase()) ||
            req.patient?.uhid?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: "Pending Tests", value: requests.filter(r => r.status === 'pending').length.toString(), icon: Timer, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
        { label: "Processing", value: requests.filter(r => r.status === 'processing').length.toString(), icon: Microscope, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Completed Today", value: requests.filter(r => r.status === 'completed' && format(new Date(r.updatedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length.toString(), icon: ClipboardCheck, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Critical Results", value: requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length.toString(), icon: ShieldAlert, color: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Clinical Dashboard</h1>
                    <p className="text-slate-500 font-medium">Monitoring and processing clinical diagnostic requests.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchRequests}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        disabled={loading}
                    >
                        <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => setIsManualEntryOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider"
                    >
                        <Plus className="w-5 h-5 text-primary" />
                        Direct Accession
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl border transition-all group-hover:scale-110", stat.bg, stat.border)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
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
                            placeholder="Search by Patient Name, ID or Test type..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                            {["all", "pending", "processing", "completed"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Patient Information</th>
                                <th className="px-8 py-5">Diagnostic Test</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Worklist...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">
                                        No requests found matching your criteria.
                                    </td>
                                </tr>
                            ) : filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            #{req.id.slice(0, 8).toUpperCase()}
                                        </span>
                                        {req.priority === 'urgent' && (
                                            <div className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block animate-pulse">
                                                Urgent
                                            </div>
                                        )}
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
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <ArrowRight className="w-3 h-3 text-primary" /> By {req.requestedByName || "Self"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {updatingId === req.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            ) : (
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all outline-none",
                                                        req.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            req.status === 'processing' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                req.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                    "bg-slate-50 text-slate-500 border-slate-100"
                                                    )}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {req.status !== 'completed' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(req);
                                                        setIsResultEntryOpen(true);
                                                    }}
                                                    className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-white hover:shadow-md hover:border-primary/20 border border-transparent rounded-2xl transition-all group-hover:scale-105"
                                                    title="Record Result"
                                                >
                                                    <Microscope className="w-5 h-5" />
                                                </button>
                                            )}
                                            {req.status === 'completed' && (
                                                <Link
                                                    href={`/dashboard/report/${req.id}`}
                                                    className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-md hover:border-emerald-200 border border-transparent rounded-2xl transition-all group-hover:scale-105"
                                                    title="View Report"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ManualEntryModal
                isOpen={isManualEntryOpen}
                onClose={() => setIsManualEntryOpen(false)}
                onSuccess={fetchRequests}
            />

            <ResultEntryModal
                isOpen={isResultEntryOpen}
                onClose={() => {
                    setIsResultEntryOpen(false);
                    setSelectedRequest(null);
                }}
                onSuccess={fetchRequests}
                requestData={selectedRequest}
            />
        </div>
    );
}
