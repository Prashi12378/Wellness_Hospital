'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { LayoutDashboard, Calendar, Users, Stethoscope, LogOut, Menu, Hospital, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
        { name: 'In-Patient (IPD)', href: '/dashboard/ipd', icon: Hospital },
        { name: 'Medical History', href: '/dashboard/history', icon: History },
        { name: 'Patients', href: '/dashboard/patients', icon: Users },
        { name: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    <span className="font-bold">Staff Portal</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col",
                    isSidebarOpen ? 'md:w-64' : 'md:w-20',
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                    "w-64"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <Image src="/logo.png" alt="Wellness Hospital" width={32} height={32} className="object-contain" />
                    </div>
                    {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-lg whitespace-nowrap grow">Front Desk</span>}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                                    isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800',
                                    (!isSidebarOpen && !isMobileMenuOpen) && 'md:justify-center'
                                )}
                                title={!isSidebarOpen ? item.name : ''}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors",
                            (!isSidebarOpen && !isMobileMenuOpen) && 'justify-center'
                        )}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-medium">Sign Out</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden md:flex w-full mt-4 items-center justify-center text-slate-500 hover:text-white p-2 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen transition-all duration-300",
                isSidebarOpen ? 'md:ml-64' : 'md:ml-20',
                "w-full"
            )}>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
