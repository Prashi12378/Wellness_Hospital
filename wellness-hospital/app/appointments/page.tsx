'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, User, Stethoscope, Phone, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const departments = [
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Gynecology'
];

function AppointmentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorId = searchParams.get('doctorId');
    const { data: session, status } = useSession();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [doctorLoading, setDoctorLoading] = useState(!!doctorId);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        department: '',
        date: '',
        time: '',
        name: '',
        phone: '',
        email: '',
        reason: '',
    });

    const [error, setError] = useState('');

    // Fetch User & Doctor Details
    useEffect(() => {
        const init = async () => {
            // 1. Fetch Current User (NextAuth handles this via session)
            if (session?.user) {
                // We might want to fetch full profile details if not in session?
                // For now use what's in session or leave empty to let user fill
                setFormData(prev => ({
                    ...prev,
                    name: session.user?.name || '',
                    email: session.user?.email || '',
                }));
            }

            // 2. Fetch Doctor if ID is present
            if (doctorId) {
                try {
                    const res = await fetch(`/api/doctors?id=${doctorId}`);
                    if (res.ok) {
                        const doctor = await res.json();
                        setSelectedDoctor(doctor);
                        setFormData(prev => ({
                            ...prev,
                            department: doctor.specialization || ''
                        }));
                    } else {
                        console.error("Doctor not found");
                    }
                } catch (e) {
                    console.error("Error fetching doctor", e);
                } finally {
                    setDoctorLoading(false);
                }
            } else {
                setDoctorLoading(false);
            }
        };

        if (status !== 'loading') {
            init();
        }
    }, [doctorId, session, status]);

    // Generate Slots when Date Changes
    useEffect(() => {
        if (!formData.date) return;

        const generateSlots = () => {
            // Get day of week (e.g., "Monday")
            const dateObj = new Date(formData.date);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dateObj.getDay()];

            let slots: string[] = [];

            if (selectedDoctor && selectedDoctor.available_timings) {
                // Parse timings if string
                let timings: any[] = [];
                if (Array.isArray(selectedDoctor.available_timings)) {
                    timings = selectedDoctor.available_timings;
                } else if (typeof selectedDoctor.available_timings === 'string') {
                    try {
                        timings = JSON.parse(selectedDoctor.available_timings);
                    } catch (e) { console.error("Error parsing timings", e); }
                }

                // Find timing for this day
                const daySchedule = timings.find((t: any) => t.day.toLowerCase() === dayName.toLowerCase());

                if (daySchedule) {
                    // Generate 30min slots between start and end
                    const start = parseTime(daySchedule.start);
                    const end = parseTime(daySchedule.end);
                    let current = start;

                    while (current < end) {
                        slots.push(formatTime(current));
                        current.setMinutes(current.getMinutes() + 30);
                    }
                }
            } else {
                // Fallback / Generic Slots if no doctor specific timings
                const genericSlots = [
                    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
                ];
                slots = genericSlots;
            }
            setAvailableSlots(slots);
        };

        generateSlots();
    }, [formData.date, selectedDoctor]);

    // Helper: Parse "09:00" or "09:00 AM" to Date object
    const parseTime = (timeStr: string) => {
        const d = new Date();
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');

        let h = parseInt(hours);
        const m = parseInt(minutes);

        // Simple parsing assuming existing logic was correct for the input data quality
        d.setHours(h, m, 0, 0);
        return d;
    };

    // Helper: Format Date object to "09:00 AM"
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleNextStep1 = async () => {
        if (status === 'unauthenticated') {
            // Store current URL to redirect back after login
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (status !== 'authenticated') {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor_id: selectedDoctor?.id || null, // Matches API expectation
                    department: formData.department,
                    appointment_date: formData.date,
                    appointment_time: formData.time,
                    patient_name: formData.name,
                    patient_phone: formData.phone,
                    patient_email: formData.email,
                    reason: formData.reason
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to book appointment');
            }

            setLoading(false);
            setStep(4);

        } catch (err: any) {
            console.error('Error booking appointment:', err);
            setError(err.message || 'Failed to book appointment. Please try again.');
            setLoading(false);
        }
    };

    if (doctorLoading || status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <main className="min-h-screen bg-muted/30 py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Book an Appointment</h1>
                    {selectedDoctor ? (
                        <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 py-1 px-3 rounded-full w-fit mx-auto mt-2">
                            <Stethoscope className="w-4 h-4" />
                            <span className="font-medium">Booking with {selectedDoctor.full_name}</span>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Schedule your visit in just a few steps</p>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}>
                                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && <div className={cn('w-12 h-0.5', step > s ? 'bg-primary' : 'bg-border')} />}
                        </div>
                    ))}
                </div>

                {step === 4 ? (
                    <div className="bg-card rounded-2xl border border-border p-8 text-center animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Confirmed!</h2>
                        <p className="text-muted-foreground mb-6">
                            Your appointment has been scheduled for <strong>{formData.date}</strong> at <strong>{formData.time}</strong>
                            {selectedDoctor && <span> with <strong>{selectedDoctor.full_name}</strong></span>}.
                        </p>
                        <Link href="/" className="inline-flex h-10 px-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {/* Step 1: Select Department (Locked if Doctor Selected) & Date */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-primary" /> Appointment Details
                                </h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Department</label>
                                        {selectedDoctor ? (
                                            <input
                                                type="text"
                                                value={formData.department}
                                                disabled
                                                className="w-full h-11 px-4 rounded-lg border border-border bg-muted text-muted-foreground"
                                            />
                                        ) : (
                                            <select
                                                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a department</option>
                                                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Preferred Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            value={formData.date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                        {selectedDoctor && (
                                            <p className="text-xs text-muted-foreground">
                                                * Available days: {Array.isArray(selectedDoctor.available_timings)
                                                    ? selectedDoctor.available_timings.map((t: any) => t.day).join(', ')
                                                    : 'Check schedule'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleNextStep1}
                                        disabled={!formData.department || !formData.date}
                                        className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Time */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" /> Select Time Slot
                                </h2>

                                {availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {availableSlots.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, time })}
                                                className={cn(
                                                    'h-10 rounded-lg border text-sm font-medium transition-colors',
                                                    formData.time === time ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border">
                                        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                        <p className="text-muted-foreground">No slots available for this date.</p>
                                        {selectedDoctor && <p className="text-xs text-muted-foreground mt-1">Please check the doctor's available days.</p>}
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <button type="button" onClick={() => setStep(1)} className="h-10 px-6 border border-border rounded-lg font-medium hover:bg-muted transition-colors">Back</button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.time}
                                        className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Patient Details */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Your Details
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full h-11 px-4 rounded-lg border border-border bg-background"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full h-11 px-4 rounded-lg border border-border bg-background"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full h-11 px-4 rounded-lg border border-border bg-background"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-foreground">Reason for Visit (Optional)</label>
                                        <textarea
                                            className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-background resize-none"
                                            placeholder="Brief description of your symptoms or reason..."
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <button type="button" onClick={() => setStep(2)} className="h-10 px-6 border border-border rounded-lg font-medium hover:bg-muted transition-colors">Back</button>
                                    <button
                                        type="submit"
                                        disabled={!formData.name || !formData.phone}
                                        className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Appointment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}

export default function AppointmentsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <AppointmentForm />
        </Suspense>
    );
}
