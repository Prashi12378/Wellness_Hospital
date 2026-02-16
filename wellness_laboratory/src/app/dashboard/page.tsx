"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    ArrowRight,
    FlaskConical,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LabDashboardPage() {
    const [filter, setFilter] = useState("all");

    const stats = [
        { label: "Pending Tests", value: "12", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Completed Today", value: "48", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Critical Results", value: "3", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        { label: "Active Samples", value: "24", icon: FlaskConical, color: "text-blue-600", bg: "bg-blue-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Overview</h1>
                    <p className="text-slate-500">Manage test requests and sample processing.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="w-5 h-5" />
                    New Test Registration
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Patient ID, Name or Test type..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                            {["all", "pending", "processing", "completed"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all",
                                        filter === f ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Request ID</th>
                                <th className="px-6 py-4">Patient Details</th>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Requested By</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-400 font-mono">#LAB-0{item}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 uppercase">John Doe</span>
                                            <span className="text-xs text-slate-400">32M • #PID-8329</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wide">
                                            Complete Blood Count (CBC)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 font-medium">Dr. Smithers</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all group-hover:translate-x-1">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
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
