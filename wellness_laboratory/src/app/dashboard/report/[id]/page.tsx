"use client";

import { use, useState, useEffect, useCallback } from "react";
import { getLabRequestById, updatePatientNameOnReport } from "@/app/actions/lab";
import { Loader2, Printer, ArrowLeft, Download, CheckCircle2, CalendarClock, Pencil, X, Save } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function LabReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingDates, setEditingDates] = useState(false);
    const [collectedAt, setCollectedAt] = useState("");
    const [receivedAt, setReceivedAt] = useState("");
    const [reportedAt, setReportedAt] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [patientName, setPatientName] = useState("");
    const [savingName, setSavingName] = useState(false);

    const toLocalInput = (iso: string | Date) => {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    useEffect(() => {
        const fetchRequest = async () => {
            const res = await getLabRequestById(id);
            if (res.success && res.data) {
                setRequest(res.data);
                setCollectedAt(toLocalInput(res.data.createdAt));
                setReceivedAt(toLocalInput(res.data.createdAt));
                setReportedAt(toLocalInput(res.data.updatedAt));
                setPatientName(res.data.patientName || "");
            }
            setLoading(false);
        };
        fetchRequest();
    }, [id]);

    const handleCancelEdit = useCallback(() => {
        if (request) {
            setCollectedAt(toLocalInput(request.createdAt));
            setReceivedAt(toLocalInput(request.createdAt));
            setReportedAt(toLocalInput(request.updatedAt));
        }
        setEditingDates(false);
    }, [request]);

    const handleSaveName = async () => {
        if (!patientName.trim()) return;
        setSavingName(true);
        const res = await updatePatientNameOnReport(id, patientName.trim());
        if (res.success) {
            setRequest((prev: any) => ({ ...prev, patientName: patientName.trim() }));
            setEditingName(false);
        }
        setSavingName(false);
    };

    const handleCancelNameEdit = () => {
        setPatientName(request?.patientName || "");
        setEditingName(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Generating Report...</p>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black text-slate-900 uppercase">Report Not Found</h2>
                <Link href="/dashboard" className="text-primary font-bold mt-4 inline-block hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-20">
            {/* Header / Controls - Hidden on print */}
            <div className="flex items-center justify-between print:hidden bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Worklist
                </Link>
                <div className="flex gap-3 flex-wrap">
                    {/* Edit Name */}
                    {editingName ? (
                        <>
                            <button
                                onClick={handleCancelNameEdit}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3.5 rounded-2xl font-black text-xs border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSaveName}
                                disabled={savingName}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs border border-emerald-700 hover:bg-emerald-700 transition-all uppercase tracking-widest disabled:opacity-60"
                            >
                                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Name
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditingName(true)}
                            className="flex items-center gap-2 bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl font-black text-xs border border-slate-200 hover:bg-slate-100 transition-all uppercase tracking-widest"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Name
                        </button>
                    )}
                    {/* Edit Dates */}
                    {editingDates ? (
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3.5 rounded-2xl font-black text-xs border border-red-200 hover:bg-red-100 transition-all uppercase tracking-widest"
                        >
                            <X className="w-4 h-4" />
                            Cancel Edit
                        </button>
                    ) : (
                        <button
                            onClick={() => setEditingDates(true)}
                            className="flex items-center gap-2 bg-amber-50 text-amber-700 px-6 py-3.5 rounded-2xl font-black text-xs border border-amber-200 hover:bg-amber-100 transition-all uppercase tracking-widest"
                        >
                            <CalendarClock className="w-4 h-4" />
                            Edit Dates
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
                    >
                        <Printer className="w-5 h-5" />
                        Print Report
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-3 bg-white text-slate-600 px-8 py-3.5 rounded-2xl font-black text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        <Download className="w-5 h-5" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Print Area */}
            <div id="printable-report" className="bg-white relative p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm print:shadow-none print:border-0 print:p-0 print:rounded-none min-h-[1000px] flex flex-col font-sans mb-10 print:bg-transparent">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] print:opacity-[0.1] pointer-events-none z-0 select-none overflow-hidden print:fixed print:inset-0">
                    <img src="/hospital-logo.png" alt="Watermark" className="w-[50%] max-w-[400px] object-contain grayscale-0" />
                </div>

                {/* Polished Header */}
                <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8 px-2">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 flex items-center justify-center p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <img src="/hospital-logo.png" alt="Wellness Hospital Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">Wellness Hospital</h1>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-blue-600 uppercase tracking-[0.15em] leading-none">Laboratory Report</h2>
                            </div>

                        </div>
                    </div>

                    <div className="text-right border-l border-slate-100 pl-6 py-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1">Doddaballapur, Bangalore</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                            Beside friend function hall,<br />
                            Gowribidnur main road,<br />
                            Palanjoghalli - 561203
                        </p>
                        <p className="text-[8px] font-black text-blue-600 mt-2">Mob: +91 81056 66338</p>
                    </div>
                </div>

                {/* Patient Information Grid - Refined Spacing */}
                <div className="grid grid-cols-2 gap-6 mb-8 border border-slate-100 rounded-xl p-6 bg-slate-50/10">
                    <div className="space-y-1.5 border-r border-slate-100 pr-6">
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Patient Name</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            {editingName ? (
                                <>
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={e => setPatientName(e.target.value)}
                                        className="print:hidden font-black text-slate-900 text-[10px] border border-slate-300 rounded px-2 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 uppercase w-48"
                                        autoFocus
                                    />
                                    <span className="hidden print:inline font-black text-slate-900 uppercase">{patientName}</span>
                                </>
                            ) : (
                                <span className="font-black text-slate-900 uppercase">{patientName || request.patientName}</span>
                            )}
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Age/Gender</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-slate-900 uppercase">
                                {request.patient?.dob ? `${new Date().getFullYear() - new Date(request.patient.dob).getFullYear()} Y` : 'N/A'} / {request.patient?.gender || 'N/A'}
                            </span>
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">UHID</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-slate-900 uppercase text-blue-600 font-mono tracking-tighter">{request.patient?.uhid || 'N/A'}</span>
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Visit ID</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-slate-900 uppercase">{request.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Ref. By</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-slate-900 uppercase italic text-blue-800">{request.requestedByName || 'SELF'}</span>
                        </div>
                        {request.patient?.phone && (
                            <div className="flex text-[10px] leading-tight items-baseline">
                                <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Contact No</span>
                                <span className="w-3 font-bold text-slate-400">:</span>
                                <span className="font-black text-slate-900 uppercase">{request.patient.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5 pl-6">
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Barcode No</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-slate-900 font-mono">100{Math.floor(Math.random() * 10000)}</span>
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Collected</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            {editingDates ? (
                                <>
                                    <input
                                        type="datetime-local"
                                        value={collectedAt}
                                        onChange={e => setCollectedAt(e.target.value)}
                                        className="print:hidden font-black text-slate-900 text-[10px] border border-amber-300 rounded px-1 py-0.5 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                    />
                                    <span className="hidden print:inline font-black text-slate-900 uppercase">{collectedAt ? format(new Date(collectedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                                </>
                            ) : (
                                <span className="font-black text-slate-900 uppercase">{collectedAt ? format(new Date(collectedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                            )}
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Received</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            {editingDates ? (
                                <>
                                    <input
                                        type="datetime-local"
                                        value={receivedAt}
                                        onChange={e => setReceivedAt(e.target.value)}
                                        className="print:hidden font-black text-slate-900 text-[10px] border border-amber-300 rounded px-1 py-0.5 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                    />
                                    <span className="hidden print:inline font-black text-slate-900 uppercase">{receivedAt ? format(new Date(receivedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                                </>
                            ) : (
                                <span className="font-black text-slate-900 uppercase">{receivedAt ? format(new Date(receivedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                            )}
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Reported</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            {editingDates ? (
                                <>
                                    <input
                                        type="datetime-local"
                                        value={reportedAt}
                                        onChange={e => setReportedAt(e.target.value)}
                                        className="print:hidden font-black text-slate-900 text-[10px] border border-amber-300 rounded px-1 py-0.5 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                    />
                                    <span className="hidden print:inline font-black text-slate-900 uppercase">{reportedAt ? format(new Date(reportedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                                </>
                            ) : (
                                <span className="font-black text-slate-900 uppercase">{reportedAt ? format(new Date(reportedAt), 'dd/MMM/yyyy HH:mm') : '—'}</span>
                            )}
                        </div>
                        <div className="flex text-[10px] leading-tight items-baseline">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-tight">Status</span>
                            <span className="w-3 font-bold text-slate-400">:</span>
                            <span className="font-black text-emerald-600 uppercase flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> FINAL REPORT
                            </span>
                        </div>
                    </div>
                </div>

                {/* Department Section - Centered above headers per sample */}
                <div className="text-center mb-1">
                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">DEPARTMENT OF {request.department || "BIOCHEMISTRY"}</h3>
                </div>

                {/* Results Table Header */}
                <div className="border-t border-slate-900 pt-2 mb-4">
                    <div className="grid grid-cols-[2fr_100px_150px_100px] gap-16 px-4">
                        <span className="text-[10px] font-black text-slate-900">Test Name</span>
                        <span className="text-[10px] font-black text-slate-900 text-center">Result</span>
                        <span className="text-[10px] font-black text-slate-900 text-center">Bio. Ref. Range</span>
                        <span className="text-[10px] font-black text-slate-900 text-right">Unit</span>
                    </div>
                </div>

                {/* Results Content */}
                <div className="flex-1 px-4">
                    {/* Primary Test Heading and Sample Type */}
                    <div className="mb-4">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase mb-0.5">{request.testName}</h4>
                        <p className="text-[10px] font-bold text-slate-600">Sample Type : Serum</p>
                    </div>

                    <div>
                        {(() => {
                            const paramsArr = Array.isArray(request.parameters)
                                ? request.parameters
                                : request.parameters?.parameters;

                            if (paramsArr && Array.isArray(paramsArr) && paramsArr.length > 0) {
                                let lastGroup: string | null = null;
                                return paramsArr.map((param: any, idx: number) => {
                                    const parts = param.name.split('\n');
                                    const mainName = parts[0];
                                    const hasGroup = param.group && param.group !== lastGroup;
                                    if (param.group) lastGroup = param.group;
                                    const isGrouped = !!param.group;

                                    return (
                                        <div key={idx}>
                                            {/* Group header row */}
                                            {hasGroup && (
                                                <div className="grid grid-cols-[2fr_100px_150px_100px] gap-16 items-center pt-3 pb-1">
                                                    <span className="text-[10px] font-black text-slate-800 uppercase">{param.group}</span>
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            )}
                                            {/* Parameter row (indented if grouped) */}
                                            <div className="grid grid-cols-[2fr_100px_150px_100px] gap-16 items-start py-1">
                                                <span className={cn(
                                                    "text-[10px] font-bold text-slate-700 leading-tight",
                                                    isGrouped && "pl-6"
                                                )}>{mainName}</span>
                                                <div className="text-[11px] font-black text-slate-900 text-center">{param.result}</div>
                                                <div className="text-[10px] font-bold text-slate-900 text-center">{param.refRange}</div>
                                                <div className="text-[10px] font-bold text-slate-500 text-right">{param.unit}</div>
                                            </div>
                                        </div>
                                    );
                                });
                            }

                            return (
                                /* Fallback for legacy simple string results */
                                <div className="text-[10px] font-medium text-slate-600 leading-normal italic border-l-2 border-blue-100 pl-6 h-full bg-slate-50/20 p-4 rounded-r-xl">
                                    {request.result || "Clinical analysis within normal physiological limits. No significant abnormalities detected."}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Report Footer */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="text-center mb-8">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] border px-5 py-0.5 border-slate-100 rounded-full bg-slate-50/50">*** End of Report ***</span>
                    </div>

                    <div className="flex justify-between items-end px-4">
                        {/* Left Side: Preparation Info */}
                        <div className="space-y-1 pb-2">
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">Report Prepared by: <span className="text-blue-700">{request.technicianName || 'NAVEENA'}</span></p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Wellness Hospital Laboratory Services • Bangalore</p>
                        </div>

                        {/* Right Side: Consultant Signature */}
                        <div className="text-right space-y-1.5 pb-2">
                            <div className="flex flex-col items-end gap-1 mb-3">
                                <div className="w-48 h-[1px] bg-gradient-to-l from-slate-400 to-transparent"></div>
                            </div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{request.consultantName || 'Dr. Somashekar K.'}</p>
                            <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest leading-none mb-1">Consultant Pathologist</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.1em]">Reg No: KMC-34928 • MBBS, MD (PATH)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Official Contact Footer - Bottom of UI page */}
            <div className="bg-slate-900 p-10 rounded-[40px] text-center text-white space-y-4 print:hidden">
                <p className="text-[11px] font-black tracking-[0.4em] uppercase">Wellness Hospital - Doddaballapur</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.1em]">Beside friend function hall, Gowribidnur main road, Palanjoghalli, Bangalore - 561203</p>
                <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/5 mt-4">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest underline decoration-blue-500/30 underline-offset-8">Mob : 81056 66338</span>
                    <span className="w-2 h-2 bg-white/10 rounded-full" />
                    <span className="text-[10px] font-black text-white/60 lowercase tracking-widest">wellnesshospital8383@gmail.com</span>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    /* Hide everything by default */
                    body * {
                        visibility: hidden !important;
                    }

                    /* Unhide the report and all its content */
                    #printable-report, #printable-report * {
                        visibility: visible !important;
                    }

                    /* Position the report at the top left and force it to fill the page width */
                    #printable-report {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                    }

                    /* Explicitly hide the Digital ID hash box on print */
                    .print\\:hidden {
                        display: none !important;
                    }

                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                }
            `}</style>
        </div>
    );
}

// Keep the History component as helper
function History({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="m12 7 0 5 3 3" />
        </svg>
    );
}
