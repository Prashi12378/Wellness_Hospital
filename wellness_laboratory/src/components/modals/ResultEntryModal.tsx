"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, CheckCircle2, Upload, FlaskConical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateLabRequestStatus } from "@/app/actions/lab";

interface ResultEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    requestData: any;
}

export default function ResultEntryModal({ isOpen, onClose, onSuccess, requestData }: ResultEntryModalProps) {
    const [parameters, setParameters] = useState<any[]>([{ name: "", result: "", unit: "", refRange: "" }]);
    const [reportUrl, setReportUrl] = useState("");
    const [technicianName, setTechnicianName] = useState("NAVEENA");
    const [consultantName, setConsultantName] = useState("Dr. Somashekar K.");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && requestData) {
            const existingParams = Array.isArray(requestData.parameters)
                ? requestData.parameters
                : requestData.parameters?.parameters;

            if (existingParams && Array.isArray(existingParams)) {
                setParameters(existingParams);
            } else {
                setParameters([{ name: "", result: "", unit: "", refRange: "" }]);
            }
            setReportUrl(requestData.reportUrl || "");
            setTechnicianName(requestData.technicianName || "NAVEENA");
            setConsultantName(requestData.consultantName || "Dr. Somashekar K.");
        }
    }, [isOpen, requestData]);

    const addParameter = () => {
        setParameters([...parameters, { name: "", result: "", unit: "", refRange: "" }]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateParameter = (index: number, field: string, value: string) => {
        const newParameters = [...parameters];
        newParameters[index] = { ...newParameters[index], [field]: value };
        setParameters(newParameters);
    };

    const handleSubmit = async () => {
        if (!requestData) return;
        setIsSubmitting(true);
        // Filter out empty rows
        const validParams = parameters.filter(p => p.name.trim() !== "");
        const res = await updateLabRequestStatus(requestData.id, "completed", "", reportUrl, {
            parameters: validParams,
            technicianName,
            consultantName
        });
        if (res.success) {
            onSuccess();
            onClose();
        }
        setIsSubmitting(false);
    };

    if (!isOpen || !requestData) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Diagnostic Result</h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            Order ID: #{requestData.id.slice(0, 8).toUpperCase()} • {requestData.department || "General"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Patient</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">{requestData.patientName}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500">UHID: {requestData.patient?.uhid}</p>
                                <p className="text-xs font-bold text-slate-500">Gender: {requestData.patient?.gender}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white/10 rounded-xl text-primary">
                                    <FlaskConical className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Diagnostic Test</p>
                                    <p className="text-sm font-black uppercase text-primary tracking-tight">{requestData.testName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                                    requestData.priority === 'urgent' ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white/50"
                                )}>
                                    {requestData.priority} Priority
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Technician and Consultant Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/50">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lab Technician (Prepared By)</label>
                                <input
                                    type="text"
                                    value={technicianName}
                                    onChange={(e) => setTechnicianName(e.target.value)}
                                    placeholder="Enter Technician's Name"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultant Pathologist</label>
                                <input
                                    type="text"
                                    value={consultantName}
                                    onChange={(e) => setConsultantName(e.target.value)}
                                    placeholder="Enter Doctor's Name"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structured Test Parameters</label>
                                <button
                                    onClick={addParameter}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Row
                                </button>
                            </div>

                            <div className="space-y-4">
                                {parameters.map((param, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_120px_100px_1fr_40px] gap-4 items-end bg-slate-50/50 p-6 rounded-[28px] border border-slate-100/50 animate-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parameter Name</label>
                                            <input
                                                type="text"
                                                value={param.name}
                                                onChange={(e) => updateParameter(index, "name", e.target.value)}
                                                placeholder="e.g. Haemoglobin"
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Result</label>
                                            <input
                                                type="text"
                                                value={param.result}
                                                onChange={(e) => updateParameter(index, "result", e.target.value)}
                                                placeholder="Value"
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                                            <input
                                                type="text"
                                                value={param.unit}
                                                onChange={(e) => updateParameter(index, "unit", e.target.value)}
                                                placeholder="g/dL"
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Range</label>
                                            <input
                                                type="text"
                                                value={param.refRange}
                                                onChange={(e) => updateParameter(index, "refRange", e.target.value)}
                                                placeholder="13.0 - 17.0"
                                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                            />
                                        </div>
                                        {parameters.length > 1 && (
                                            <button
                                                onClick={() => removeParameter(index)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mb-0.5"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Report Attachment Link (Optional)</label>
                            <div className="relative group">
                                <Upload className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={reportUrl}
                                    onChange={(e) => setReportUrl(e.target.value)}
                                    placeholder="e.g. cloud-storage.com/report.pdf"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-5 bg-white text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (parameters.length === 1 && !parameters[0].name)}
                            className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl h-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Finalize Result
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
