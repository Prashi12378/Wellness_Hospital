'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Pill,
    FileText,
    LogOut,
    Menu,
    X,
    Settings,
    Shield,
    Heart,
    Droplet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    if (status === 'loading') { // Optional loading state
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (status === 'unauthenticated') return null;

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
        { name: 'Doctor Management', href: '/dashboard/doctors', icon: Stethoscope },
        { name: 'Health Packages', href: '/dashboard/health-packages', icon: Heart },
        { name: 'Blood@Home', href: '/dashboard/blood-collection', icon: Droplet },
        { name: 'Pharmacy Inventory', href: '/dashboard/inventory', icon: Pill },
        { name: 'Financial Ledger', href: '/dashboard/ledger', icon: FileText },
    ];



    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-800",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0 lg:static",
                    isHovered ? "lg:w-64" : "lg:w-16",
                    "w-64" // Mobile always full width
                )}
            >
                <div className="h-16 flex items-center gap-2 px-3 border-b border-slate-800 overflow-hidden">
                    <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
                        <Image src="/logo.png" alt="Wellness Hospital" width={32} height={32} className="object-contain" priority />
                    </div>
                    <span className={cn(
                        "font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300",
                        isHovered ? "opacity-100" : "lg:opacity-0 lg:w-0"
                    )}>Wellness Hospital</span>
                </div>

                <div className="p-2 space-y-1">
                    <div className={cn(
                        "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 transition-opacity duration-300",
                        isHovered ? "opacity-100" : "lg:opacity-0 lg:h-0 lg:mb-0"
                    )}>Main Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                                title={!isHovered ? item.name : undefined}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className={cn(
                                    "whitespace-nowrap transition-all duration-300",
                                    isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                                )}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-2 mt-auto border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 w-full transition-colors"
                        title={!isHovered ? "Sign Out" : undefined}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        )}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                A
                            </div>
                            <span className="hidden md:inline font-medium">Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
