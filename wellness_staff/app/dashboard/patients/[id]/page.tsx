import { prisma } from "@/lib/db";
import { User, Phone, Mail, Calendar, Hash, CheckCircle2, Navigation2, FileText, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getPatient(id: string) {
    try {
        const patient = await prisma.profile.findUnique({
            where: { id },
            include: { user: true }
        });
        return patient;
    } catch (e) {
        return null;
    }
}

export default async function PatientViewPage({
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Details</h1>
                    <p className="text-slate-500 font-medium">View complete information for {patient.firstName} {patient.lastName}.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 overflow-hidden relative">
                        {patient.user?.image ? (
                            <Image
                                src={patient.user.image}
                                alt="User"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16" />
                        )}
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                                {patient.firstName} {patient.lastName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">UHID</p>
                                        <p className="text-base font-bold text-slate-800">{patient.uhid || "Not assigned"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Email Address</p>
                                        <p className="text-base font-bold text-slate-800">{patient.email || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Phone Number</p>
                                        <p className="text-base font-bold text-slate-800">{patient.phone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                                        <p className="text-base font-bold text-slate-800">
                                            {patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Gender</p>
                                        <p className="text-base font-bold text-slate-800 capitalize">{patient.gender || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Registered On</p>
                                        <p className="text-base font-bold text-slate-800">
                                            {new Date(patient.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
