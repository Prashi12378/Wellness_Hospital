"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, User, ChevronRight, FlaskConical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchPatients, createLabRequest } from "@/app/actions/lab";

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManualEntryModal({ isOpen, onClose, onSuccess }: ManualEntryModalProps) {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [patients, setPatients] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [testName, setTestName] = useState("");
    const [department, setDepartment] = useState("General");
    const [priority, setPriority] = useState("normal");
    const [technicianName, setTechnicianName] = useState("NAVEENA");
    const [consultantName, setConsultantName] = useState("Dr. Somashekar K.");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearchQuery("");
            setPatients([]);
            setSelectedPatient(null);
            setTestName("");
            setDepartment("General");
            setPriority("normal");
            setTechnicianName("NAVEENA");
            setConsultantName("Dr. Somashekar K.");
        }
    }, [isOpen]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const res = await searchPatients(searchQuery);
        if (res.success) {
            setPatients(res.data || []);
        }
        setIsSearching(false);
    };

    const handlePatientSelect = (patient: any) => {
        setSelectedPatient(patient);
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!selectedPatient || !testName) return;
        setIsSubmitting(true);
        const res = await createLabRequest({
            patientId: selectedPatient.id,
            patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
            testName,
            department,
            priority,
            technicianName,
            consultantName
        } as any);
        if (res.success) {
            onSuccess();
            onClose();
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Direct Accession</h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            Step {step} of 2: {step === 1 ? "Select Patient" : "Order Details"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by UHID, Name or Email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-900"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {patients.length === 0 && !isSearching ? (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Search for a patient to begin</p>
                                    </div>
                                ) : (
                                    patients.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handlePatientSelect(p)}
                                            className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-primary/30 hover:shadow-md hover:bg-slate-50/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-900 uppercase">{p.firstName} {p.lastName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.uhid} • {p.gender}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-900 rounded-[32px] text-white flex items-center gap-4 shadow-xl">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Selected Patient</p>
                                    <p className="text-lg font-black uppercase leading-tight">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                    <p className="text-xs font-bold text-white/70">{selectedPatient?.uhid}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="General">General</option>
                                            <option value="Haematology">Haematology</option>
                                            <option value="Biochemistry">Biochemistry</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Serology">Serology</option>
                                            <option value="Clinical Pathology">Clinical Pathology</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnostic Test Name</label>
                                    <div className="relative group">
                                        <FlaskConical className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={testName}
                                            onChange={(e) => setTestName(e.target.value)}
                                            placeholder="e.g. CBC, Liver Function Test, etc."
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {/* New: Technician and Consultant Selection */}
                                <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technician</label>
                                        <input
                                            type="text"
                                            value={technicianName}
                                            onChange={(e) => setTechnicianName(e.target.value)}
                                            placeholder="Technician Name"
                                            className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultant</label>
                                        <input
                                            type="text"
                                            value={consultantName}
                                            onChange={(e) => setConsultantName(e.target.value)}
                                            placeholder="Doctor Name"
                                            className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!testName || isSubmitting}
                                    className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Order"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
