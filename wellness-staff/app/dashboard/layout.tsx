'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { LayoutDashboard, Calendar, Users, Stethoscope, LogOut, Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
        { name: 'Patients', href: '/dashboard/patients', icon: Users },
        { name: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <Image src="/logo.png" alt="Wellness Hospital" width={32} height={32} className="object-contain" />
                    </div>
                    {isSidebarOpen && <span className="font-bold text-lg">Staff Portal</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                title={!isSidebarOpen ? item.name : ''}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full mt-4 flex items-center justify-center text-slate-500 hover:text-white p-2"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
