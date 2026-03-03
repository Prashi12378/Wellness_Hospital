'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updatePatient } from "@/app/actions/patient-management";

type EditPatientFormProps = {
    patient: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        dob: string | null;
        gender: string | null;
        email: string;
    };
};

export default function EditPatientForm({ patient }: EditPatientFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updatePatient(patient.id, formData);

        if (result.success) {
            router.push('/dashboard/patients');
            router.refresh();
        } else {
            setError(result.error || "Failed to update patient");
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="firstName"
                        defaultValue={patient.firstName || ''}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                        placeholder="e.g. John"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="lastName"
                        defaultValue={patient.lastName || ''}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                        placeholder="e.g. Doe"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address (Read-only)</label>
                    <input
                        type="email"
                        defaultValue={patient.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border-none outline-none font-medium text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={patient.phone || ''}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                        placeholder="e.g. 9876543210"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        name="dob"
                        defaultValue={patient.dob || ''}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700 [color-scheme:light]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                    <select
                        name="gender"
                        defaultValue={patient.gender || ''}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700 appearance-none"
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
                <Link
                    href="/dashboard/patients"
                    className="px-6 py-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
