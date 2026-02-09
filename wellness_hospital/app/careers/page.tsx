'use client';

import { Mail, Phone, Briefcase } from 'lucide-react';

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-background py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">Join Our Team</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Be a part of Wellness Hospital's mission to provide world-class healthcare with compassion and excellence.
                    </p>
                </div>

                {/* Open Positions - Placeholder for now */}
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Current Openings</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        We are currently looking for dedicated professionals to join our growing team.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <h3 className="font-semibold text-foreground">Senior Staff Nurse</h3>
                            <p className="text-sm text-muted-foreground">ICU & Emergency Department</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <h3 className="font-semibold text-foreground">General Duty Assistant</h3>
                            <p className="text-sm text-muted-foreground">In-Patient Wards</p>
                        </div>
                    </div>
                </div>

                {/* Contact for General Staff */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">For Nurses & General Staff</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        If you are a nurse, technician, or general staff member interested in working with us, please reach out directly via phone or email.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
                        <a href="mailto:wellnesshospital8383@gmail.com" className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all group min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-muted-foreground font-medium">Email CV to</p>
                                <p className="text-sm font-bold text-foreground">wellnesshospital8383@gmail.com</p>
                            </div>
                        </a>

                        <a href="tel:+918197987901" className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all group min-w-[200px]">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-muted-foreground font-medium">Call HR Team</p>
                                <p className="text-sm font-bold text-foreground">+91 81979 87901</p>
                            </div>
                        </a>
                    </div>
                </div>

            </div>
        </main>
    );
}
