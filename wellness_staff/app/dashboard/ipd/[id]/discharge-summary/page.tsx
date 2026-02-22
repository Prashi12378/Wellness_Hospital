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
    Building2,
    Activity
} from 'lucide-react';
import { getAdmissionDetails } from '@/app/actions/ipd';
import { format } from 'date-fns';

export default function DischargeSummaryPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [admission, setAdmission] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await getAdmissionDetails(id);
            if (res.success) setAdmission(res.admission);
            setIsLoading(false);
        };
        fetchDetails();
    }, [id]);

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

    return (
        <div className="max-w-[800px] mx-auto py-12 px-8 space-y-8 mb-20">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100 print:hidden">
                <button onClick={() => router.back()} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
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

            {/* Professional Discharge Summary (Printable) */}
            <div className="bg-white p-8 shadow-sm border border-slate-200 text-slate-900 font-serif leading-relaxed print:shadow-none print:border-none print:p-0 print:m-0">

                {/* Hospital Header (Centered matching User Mockup) */}
                <div className="text-center mb-6">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-4">
                            {/* Official Hospital Logo - Reduced Size */}
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/logo.png" alt="Wellness Hospital Logo" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight uppercase font-sans text-slate-900">Wellness Hospital</h1>
                        </div>

                        <div className="text-[11px] text-slate-800 font-medium leading-relaxed max-w-lg">
                            <p>Beside friend function hall, Gowribidnur main road, Palanjoghalli,</p>
                            <p>Doddaballapur - 561203, Karnataka, India</p>
                            <p className="mt-1 font-bold font-sans tracking-tight text-slate-900 tabular-nums">Tel: +91 8105666338 | E-mail: wellnesshospital8383@gmail.com</p>
                        </div>
                    </div>

                    <div className="py-2 border-y-[1.5px] border-slate-900 mt-6">
                        <h2 className="text-2xl font-black uppercase tracking-[0.25em] font-serif text-slate-900">Discharge Summary</h2>
                    </div>
                </div>

                {/* Patient Information Grid (Formal Alphanumeric Styling) */}
                <div className="grid grid-cols-10 gap-x-4 gap-y-4 text-[13px] mb-6 pb-4 border-b border-slate-900 tabular-nums">
                    {/* Row 1 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap">Patient's Name:</span>
                        <span className="uppercase font-medium font-sans text-slate-950 tracking-wide truncate">{admission.patient.firstName} {admission.patient.lastName}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Age:</span>
                        <span className="font-medium font-sans text-[12px]">{admission.patient.dob ? (new Date().getFullYear() - new Date(admission.patient.dob).getFullYear()) : '--'}</span>
                        <span className="text-[10px] font-bold ml-1">YRS</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Sex:</span>
                        <span className="font-medium uppercase font-sans text-[12px]">{admission.patient.gender || '--'}</span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap">Consultant:</span>
                        <span className="uppercase font-medium font-sans text-slate-950 tracking-wide truncate">Dr. {admission.primaryDoctor?.firstName} {admission.primaryDoctor?.lastName}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">IP.NO:</span>
                        <span className="font-medium uppercase font-sans text-[12px]">{admission.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden">
                        <span className="font-bold shrink-0 mr-2">Ward:</span>
                        <span className="font-medium uppercase font-sans text-[12px]">{admission.ward || '--'}</span>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-baseline col-span-4 overflow-hidden pr-4">
                        <span className="font-bold shrink-0 mr-2 whitespace-nowrap">UHID:</span>
                        <span className="font-medium uppercase font-sans text-[12px]">{admission.patient.uhid}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden whitespace-nowrap">
                        <span className="font-bold shrink-0 mr-2">Adm. On:</span>
                        <span className="font-medium font-sans text-[12px]">{format(new Date(admission.admissionDate), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-baseline col-span-3 overflow-hidden whitespace-nowrap">
                        <span className="font-bold shrink-0 mr-2">Disc. On:</span>
                        <span className="font-medium font-sans text-[12px]">{admission.dischargeDate ? format(new Date(admission.dischargeDate), 'dd/MM/yyyy') : '--/--/----'}</span>
                    </div>
                </div>

                {/* Clinical Content Sections */}
                <div className="space-y-6 text-[13px] tabular-nums leading-relaxed">

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Diagnoses:</h3>
                        <div className="pl-6 space-y-0.5">
                            {admission.diagnoses ? (
                                <p className="font-normal text-slate-800 whitespace-pre-line leading-relaxed">{admission.diagnoses}</p>
                            ) : (
                                <p className="text-slate-400 italic font-medium">1. Diagnoses details not recorded.</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Presenting Symptoms:</h3>
                        <div className="pl-2">
                            <p className="font-normal whitespace-pre-line uppercase leading-relaxed text-slate-800">{admission.presentingSymptoms || "--"}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Physical Findings:</h3>
                        <div className="pl-2">
                            <div className="font-normal uppercase leading-relaxed whitespace-pre-line font-sans text-slate-800 tracking-tight">
                                {admission.physicalFindings || "--"}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Investigations:</h3>
                        <div className="pl-2">
                            <p className="font-normal whitespace-pre-line uppercase leading-relaxed text-slate-800">{admission.investigations || "All Reports Enclosed."}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Course in the Hospital:</h3>
                        <div className="pl-2 text-justify">
                            <p className="font-normal leading-relaxed whitespace-pre-line uppercase text-[12px] text-slate-800">{admission.hospitalCourse || "--"}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Medication:</h3>
                        <div className="pl-6">
                            <div className="font-normal whitespace-pre-line uppercase leading-relaxed text-slate-800 font-sans tracking-tight">
                                {admission.dischargeMedication || "--"}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Condition on Discharge:</h3>
                        <div className="pl-2">
                            <p className="font-medium uppercase tracking-tight text-slate-800">{admission.dischargeCondition || "Satisfactory."}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Advise on Discharge:</h3>
                        <div className="pl-6">
                            <div className="font-normal whitespace-pre-line uppercase leading-relaxed text-slate-800 font-sans tracking-tight">
                                {admission.dischargeAdvice || "--"}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-black text-[13px] uppercase underline mb-2 tracking-wide">Note and Review:</h3>
                        <div className="pl-6">
                            <div className="font-normal whitespace-pre-line uppercase leading-relaxed text-slate-800">
                                {admission.noteAndReview || "REVIEW AFTER 1 WEEK IN OPD WITH PRIOR APPOINTMENT TO DR. PUSHPA"}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Signature Area */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <div className="flex flex-col items-start space-y-2 text-[11px]">
                        <p className="font-bold underline italic">In case of emergency: -</p>
                        <p className="text-slate-700">Contact Emergency Department Wellness Hospital | Ph No: <span className="font-sans font-bold text-slate-900 tracking-tight">8105666338</span></p>
                    </div>

                    <div className="flex justify-end mt-12 mb-8">
                        <div className="text-right border-t border-slate-900 pt-2 min-w-[200px]">
                            <p className="font-black uppercase text-sm">Dr. {admission.primaryDoctor?.firstName} {admission.primaryDoctor?.lastName}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-600">CONSULTANT AYURVEDA</p>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 italic uppercase tracking-[0.3em] font-serif border-t border-slate-100 pt-4">
                        End of Discharge Summary • Wellness Hospital
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
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
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                    /* Add formal padding to the text container for paper margins */
                    .print\\:p-0 {
                        padding: 1.5cm !important;
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
