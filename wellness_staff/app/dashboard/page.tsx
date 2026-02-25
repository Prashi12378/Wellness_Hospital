import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import BackfillLedgerButton from '@/components/BackfillLedgerButton';

export const dynamic = 'force-dynamic';

async function getStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayAppointments, totalPatients, pendingAppointments] = await Promise.all([
            prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            prisma.user.count({
                where: {
                    profile: {
                        role: 'patient'
                    }
                }
            }),
            prisma.appointment.count({
                where: {
                    status: 'scheduled'
                }
            })
        ]);

        return {
            today: todayAppointments,
            patients: totalPatients,
            pending: pendingAppointments
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return { today: 0, patients: 0, pending: 0 };
    }
}

export default async function DashboardPage() {
    const data = await getStats();

    const stats = [
        { label: "Today's Appointments", value: data.today.toString(), icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
        { label: "Total Patients", value: data.patients.toString(), icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Pending Appointments", value: data.pending.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">Welcome Back, Front Desk Executive!</h1>
                <p className="text-blue-100">Manage appointments and patient registrations efficiently.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/dashboard/appointments" className="block p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Manage Appointments</h4>
                                    <p className="text-sm text-slate-500">Check-in, cancel or viewing today&apos;s schedule</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </Link>

                    <Link href="/dashboard/patients" className="block p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Register Patient</h4>
                                    <p className="text-sm text-slate-500">Add new walk-in patients quickly</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Ledger Backfill */}
            <BackfillLedgerButton />
        </div>
    );
}
