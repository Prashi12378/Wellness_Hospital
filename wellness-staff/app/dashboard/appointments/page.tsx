
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { BadgeCheck, Clock, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getAppointments() {
    try {
        const appointments = await prisma.appointment.findMany({
            orderBy: {
                appointmentDate: 'asc' // Sort by date
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                },
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true
                    }
                }
            }
        });
        return appointments;
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return [];
    }
}

export default async function AppointmentsPage() {
    const appointments = await getAppointments();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
                    <p className="text-slate-500">View and manage all patient appointments.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {appointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No appointments found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                    <th className="p-4 font-semibold">Date & Time</th>
                                    <th className="p-4 font-semibold">Patient</th>
                                    <th className="p-4 font-semibold">Doctor</th>
                                    <th className="p-4 font-semibold">Reason</th>
                                    <th className="p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.map((apt) => {
                                    let StatusIcon = Clock;
                                    let statusColor = "bg-amber-100 text-amber-700";

                                    if (apt.status === 'completed') {
                                        StatusIcon = BadgeCheck;
                                        statusColor = "bg-emerald-100 text-emerald-700";
                                    } else if (apt.status === 'cancelled') {
                                        StatusIcon = XCircle;
                                        statusColor = "bg-red-100 text-red-700";
                                    }

                                    return (
                                        <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">
                                                    {format(new Date(apt.appointmentDate), 'MMM d, yyyy')}
                                                </div>
                                                <div className="text-sm text-slate-500">{apt.appointmentTime}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">
                                                    {apt.patientName || `${apt.patient.firstName || ''} ${apt.patient.lastName || ''}`}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {apt.patientPhone || apt.patient.phone}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {apt.doctor ? (
                                                    <>
                                                        <div className="font-medium text-slate-800">
                                                            Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                                                        </div>
                                                        <div className="text-sm text-slate-500">{apt.doctor.specialization}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-600">{apt.reason || "General Checkup"}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
