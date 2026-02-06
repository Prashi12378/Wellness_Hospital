'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, CheckCircle2, Timer } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch('/api/appointments');
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                }
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
                <Link
                    href="/appointments"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Book New
                </Link>
            </div>

            {appointments.length > 0 ? (
                <div className="grid gap-4">
                    {appointments.map((appt) => (
                        <div key={appt.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${appt.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {appt.status === 'confirmed' ? <CheckCircle2 className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{appt.department}</h3>
                                        <p className="text-sm text-muted-foreground">Patient: {appt.patient_name}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold uppercase tracking-wider">
                                            <span className={appt.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 flex md:flex-col justify-between md:justify-start gap-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Date</p>
                                        <p className="text-sm font-bold text-foreground">{appt.appointment_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Time</p>
                                        <p className="text-sm font-bold text-foreground flex items-center md:justify-end gap-1">
                                            <Clock className="w-3 h-3 text-primary" /> {appt.appointment_time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                            <Calendar className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No appointments yet</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                            You don't have any scheduled appointments. Book your first consultation today!
                        </p>
                        <Link
                            href="/appointments"
                            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                            Start booking process <Plus className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">

                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> In-person Check-in
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Please arrive at least 15 minutes before your scheduled appointment for preliminary checks.
                    </p>
                </div>
            </div>
        </div>
    );
}
