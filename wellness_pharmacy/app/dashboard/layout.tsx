'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Scan, FileText, History, LogOut, Menu, X, Package, Receipt, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Scan },
        { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
        { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
        { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
        { name: 'Customer History', href: '/dashboard/history', icon: History },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-blue-100 rounded-lg">
                        <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-lg">Pharmacy</span>
                </div>
                <nav className="p-4 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive ? "bg-primary-light text-white shadow-lg shadow-primary-light/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
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
            <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-blue-100 rounded-lg">
                        <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold">Pharmacy</span>
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
                                            isActive ? "bg-primary-light text-white" : "text-slate-400"
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
                "lg:ml-64", // Offset for sidebar
                "mt-16 lg:mt-0" // Offset for mobile header
            )}>
                {children}
            </main>
        </div>
    );
}
