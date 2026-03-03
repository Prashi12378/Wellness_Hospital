'use client';

import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deletePatient } from "@/app/actions/patient-management";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PatientActions({ patientId }: { patientId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;

        setIsDeleting(true);
        const result = await deletePatient(patientId);
        if (result.success) {
            toast.success("Patient deleted successfully");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to delete patient");
        }
        setIsDeleting(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/dashboard/patients/${patientId}`}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Patient"
            >
                <Eye className="w-5 h-5" />
            </Link>
            <Link
                href={`/dashboard/patients/${patientId}/edit`}
                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Edit Patient"
            >
                <Edit className="w-5 h-5" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Patient"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}
