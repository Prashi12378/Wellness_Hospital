import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditPatientForm from "./EditPatientForm";

export const dynamic = 'force-dynamic';

async function getPatient(id: string) {
    try {
        const patient = await prisma.profile.findUnique({
            where: { id },
        });
        return patient;
    } catch (e) {
        return null;
    }
}

export default async function EditPatientPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const patient = await getPatient(id);

    if (!patient) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/patients" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Patient</h1>
                    <p className="text-slate-500 font-medium">Update profile details for {patient.firstName} {patient.lastName}.</p>
                </div>
            </div>

            <EditPatientForm patient={patient} />
        </div>
    );
}
