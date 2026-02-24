'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Printer,
    ArrowLeft,
    Loader2,
    Hospital,
    User,
    Calendar,
    Stethoscope,
    FlaskConical,
    Scissors,
    ReceiptText,
    ShieldCheck,
    Phone,
    MapPin,
    Activity,
    RotateCcw
} from 'lucide-react';
import { getAdmissionDetails, undoDischarge } from '@/app/actions/ipd';
import { format } from 'date-fns';

export default function DischargeSummaryPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [admission, setAdmission] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Formatting Preferences State
    const [marker, setMarker] = useState<'bullet' | 'hyphen' | 'none'>('bullet');
    const [casing, setCasing] = useState<'sentence' | 'upper' | 'original'>('sentence');
    const [alignment, setAlignment] = useState<'left' | 'justify'>('left');
    const [fullStop, setFullStop] = useState(true);
    const [pageBreaks, setPageBreaks] = useState<string[]>(['medication']); // Default break before medication
    const [showPageView, setShowPageView] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await getAdmissionDetails(id);
            if (res.success) setAdmission(res.admission);
            setIsLoading(false);
        };
        fetchDetails();

        // Load preferences from localStorage
        const savedPrefs = localStorage.getItem('discharge_summary_prefs');
        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                if (prefs.marker) setMarker(prefs.marker);
                if (prefs.casing) setCasing(prefs.casing);
                if (prefs.alignment) setAlignment(prefs.alignment);
                if (typeof prefs.fullStop === 'boolean') setFullStop(prefs.fullStop);
                if (Array.isArray(prefs.pageBreaks)) setPageBreaks(prefs.pageBreaks);
                if (typeof prefs.showPageView === 'boolean') setShowPageView(prefs.showPageView);
            } catch (e) {
                console.error("Failed to load preferences", e);
            }
        }
    }, [id]);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('discharge_summary_prefs', JSON.stringify({ marker, casing, alignment, fullStop, pageBreaks, showPageView }));
    }, [marker, casing, alignment, fullStop, pageBreaks, showPageView]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Discharge Summary...</p>
        </div>
    );

    if (!admission) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-black text-slate-800">Record Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 text-primary font-bold">Go Back</button>
        </div>
    );

    const totalBill = admission.charges?.reduce((acc: number, c: any) => acc + Number(c.amount), 0) || 0;

    const handleUndoDischarge = async () => {
        if (!confirm("Are you sure you want to DELETE this discharge summary and REVERT the patient's status to 'admitted'? This will clear all discharge fields.")) return;

        setIsLoading(true);
        const res = await undoDischarge(id);
        if (res.success) {
            router.push(`/dashboard/ipd/${id}`);
        } else {
            alert(res.error || "Failed to undo discharge");
            setIsLoading(false);
        }
    };

    // Helper to format clinical text based on user preferences
    const formatClinicalText = (text: string | null) => {
        if (!text) return null;

        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                let current = line.trim();

                // Casing logic
                if (casing === 'sentence') {
                    current = current.charAt(0).toUpperCase() + current.slice(1).toLowerCase();
                } else if (casing === 'upper') {
                    current = current.toUpperCase();
                }

                // Full stop logic
                if (fullStop) {
                    if (current.length > 0 && !current.endsWith('.') && !current.endsWith('?') && !current.endsWith('!')) {
                        current += '.';
                    }
                }

                return current;
            });
    };

    const markerChar = marker === 'bullet' ? '•' : marker === 'hyphen' ? '-' : '';

    // Helper component for sections with optional page breaks
    const SectionContainer = ({ id, label, children }: { id: string; label?: string; children: React.ReactNode }) => {
        const hasBreak = pageBreaks.includes(id);
        const toggleBreak = () => {
            setPageBreaks(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
        };

        return (
            <div className={`relative group ${hasBreak ? "break-before-page pt-8" : ""}`}>
                {/* Visual Break Indicator (Web Only) */}
                {hasBreak && showPageView && (
                    <div className="print:hidden my-20 flex flex-col items-center gap-4 select-none">
                        <div className="w-full h-[1px] bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2 bg-slate-50 px-8 py-2.5 rounded-full border border-slate-200/50 shadow-inner">
                            &mdash; Next Sheet Starts Below &mdash;
                        </span>
                        <div className="w-full h-[1px] bg-slate-200" />
                    </div>
                )}

                {/* Inline Toggle Button (Web Only - Visible on Hover or if Active) */}
                <button
                    onClick={toggleBreak}
                    title={hasBreak ? "Remove Page Break" : "Start on New Page"}
                    className={`print:hidden absolute -left-12 top-0 p-2 rounded-xl transition-all z-20 ${hasBreak ? 'bg-primary text-white shadow-lg opacity-100 scale-100' : 'bg-slate-50 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-100'}`}
                >
                    <Scissors className="w-4 h-4" />
                </button>

                <div className={hasBreak && showPageView ? "bg-white p-12 shadow-2xl border border-slate-200 min-h-[600px] -mx-8 relative print:p-0 print:shadow-none print:border-none print:min-h-0 print:m-0" : ""}>
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[800px] mx-auto py-12 px-8 space-y-6 mb-20 print:max-w-none print:p-0 print:m-0 print:space-y-4">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
                <button onClick={() => router.back()} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleUndoDischarge}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-[20px] font-black hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2 border border-red-100"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Undo Discharge
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/ipd/${id}?edit=true`)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-[20px] font-black shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Activity className="w-5 h-5 text-primary" />
                        Edit Summary
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-primary text-white rounded-[20px] font-black shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        Print Summary
                    </button>
                </div>
            </div>

            {/* NEW: Formatting Controls Panel (Hidden on Print) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Formatting Controls
                    </h3>
                    <button
                        onClick={() => setShowPageView(!showPageView)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${showPageView ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                    >
                        <Hospital className="w-3.5 h-3.5" />
                        Page View: {showPageView ? 'ON' : 'OFF'}
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* List Marker */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Marker Type</label>
                        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {(['bullet', 'hyphen', 'none'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMarker(m)}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${marker === m ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {m === 'bullet' ? '•' : m === 'hyphen' ? '-' : 'None'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Casing */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Text Casing</label>
                        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {(['sentence', 'upper', 'original'] as const).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCasing(c)}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${casing === c ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {c === 'sentence' ? 'Aa' : c === 'upper' ? 'AA' : 'Ab'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Alignment</label>
                        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {(['left', 'justify'] as const).map((a) => (
                                <button
                                    key={a}
                                    onClick={() => setAlignment(a)}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${alignment === a ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {a.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Full Stop Toggle */}
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Punctuation</label>
                        <button
                            onClick={() => setFullStop(!fullStop)}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all border ${fullStop ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                        >
                            {fullStop ? 'AUTO FULL STOP: ON' : 'AUTO FULL STOP: OFF'}
                        </button>
                    </div>
                </div>

                {/* NEW: Page Breaks Toggles */}
                <div className="pt-4 border-t border-slate-50">
                    <label className="text-[11px] font-bold text-slate-500 uppercase mb-2 block">Force New Page Before Section:</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'diagnoses', label: 'Diagnoses' },
                            { id: 'symptoms', label: 'Symptoms' },
                            { id: 'findings', label: 'Findings' },
                            { id: 'investigations', label: 'Investigations' },
                            { id: 'hospitalCourse', label: 'Course' },
                            { id: 'medication', label: 'Medication' },
                            { id: 'condition', label: 'Condition' },
                            { id: 'advice', label: 'Advice' },
                            { id: 'note', label: 'Note/Review' }
                        ].map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setPageBreaks(prev =>
                                        prev.includes(section.id)
                                            ? prev.filter(id => id !== section.id)
                                            : [...prev, section.id]
                                    );
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border overflow-hidden ${pageBreaks.includes(section.id) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20 scale-[1.05]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                            >
                                <Scissors className={`w-3 h-3 ${pageBreaks.includes(section.id) ? 'text-white/80' : 'text-slate-300'}`} />
                                {section.label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Blue buttons indicate a page break will be inserted exactly before that section.
                    </p>
                </div>
            </div>

            {/* Professional Discharge Summary (Printable) */}
            <div
                className="bg-white p-8 shadow-sm border border-slate-200 text-slate-900 leading-relaxed print:shadow-none print:border-none print:p-0 print:m-0"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >

                {/* Hospital Header (Centered matching User Mockup) */}
                <div className="text-center mb-6">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-4">
                            {/* Official Hospital Logo - Reduced Size */}
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/logo.png" alt="Wellness Hospital Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase">Wellness Hospital</h1>
                        </div>

                        <div className="text-[12px] text-slate-900 font-bold leading-relaxed max-w-lg">
                            <p>Beside friend function hall, Gowribidnur main road, Palanjoghalli,</p>
                            <p>Doddaballapur - 561203, Karnataka, India</p>
                            <p className="mt-1 font-bold text-slate-900 tabular-nums uppercase">Tel: +91 8105666338 | E-mail: wellnesshospital8383@gmail.com</p>
                        </div>
                    </div>

                    <div className="py-2 border-y-[1.5px] border-slate-900 mt-6">
                        <h2 className="text-2xl font-black text-slate-900 uppercase">Discharge Summary</h2>
                    </div>
                </div>

                {/* Patient Information Grid (Formal Alphanumeric Styling) */}
                <div className="grid grid-cols-10 gap-x-4 gap-y-4 text-[14px] mb-6 pb-4 border-b border-slate-900 tabular-nums">
                    {/* Row 1 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap">Patient's Name:</span>
                        <span className="font-bold text-slate-950 truncate uppercase">{admission.patient.firstName} {admission.patient.lastName}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Age:</span>
                        <span className="font-medium text-[13px]">{admission.patient.dob ? (new Date().getFullYear() - new Date(admission.patient.dob).getFullYear()) : '--'}</span>
                        <span className="text-[11px] font-bold ml-1 uppercase">YRS</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Sex:</span>
                        <span className="font-medium text-[13px] uppercase">{admission.patient.gender || '--'}</span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap">Consultant:</span>
                        <span className="font-bold text-slate-950 truncate uppercase">Dr. {admission.primaryDoctor?.firstName} {admission.primaryDoctor?.lastName}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">IP.NO:</span>
                        <span className="font-medium text-[13px]">{admission.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Ward:</span>
                        <span className="font-medium text-[13px] uppercase">{admission.ward || '--'}</span>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap uppercase">UHID:</span>
                        <span className="font-medium text-[13px]">{admission.patient.uhid}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden whitespace-nowrap">
                        <span className="font-bold shrink-0 mr-2">Adm. On:</span>
                        <span className="font-medium text-[13px]">{format(new Date(admission.admissionDate), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden whitespace-nowrap">
                        <span className="font-bold shrink-0 mr-2">Disc. On:</span>
                        <span className="font-medium text-[13px]">{admission.dischargeDate ? format(new Date(admission.dischargeDate), 'dd/MM/yyyy') : '--/--/----'}</span>
                    </div>
                </div>

                <div className="space-y-6 text-[14px] tabular-nums leading-relaxed">
                    <SectionContainer id="diagnoses" label="Diagnoses">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Diagnoses:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.diagnoses)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500 italic font-medium">No diagnoses recorded.</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="symptoms" label="Presenting Symptoms">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Presenting Symptoms:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.presentingSymptoms)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500">—</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="findings" label="Physical Findings">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Physical Findings:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.physicalFindings)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500">—</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="investigations" label="Investigations">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Investigations:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.investigations || "All Reports Enclosed")?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="hospitalCourse" label="Course in the Hospital">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Course in the Hospital:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.hospitalCourse)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500">—</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="medication" label="Medication">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Medication:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.dischargeMedication)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500">—</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="condition" label="Condition on Discharge">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Condition on Discharge:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.dischargeCondition || "Satisfactory")?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="advice" label="Advise on Discharge">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Advise on Discharge:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.dischargeAdvice)?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                )) || <p className="text-slate-500">—</p>}
                            </div>
                        </section>
                    </SectionContainer>

                    <SectionContainer id="note" label="Note and Review">
                        <section>
                            <h3 className="font-bold text-[14px] underline mb-1">Note and Review:</h3>
                            <div className="pl-6 space-y-2">
                                {formatClinicalText(admission.noteAndReview || "REVIEW AFTER 1 WEEK IN OPD WITH PRIOR APPOINTMENT TO DR. PUSHPA")?.map((point, i) => (
                                    <div key={i} className={`flex gap-2 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                                        {markerChar && point.length < 150 && <span className="shrink-0">{markerChar}</span>}
                                        <p className="font-normal text-slate-900">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </SectionContainer>
                </div>

                {/* Footer Signature Area */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <div className="flex flex-col items-start space-y-2 text-[12px]">
                        <p className="font-bold underline italic">In case of emergency: -</p>
                        <p className="text-slate-900">Contact Emergency Department Wellness Hospital | Ph No: <span className="font-bold text-slate-900 tracking-tight uppercase">8105666338</span></p>
                    </div>

                    <div className="flex justify-end mt-12 mb-8">
                        <div className="text-right border-t border-slate-900 pt-2 min-w-[200px]">
                            <p className="font-bold text-md uppercase">Dr. {admission.primaryDoctor?.firstName} {admission.primaryDoctor?.lastName}</p>
                            <p className="text-[11px] font-bold text-slate-900 uppercase">{admission.doctorDesignation || admission.primaryDoctor?.specialization || "CONSULTANT AYURVEDA"}</p>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-500 italic tracking-[0.2em] border-t border-slate-100 pt-4 uppercase">
                        End of Discharge Summary • Wellness Hospital
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0.75cm;
                    }
                    .break-before-page {
                        break-before: page !important;
                        page-break-before: always !important;
                        display: block !important;
                    }
                    section {
                        break-inside: avoid !important;
                    }
                    /* Aggressively hide all portal UI elements */
                    nav, aside, header, footer, .sidebar, .topbar, .no-print, .print\\:hidden {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                        overflow: hidden !important;
                    }
                    /* Ensure the main container takes full width and moves to top */
                    body, #__next, .layout-wrapper, main {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                    /* Specifically target the summary container */
                    .max-w-\\[800px\\] {
                        max-width: 100% !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        position: relative !important;
                    }
                    /* Add formal padding to the text container for paper margins */
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    .bg-white {
                        background: transparent !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
