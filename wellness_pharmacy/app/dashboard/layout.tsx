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
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
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

            {/* Mobile Header & Desktop Top Bar */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="fixed top-0 inset-x-0 lg:left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20">
                    <div className="flex items-center gap-4 lg:hidden">
                        <div className="w-8 h-8 relative flex items-center justify-center">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" priority />
                        </div>
                        <span className="font-bold text-slate-900">Pharmacy</span>
                    </div>

                    <div className="hidden lg:block">
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            {navItems.find(i => i.href === pathname)?.name || 'Pharmacy Portal'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                            <h3 className="font-bold text-slate-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-xs text-primary-light hover:text-primary font-medium"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-sm">
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={cn(
                                                            "p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors relative group",
                                                            !n.read && "bg-blue-50/30"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-sm font-bold text-slate-900 pr-4">{n.title}</h4>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                                {format(new Date(n.createdAt), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{n.message}</p>
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

                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
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
                    "flex-1 p-4 md:p-8 transition-all duration-300 mt-16",
                    "lg:ml-64",
                )}>
                    {children}
                </main>
            </div>
        </div>
    );
}
