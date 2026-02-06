'use client';

import { useState, useEffect } from 'react';
import { Droplet, Clock, MapPin, CheckCircle, Phone, Calendar, User, TestTube } from 'lucide-react';

// testPackages will be fetched from the database

const timeSlots = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];

export default function BloodCollectionPage() {
    const [testPackages, setTestPackages] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null); // Keep user state if needed for form pre-fill or logic
    const [isBooked, setIsBooked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        date: '',
        time: '',
    });

    // We can fetch user from session API or useSession hook if we were using SessionProvider.
    // For now, let's just leave the pre-fill empty or rely on manual input to keep it robust during migration,
    // or fetch from /api/auth/session if strict.
    // Actually, let's use the fetch helper we built or just fetch session.

    useEffect(() => {
        // Fetch test packages from the database
        fetch('/api/packages?type=BLOOD_COLLECTION')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTestPackages(data);
                } else {
                    console.error("Received returned non-array data:", data);
                    setTestPackages([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch test packages:", err);
                setTestPackages([]);
            });

        fetch('/api/auth/session').then(res => res.json()).then(session => {
            if (session?.user) {
                setUser(session.user);
                setFormData(prev => ({
                    ...prev,
                    name: session.user.name || '',
                    phone: '', // Phone might not be in default session unless added to callback
                }));
            }
        });
    }, []);

    const toggleTest = (id: number) => {
        setSelectedTests(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const totalPrice = selectedTests.reduce((sum, id) => {
        const pkg = testPackages.find(p => p.id === id);
        return sum + (pkg?.price || 0);
    }, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const selectedTestsData = selectedTests.map(id => testPackages.find(p => p.id === id));

        try {
            const res = await fetch('/api/blood-collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    collection_date: formData.date,
                    collection_time: formData.time,
                    selected_tests: selectedTestsData,
                    total_price: totalPrice
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Booking failed");
            }

            setIsBooked(true);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to book collection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/5 via-background to-background py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
                            <Droplet className="w-4 h-4" /> Blood@Home
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Blood Sample Collection at Your Doorstep
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Getting your blood tests done is now easier than ever. Skip the queues and let our expert phlebotomists come to you. Comfortable, safe, and right at your doorstep.
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-600" /> Certified Phlebotomists</div>
                            <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-600" /> Reports in 24 hours</div>
                            <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-green-600" /> Free Home Pickup</div>
                        </div>
                    </div>
                    <div className="hidden md:flex justify-center">
                        <div className="w-64 h-64 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                            <TestTube className="w-32 h-32 text-primary" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section className="py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    {isBooked ? (
                        <div className="max-w-lg mx-auto bg-card rounded-2xl border border-border p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
                            <p className="text-muted-foreground mb-4">
                                Your blood collection is scheduled for <strong>{formData.date}</strong> at <strong>{formData.time}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Our phlebotomist will arrive at your location. Please keep your prescription ready if any.
                            </p>
                            <p className="text-lg font-bold text-primary mb-6">Total: ₹{totalPrice}</p>
                            <button onClick={() => { setIsBooked(false); setSelectedTests([]); }} className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                Book Another
                            </button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Test Selection */}
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Select Tests</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {testPackages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            onClick={() => toggleTest(pkg.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTests.includes(pkg.id)
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border bg-card hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium text-foreground">{pkg.name}</h3>
                                                        {pkg.popular && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Popular</span>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{pkg.tests} {pkg.tests === 1 ? 'test' : 'tests'} included</p>
                                                </div>
                                                <p className="text-lg font-bold text-primary">₹{pkg.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                                    <h3 className="font-semibold text-foreground mb-4">Schedule Pickup</h3>
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center mb-4">
                                            {error}
                                        </div>
                                    )}
                                    {user ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                                                    placeholder="Your name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Phone</label>
                                                <input
                                                    type="tel"
                                                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                                                    placeholder="+91 98765 43210"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Address</label>
                                                <textarea
                                                    className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                                                    placeholder="Full address with landmark"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Time</label>
                                                    <select
                                                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm appearance-none bg-white"
                                                        value={formData.time}
                                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Selected Tests</span>
                                                    <span className="text-sm font-medium">{selectedTests.length}</span>
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <span className="font-medium text-foreground">Total</span>
                                                    <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={loading || selectedTests.length === 0}
                                                    className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {loading ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            Book Blood@Home
                                                            <TestTube className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground">Please Sign In</h3>
                                            <p className="text-muted-foreground">You need to be logged in to book a home collection.</p>
                                            <a href="/login?redirect=/blood-collection" className="inline-flex h-10 px-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                                Sign In to Book
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
