import Image from "next/image";
import { prisma } from "@/lib/db";
import { User, Plus } from "lucide-react";
import SearchPatients from "./SearchPatients";

export const dynamic = 'force-dynamic';

async function getPatients(query?: string) {
    try {
        const whereClause: any = {
            role: 'patient'
        };

        if (query) {
            whereClause.OR = [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
                { uhid: { contains: query, mode: 'insensitive' } },
            ];
        }

        const patients = await prisma.profile.findMany({
            where: whereClause,
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return patients;
    } catch (error) {
        console.error("Failed to fetch patients:", error);
        return [];
    }
}

export default async function PatientsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    const patients = await getPatients(q);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patients</h1>
                    <p className="text-slate-500 font-medium">Manage and search patient records effectively.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/dashboard/patients/register" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
                        <Plus className="w-5 h-5" />
                        New Patient
                    </a>
                </div>
            </div>

            <div className="max-w-2xl">
                <SearchPatients />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                    <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 overflow-hidden relative">
                            {patient.user?.image ? (
                                <Image
                                    src={patient.user.image}
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">
                                {patient.firstName} {patient.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                    {patient.uhid || 'No UHID'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">{patient.email}</p>
                            {patient.phone && <p className="text-sm text-slate-400 mt-1">{patient.phone}</p>}
                        </div>
                    </div>
                ))}
                {patients.length === 0 && (
                    <p className="col-span-full text-center text-slate-500 py-10">No patients registered yet.</p>
                )}
            </div>
        </div>
    );
}
