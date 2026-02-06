
import { prisma } from "@/lib/db";
import { User } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getPatients() {
    try {
        const patients = await prisma.profile.findMany({
            where: {
                role: 'patient'
            },
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

export default async function PatientsPage() {
    const patients = await getPatients();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
                    <p className="text-slate-500">List of all registered patients.</p>
                </div>
                <a href="/dashboard/patients/register" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    New Patient
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((patient) => (
                    <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 overflow-hidden">
                            {patient.user?.image ? (
                                <img src={patient.user.image} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">
                                {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-slate-500">{patient.email}</p>
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
