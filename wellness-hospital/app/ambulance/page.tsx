'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Ambulance, AlertTriangle, CheckCircle, User, Navigation } from 'lucide-react';

export default function AmbulanceServicePage() {
    const [user, setUser] = useState<any>(null);
    const [isBooked, setIsBooked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        emergencyType: '',
    });

    useEffect(() => {
        fetch('/api/auth/session').then(res => res.json()).then(session => {
            if (session?.user) {
                setUser(session.user);
                setFormData(prev => ({
                    ...prev,
                    name: session.user.name || '',
                    phone: '',
                }));
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/ambulance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_name: formData.name,
                    phone: formData.phone,
                    location: formData.location,
                    service_type: formData.emergencyType
                })
            });

            if (!res.ok) throw new Error("Request failed");

            setIsBooked(true);
        } catch (err) {
            setError('Failed to submit request. Please call our emergency line directly.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen">
            {/* Emergency Banner */}
            <div className="bg-primary text-white py-3">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-4 flex-wrap">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">For cardiac or critical emergencies, call our 24/7 line:</span>
                    <a href="tel:6366662245" className="text-2xl font-bold hover:underline">6366662245</a>
                </div>
            </div>

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
                            <Ambulance className="w-4 h-4" /> 24/7 Ambulance Service
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Emergency Ambulance at Your Location
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Our fleet of fully-equipped ambulances with trained paramedics is ready to reach you. We prioritize speed and safety to ensure you get care when you need it most.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="tel:6366662245" className="inline-flex h-12 px-6 items-center gap-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                <Phone className="w-5 h-5" /> Call Now: 6366662245
                            </a>
                        </div>
                    </div>
                    <div className="hidden md:flex justify-center">
                        <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center">
                            <Ambulance className="w-32 h-32 text-primary" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-card border-y border-border">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Quick Response</h3>
                        <p className="text-sm text-muted-foreground">Average response time under 15 minutes</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Trained Paramedics</h3>
                        <p className="text-sm text-muted-foreground">Certified emergency medical technicians</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <Navigation className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">GPS Tracking</h3>
                        <p className="text-sm text-muted-foreground">Real-time location tracking available</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <Ambulance className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Fully Equipped</h3>
                        <p className="text-sm text-muted-foreground">Advanced life support equipment</p>
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="py-16 md:py-24">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Request Ambulance</h2>
                        <p className="text-muted-foreground">Fill the form for non-emergency patient transport or home blood collection pickup</p>
                    </div>

                    {isBooked ? (
                        <div className="bg-card rounded-2xl border border-border p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Request Received!</h3>
                            <p className="text-muted-foreground mb-6">
                                Our team will contact you at <strong>{formData.phone}</strong> shortly to confirm the pickup.
                            </p>
                            <button onClick={() => setIsBooked(false)} className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Submit Another Request
                            </button>
                        </div>
                    ) : (
                        user ? (
                            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Patient Name</label>
                                        <input
                                            type="text"
                                            className="w-full h-11 px-4 rounded-lg border border-border bg-background"
                                            placeholder="Full name"
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
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Pickup Location</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 rounded-lg border border-border bg-background"
                                        placeholder="Full address with landmark"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Service Type</label>
                                    <select
                                        className="w-full h-11 px-4 rounded-lg border border-border bg-background appearance-none"
                                        value={formData.emergencyType}
                                        onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                                        required
                                    >
                                        <option value="">Select service type</option>
                                        <option value="patient-transport">Patient Transport (Non-Emergency)</option>
                                        <option value="blood-collection">Home Blood Collection Pickup</option>
                                        <option value="dialysis-transport">Dialysis Transport</option>
                                        <option value="hospital-transfer">Hospital to Hospital Transfer</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Request Ambulance
                                            <Ambulance className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-muted-foreground">
                                    For urgent life-threatening emergencies, please call our 24/7 line <strong>6366662245</strong> immediately.
                                </p>
                            </form>
                        ) : (
                            <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                                    <User className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Please Sign In</h3>
                                <p className="text-muted-foreground">You need to be logged in to request an ambulance online.</p>
                                <a href="/login?redirect=/ambulance" className="inline-flex h-10 px-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                    Sign In to Request
                                </a>
                            </div>
                        )
                    )}
                </div>
            </section>
        </main>
    );
}
