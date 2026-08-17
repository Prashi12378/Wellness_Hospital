"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getAdmissionDetails, dischargePatient, updateDischargeSummary } from "@/app/actions/ipd";

export default function EditDischargePage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'discharge';
    const isEdit = type === 'edit';
    
    const router = useRouter();
    
    const [admission, setAdmission] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setIsLoading(true);
        const data = await getAdmissionDetails(id);
        if (data?.success && data.admission) {
            setAdmission(data.admission);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            const fd = new FormData(e.currentTarget);
            const data = {
                diagnoses: fd.get('diagnoses') as string,
                presentingSymptoms: fd.get('presentingSymptoms') as string,
                physicalFindings: fd.get('physicalFindings') as string,
                investigations: fd.get('investigations') as string,
                treatmentGiven: fd.get('treatmentGiven') as string,
                hospitalCourse: fd.get('hospitalCourse') as string,
                dischargeMedication: fd.get('dischargeMedication') as string,
                dischargeCondition: fd.get('dischargeCondition') as string,
                dischargeAdvice: fd.get('dischargeAdvice') as string,
                noteAndReview: fd.get('noteAndReview') as string,
                doctorDesignation: fd.get('doctorDesignation') as string,
                ...(!isEdit && { paymentMethod: fd.get('paymentMethod') as string })
            };

            if (isEdit) {
                await updateDischargeSummary(id, data);
            } else {
                await dischargePatient(id, data as any);
            }
            router.push(`/dashboard/ipd/${id}`);
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!admission) {
        return <div className="p-8">Admission not found</div>;
    }

    if (isEdit && !admission.editUnlocked) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-8 bg-red-50 text-red-600 rounded-3xl text-center">
                <h2 className="text-2xl font-black mb-2">Edit Locked</h2>
                <p className="font-medium">This discharge summary has been locked by an administrator and cannot be edited.</p>
                <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <button onClick={() => router.back()} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-100">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                        {isEdit ? "Edit Discharge Summary" : "Initiate Patient Discharge"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        For {admission.patient.firstName} {admission.patient.lastName} ({admission.patient.uhid})
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                <div className="flex items-center justify-between border-b border-primary/10 pb-6">
                    <h4 className="text-lg font-black text-primary uppercase tracking-widest">Clinical Details Form</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Final Diagnoses</label>
                        <textarea name="diagnoses" required rows={3} defaultValue={admission.diagnoses} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Presenting Symptoms</label>
                        <textarea name="presentingSymptoms" rows={3} defaultValue={admission.presentingSymptoms} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Investigations Summary</label>
                        <textarea name="investigations" rows={3} defaultValue={admission.investigations} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Treatment Given</label>
                        <textarea name="treatmentGiven" rows={3} defaultValue={admission.treatmentGiven} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Physical Findings (Vitals/Examination)</label>
                        <textarea name="physicalFindings" rows={3} defaultValue={admission.physicalFindings} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Course in the Hospital</label>
                        <textarea name="hospitalCourse" rows={5} defaultValue={admission.hospitalCourse} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Discharge Medication</label>
                        <textarea name="dischargeMedication" rows={3} defaultValue={admission.dischargeMedication} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Condition on Discharge</label>
                        <input name="dischargeCondition" defaultValue={admission.dischargeCondition} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Attending Doctor Designation</label>
                        <input name="doctorDesignation" defaultValue={admission.doctorDesignation || admission.primaryDoctor?.specialization || "CONSULTANT AYURVEDA"} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Advice on Discharge</label>
                        <textarea name="dischargeAdvice" rows={3} defaultValue={admission.dischargeAdvice} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Note and Review</label>
                        <textarea name="noteAndReview" rows={3} defaultValue={admission.noteAndReview} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none" />
                    </div>

                    {!isEdit && (
                        <div className="space-y-2 md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payment Mode (Bill Settlement)</label>
                            <select name="paymentMethod" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                                <option value="CASH">CASH</option>
                                <option value="UPI">UPI / QR CODE</option>
                                <option value="CARD">DEBIT / CREDIT CARD</option>
                                <option value="TRANSFER">BANK TRANSFER</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                    <button disabled={isActionLoading} className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black shadow-xl flex items-center gap-2 transition-all active:scale-95">
                        {isActionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isEdit ? "Update Summary Changes" : "Confirm Discharge & Finalize Bill")}
                    </button>
                </div>
            </form>
        </div>
    );
}
