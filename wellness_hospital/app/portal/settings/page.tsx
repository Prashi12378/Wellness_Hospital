'use client';

import { Bell, Shield, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>

            <div className="space-y-4">
                <section>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Security</h2>
                    <div className="bg-card border border-border rounded-xl divide-y divide-border">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Login Session</p>
                                    <p className="text-xs text-muted-foreground">Manage your current active login session</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Device Management</p>
                                    <p className="text-xs text-muted-foreground">2-step verification is active</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">Notifications</h2>
                    <div className="bg-card border border-border rounded-xl">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                                    <p className="text-xs text-muted-foreground">Receive updates about your health reports</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="bg-red-50 border border-red-100 rounded-xl mt-8">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 text-red-600 hover:bg-red-100/50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">Sign out from all devices</p>
                                <p className="text-xs text-red-500/80">Secures your account in case of any suspicious activity</p>
                            </div>
                        </button>
                    </div>
                </section>
            </div>

            <div className="pt-8 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                    Wellness Hospital v1.0.4 r-72
                </p>
            </div>
        </div>
    );
}
