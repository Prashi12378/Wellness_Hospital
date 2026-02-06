'use client';

import { useState, useEffect } from "react";

import { Star, Stethoscope, Activity, Heart, Brain, Baby, User, Loader2 } from "lucide-react";

export default function DoctorsPage() {

    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/api/doctors');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-12 md:py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Meet Our Specialists</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Our team of highly qualified doctors is here to provide you with expert medical care across various specialties.
                    </p>
                </div>

                {doctors.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-xl">
                        No doctors available at the moment. Please check back later.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-64 overflow-hidden relative group">
                                    {doctor.avatar_url ? (
                                        <img
                                            src={doctor.avatar_url}
                                            alt={doctor.full_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Stethoscope className="w-20 h-20 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <span className="text-white font-medium">View Profile</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">{doctor.full_name}</h3>
                                                <p className="text-primary font-medium">{doctor.specialization || 'General Practitioner'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2 py-1 rounded">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span>5.0</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{doctor.qualification}</p>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-border/50">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Experience</span>
                                            <span className="font-medium text-foreground">{doctor.experience_years ? `${doctor.experience_years}+ Years` : 'N/A'}</span>
                                        </div>
                                        {/* Timings Display */}
                                        {doctor.available_timings && Array.isArray(doctor.available_timings) && doctor.available_timings.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Availability</p>
                                                <div className="space-y-1">
                                                    {doctor.available_timings.slice(0, 3).map((slot: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-xs text-foreground">
                                                            <span className="font-medium text-muted-foreground w-20">{slot.day}</span>
                                                            <span>{slot.start} - {slot.end}</span>
                                                        </div>
                                                    ))}
                                                    {doctor.available_timings.length > 3 && (
                                                        <p className="text-xs text-primary pt-1">+ {doctor.available_timings.length - 3} more slots</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {doctor.bio && (
                                        <p className="text-sm text-foreground/70 line-clamp-2 mt-2">
                                            {doctor.bio}
                                        </p>
                                    )}

                                    <div className="pt-4 mt-auto">
                                        <a href={`/appointments?doctorId=${doctor.id}`} className="block w-full">
                                            <button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]">
                                                Book Appointment
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
