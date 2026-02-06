'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, Users, ArrowLeft, Save, AlertCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        gender: '',
        uhid: ''
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();

            if (res.ok && data.profile) {
                setFormData({
                    firstName: data.profile.firstName || '',
                    lastName: data.profile.lastName || '',
                    phone: data.profile.phone || '',
                    dob: data.profile.dob || '', // Ensure Date format is YYYY-MM-DD
                    gender: data.profile.gender || '',
                    uhid: data.profile.uhid || ''
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Redirect after a short delay
            setTimeout(() => {
                router.push('/portal/profile');
                router.refresh();
            }, 1500);

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading || status === 'loading') {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/portal/profile" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Profile
                </Link>
                <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {message.text && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider">Unique Health ID (UHID)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary font-bold">#</div>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.uhid || 'Generating...'}
                                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-primary/30 bg-primary/5 text-primary font-bold focus:ring-0 cursor-default"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">This is your permanent unique identification number.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-muted/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-muted/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full h-11 pl-9 pr-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-muted/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="date"
                                required
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full h-11 pl-9 pr-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-muted/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <select
                                required
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full h-11 pl-9 pr-4 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-muted/20 text-sm"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
