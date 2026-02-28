'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, LogOut, Menu, X, Stethoscope, Pill } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Logo from '../../../public/doctor-logo.png';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { data: session } = useSession();

    // Helper to normalize doctor name and avoid double "Dr."
    const getNormalizedName = (firstName: string, lastName: string) => {
        let name = `${firstName || ''} ${lastName || ''}`.trim();
        if (!name) return 'Doctor';
        // Remove existing Dr. prefix (case insensitive, with or without dot, and handles multiple occurrences)
        const cleanedName = name.replace(/^(dr\.?\s*)+/i, '').trim();
        return `${cleanedName}`;
    };

    const doctorName = (session?.user as any)?.firstName
        ? getNormalizedName((session?.user as any).firstName, (session?.user as any).lastName)
        : 'Doctor';

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const navItems = [
        { name: 'My Appointments', href: '/dashboard', icon: Calendar },
        { name: 'Patient History', href: '/dashboard/history', icon: Users },
        { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: Pill },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex print:block print:h-auto print:bg-white">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10 print:hidden">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <Image
                            src={Logo}
                            alt="Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                    <span className="font-bold text-lg">Doctor Portal</span>
                </div>

                <div className="px-6 py-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 border border-slate-800">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Welcome,</p>
                            <p className="font-semibold text-sm">{doctorName}</p>
                        </div>
                    </div>
                </div>

                <nav className="px-4 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20 print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <Image
                            src={Logo}
                            alt="Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                    <span className="font-bold">Doctor Portal</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="w-64 h-full bg-slate-900 text-white p-4" onClick={e => e.stopPropagation()}>
                        <nav className="space-y-2 mt-16">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                            isActive ? "bg-primary text-white" : "text-slate-400"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl mt-4">
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={cn(
                "flex-1 p-4 md:p-8 transition-all duration-300",
                "lg:ml-64 print:ml-0",
                "mt-16 lg:mt-0 print:mt-0",
                "print:p-0"
            )}>
                {children}
            </main>
        </div>
    );
}
