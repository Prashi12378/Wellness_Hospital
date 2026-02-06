'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();

                    // Map API response to frontend expectations if needed
                    // API returns Prisma Profile object: { firstName, lastName, phone, ... }
                    // Frontend uses: full_name, uhid, first_name, last_name, gender, dob, phone

                    setProfile({
                        ...data,
                        full_name: `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim(),
                        first_name: data.profile.firstName,
                        last_name: data.profile.lastName,
                        uhid: data.profile.uhid || 'Generate on Edit', // Fallback if still missing, but API should handle it
                        phone: data.profile.phone,
                        dob: data.profile.dob,
                        gender: data.profile.gender
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (!profile) return null;

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                        {profile.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                        <p className="text-primary font-bold">{profile.uhid || 'UHID Pending'}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal Information
                        </label>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">First Name</p>
                                <p className="text-foreground font-medium">{profile.first_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Name</p>
                                <p className="text-foreground font-medium">{profile.last_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gender</p>
                                <p className="text-foreground font-medium capitalize">{profile.gender || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Date of Birth</p>
                                <p className="text-foreground font-medium">{profile.dob || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Contact & Security
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</p>
                                    <p className="text-foreground font-medium">Verified Account</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</p>
                                    <p className="text-foreground font-medium">{profile.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                    <Link
                        href="/portal/profile/edit"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
