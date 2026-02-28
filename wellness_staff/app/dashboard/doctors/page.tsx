
import { prisma } from "@/lib/db";
import { Stethoscope } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getDoctors() {
    try {
        const doctors = await prisma.profile.findMany({
            where: {
                role: 'doctor'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return doctors;
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return [];
    }
}

export default async function DoctorsPage() {
    const doctors = await getDoctors();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">Doctors Directory</h1>
                <p className="text-blue-100">View all available specialists.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{doc.firstName} {doc.lastName}</h3>
                                <span className="inline-block px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-full font-medium border border-primary/10">
                                    {doc.specialization || "General Physician"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-400">Experience</span>
                                <span className="font-medium">{doc.experience || 0} Years</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-400">Consultation</span>
                                <span className="font-medium font-mono">₹{String(doc.consultationFee || '0.00')}</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-slate-400 line-clamp-2">{doc.bio || "No bio available."}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {doctors.length === 0 && (
                    <p className="col-span-full text-center text-slate-500 py-10">No doctors registered yet.</p>
                )}
            </div>
        </div>
    );
}
