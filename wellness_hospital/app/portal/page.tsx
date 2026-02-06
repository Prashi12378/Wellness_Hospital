'use client';

import { useState, useEffect } from 'react';
import { Calendar, CreditCard, Pill, TestTube, FileText, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Appointments (Limit 3) - Front end filtering for now or update API to accept limit
                const apptsRes = await fetch('/api/appointments');
                if (apptsRes.ok) {
                    const data = await apptsRes.json();
                    setAppointments(data.slice(0, 3));
                }

                // Fetch Reports (Limit 2)
                const reportsRes = await fetch('/api/reports');
                if (reportsRes.ok) {
                    const data = await reportsRes.json();
                    setReports(data.slice(0, 2));
                }
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Link href="/appointments" className="bg-card rounded-xl border border-border p-3 md:p-4 hover:shadow-md transition-shadow text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-1.5 md:mb-2 border border-primary/5">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-foreground">Appointments</p>
                </Link>
                <Link href="/portal/reports" className="bg-card rounded-xl border border-border p-3 md:p-4 hover:shadow-md transition-shadow text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mx-auto mb-1.5 md:mb-2 border border-purple-100">
                        <TestTube className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-foreground">Lab Reports</p>
                </Link>
                <Link href="/portal/prescriptions" className="bg-card rounded-xl border border-border p-3 md:p-4 hover:shadow-md transition-shadow text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mx-auto mb-1.5 md:mb-2 border border-green-100">
                        <Pill className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-foreground">Prescriptions</p>
                </Link>
                <Link href="/portal/billing" className="bg-card rounded-xl border border-border p-3 md:p-4 hover:shadow-md transition-shadow text-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mx-auto mb-1.5 md:mb-2 border border-amber-100">
                        <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-foreground">Bills</p>
                </Link>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
                    <Link href="/portal/appointments" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                {appointments.length > 0 ? (
                    <div className="space-y-3">
                        {appointments.map((appt: any) => (
                            <div key={appt.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">
                                        {appt.department.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{appt.department}</p>
                                        <p className="text-xs text-muted-foreground">{appt.status === 'pending' ? 'Verification Pending' : 'Confirmed'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{appt.appointment_date}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> {appt.appointment_time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">No upcoming appointments found</p>
                        <Link href="/appointments" className="text-primary text-sm hover:underline mt-2 inline-block">Book your first appointment</Link>
                    </div>
                )}
            </div>

            {/* Recent Lab Reports */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Lab Reports</h2>
                    <Link href="/portal/reports" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                {reports.length > 0 ? (
                    <div className="space-y-3">
                        {reports.map((report: any) => (
                            <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{report.test_name}</p>
                                        <p className="text-xs text-muted-foreground">{report.report_date}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${report.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {report.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TestTube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">No recent lab reports found</p>
                        <p className="text-xs text-muted-foreground mt-1">Reports will appear here once available</p>
                    </div>
                )}
            </div>
        </div>
    );
}


