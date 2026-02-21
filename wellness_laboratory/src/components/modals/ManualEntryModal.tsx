"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, User, ChevronRight, FlaskConical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchPatients, createLabRequest } from "@/app/actions/lab";
import { searchLabTests, SearchResult } from "@/lib/labTests";

interface TestEntry {
    name: string;
    department: string;
    priority: string;
}

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

    // Multi-test state
    const [tests, setTests] = useState<TestEntry[]>([]);
    const [currentTestName, setCurrentTestName] = useState("");
    const [currentDepartment, setCurrentDepartment] = useState("General");
    const [currentPriority, setCurrentPriority] = useState("normal");

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Shared fields
    const [technicianName, setTechnicianName] = useState("NAVEENA");
    const [consultantName, setConsultantName] = useState("Dr. Somashekar K.");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const testInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearchQuery("");
            setPatients([]);
            setSelectedPatient(null);
            setTests([]);
            setCurrentTestName("");
            setCurrentDepartment("General");
            setCurrentPriority("normal");
            setTechnicianName("NAVEENA");
            setConsultantName("Dr. Somashekar K.");
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    // Autocomplete handlers
    const handleTestNameChange = (value: string) => {
        setCurrentTestName(value);
        if (value.trim().length > 0) {
            const results = searchLabTests(value);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setHighlightedSuggestion(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (result: SearchResult) => {
        const name = result.name;

        setCurrentTestName(name);
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedSuggestion(-1);

        // Auto-add the test
        if (name && !tests.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            setTests(prev => [...prev, {
                name,
                department: currentDepartment,
                priority: currentPriority,
            }]);
            setCurrentTestName("");
            setTimeout(() => testInputRef.current?.focus(), 50);
        }
    };

    const handleTestInputKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedSuggestion(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedSuggestion(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedSuggestion >= 0 && highlightedSuggestion < suggestions.length) {
                    selectSuggestion(suggestions[highlightedSuggestion]);
                } else {
                    addTest();
                }
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            addTest();
        }
    };

    const addTest = () => {
        const name = currentTestName.trim();
        if (!name) return;
        // Prevent duplicate test names
        if (tests.some(t => t.name.toLowerCase() === name.toLowerCase())) return;
        setTests([...tests, {
            name,
            department: currentDepartment,
            priority: currentPriority,
        }]);
        setCurrentTestName("");
        setSuggestions([]);
        setShowSuggestions(false);
        setTimeout(() => testInputRef.current?.focus(), 50);
    };

    const removeTest = (index: number) => {
        setTests(tests.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedPatient || tests.length === 0) return;
        setIsSubmitting(true);
        try {
            for (const test of tests) {
                await createLabRequest({
                    patientId: selectedPatient.id,
                    patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
                    testName: test.name,
                    department: test.department,
                    priority: test.priority,
                    technicianName,
                    consultantName,
                } as any);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating lab requests:", err);
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Direct Accession</h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                            Step {step} of 2: {step === 1 ? "Select Patient" : "Add Tests"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
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
                        <div className="space-y-6">
                            {/* Selected Patient Info */}
                            <div className="p-5 bg-slate-900 rounded-[28px] text-white flex items-center gap-4 shadow-xl">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Selected Patient</p>
                                    <p className="text-base font-black uppercase leading-tight">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                    <p className="text-xs font-bold text-white/70">{selectedPatient?.uhid}</p>
                                </div>
                            </div>

                            {/* Add Test Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add Diagnostic Tests</label>

                                {/* Test Name Input with Autocomplete */}
                                <div className="space-y-3 p-5 bg-slate-50/50 rounded-[28px] border border-slate-100">
                                    <div className="relative" ref={dropdownRef}>
                                        <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                        <input
                                            ref={testInputRef}
                                            type="text"
                                            value={currentTestName}
                                            onChange={(e) => handleTestNameChange(e.target.value)}
                                            onKeyDown={handleTestInputKeyDown}
                                            onFocus={() => {
                                                if (suggestions.length > 0) setShowSuggestions(true);
                                            }}
                                            placeholder="e.g. CBC, LFT, RFT, Lipid Profile..."
                                            className="w-full pl-12 pr-14 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                                        />
                                        <button
                                            onClick={addTest}
                                            disabled={!currentTestName.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 z-10"
                                            title="Add test"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>

                                        {/* Autocomplete Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                {suggestions.map((result, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => selectSuggestion(result)}
                                                        onMouseEnter={() => setHighlightedSuggestion(idx)}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0",
                                                            highlightedSuggestion === idx
                                                                ? "bg-blue-50"
                                                                : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black uppercase shrink-0",
                                                            result.type === "profile"
                                                                ? "bg-blue-100 text-blue-600"
                                                                : "bg-emerald-100 text-emerald-600"
                                                        )}>
                                                            {result.type === "profile" ? "P" : "T"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-slate-800 uppercase truncate">{result.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 truncate">
                                                                {result.type === "profile" && result.profile
                                                                    ? `${result.category} • ${result.profile.parameters.length} parameters`
                                                                    : result.type === "test" && result.test
                                                                        ? `${result.category} • ${result.test.unit} • ${result.test.refRange}`
                                                                        : ""}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={currentDepartment}
                                            onChange={(e) => setCurrentDepartment(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs appearance-none cursor-pointer"
                                        >
                                            <option value="General">General</option>
                                            <option value="Haematology">Haematology</option>
                                            <option value="Biochemistry">Biochemistry</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Serology">Serology</option>
                                            <option value="Clinical Pathology">Clinical Pathology</option>
                                        </select>
                                        <select
                                            value={currentPriority}
                                            onChange={(e) => setCurrentPriority(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs appearance-none cursor-pointer"
                                        >
                                            <option value="normal">Normal Priority</option>
                                            <option value="urgent">Urgent Priority</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Added Tests List */}
                                {tests.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            {tests.length} Test{tests.length > 1 ? "s" : ""} Added
                                        </p>
                                        <div className="space-y-2">
                                            {tests.map((test, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-[10px] font-black">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 uppercase">{test.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {test.department} • {test.priority === "urgent" ? "🔴 Urgent" : "Normal"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeTest(idx)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        title="Remove test"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Technician and Consultant */}
                            <div className="grid grid-cols-2 gap-4 p-5 bg-blue-50/30 rounded-[28px] border border-blue-100/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technician</label>
                                    <input
                                        type="text"
                                        value={technicianName}
                                        onChange={(e) => setTechnicianName(e.target.value)}
                                        placeholder="Technician Name"
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultant</label>
                                    <input
                                        type="text"
                                        value={consultantName}
                                        onChange={(e) => setConsultantName(e.target.value)}
                                        placeholder="Doctor Name"
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-xs"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={tests.length === 0 || isSubmitting}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        `Create ${tests.length} Test Order${tests.length > 1 ? "s" : ""}`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
