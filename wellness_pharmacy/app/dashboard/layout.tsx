'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Scan, FileText, History, LogOut, Menu, X, Package, Receipt, Pill, Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { format } from 'date-fns';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        const { notifications: data } = await getNotifications();
        const { count } = await getUnreadCount();
        if (data) setNotifications(data);
        if (count !== undefined) setUnreadCount(count);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        fetchNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        fetchNotifications();
    };

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
            <aside className="hidden lg:flex flex-col w-64 bg-[#0B1120] text-white fixed h-full z-30">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/50">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Wellness</span>
                </div>
                <nav className="py-6 px-4 space-y-1.5 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "text-white bg-white/5 font-semibold"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-primary-light rounded-r-full" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-primary-light" : "group-hover:text-white"
                                )} />
                                <span className="text-[14px]">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[14px]">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Navigation */}
            <div className={cn(
                "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden",
                isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
            )} onClick={() => setSidebarOpen(false)}>
                <div
                    className={cn(
                        "w-72 h-full bg-[#0B1120] text-white p-6 transition-transform duration-300 ease-out flex flex-col",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
                            <span className="font-bold text-lg">Wellness</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-xl transition-all",
                                        isActive ? "bg-primary-light text-white font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-base">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-800/50">
                        <button onClick={handleSignOut} className="flex items-center gap-4 px-4 py-4 w-full text-red-400 bg-red-400/5 rounded-xl">
                            <LogOut className="w-6 h-6" />
                            <span className="text-base font-bold">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 lg:ml-64">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="hidden sm:block text-sm font-semibold text-slate-800 uppercase tracking-widest">
                            {navItems.find(i => i.href === pathname)?.name || 'Pharmacy Portal'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all relative group"
                            >
                                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in fade-in scale-in duration-300">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                            <h3 className="font-bold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-xs text-primary-light hover:text-primary font-bold transition-colors"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[450px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">No new messages</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={cn(
                                                            "p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors relative group",
                                                            !n.read && "bg-blue-50/20"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-[13px] font-bold text-slate-900 pr-4">{n.title}</h4>
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {format(new Date(n.createdAt), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-slate-600 mb-2 leading-relaxed">{n.message}</p>
                                                        {!n.read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(n.id)}
                                                                className="text-[10px] text-primary-light font-bold hover:underline"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 p-6 lg:ml-64 mt-16 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
