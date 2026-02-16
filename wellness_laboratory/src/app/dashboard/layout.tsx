"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    FlaskConical,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ClipboardList,
    History,
    Settings,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Test Requests", href: "/dashboard/requests", icon: ClipboardList },
        { name: "Lab History", href: "/dashboard/history", icon: History },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-screen z-10">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950">
                    <FlaskConical className="w-8 h-8 text-primary" />
                    <span className="font-bold text-lg">Wellness Lab</span>
                </div>

                <div className="px-6 py-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center">
                            <FlaskConical className="w-5 h-5 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-slate-400">Lab Technician</p>
                            <p className="font-semibold text-sm truncate">
                                {session?.user?.name || "Lab Staff"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="px-4 py-6 space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Topbar */}
            <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-primary" />
                    <span className="font-bold">Wellness Lab</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="w-72 h-full bg-slate-900 text-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-primary">
                                <FlaskConical className="w-6 h-6" />
                                <span className="font-bold text-white uppercase tracking-wider">Wellness Lab</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)}>
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium",
                                            isActive ? "bg-primary text-white" : "text-slate-400"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 border-t border-slate-800 mt-4">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-4 px-4 py-3.5 w-full text-red-400 font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 transition-all duration-300 min-h-screen">
                <div className="p-4 md:p-8 pt-20 md:pt-8">{children}</div>
            </main>
        </div>
    );
}
