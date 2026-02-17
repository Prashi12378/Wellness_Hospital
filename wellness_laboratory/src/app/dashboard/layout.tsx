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
    const [isHovered, setIsHovered] = useState(false);
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const navItems = [
        { name: "Clinical Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Active Diagnostics", href: "/dashboard/requests", icon: ClipboardList },
        { name: "Results Archive", href: "/dashboard/history", icon: History },
        { name: "Lab Configuration", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "hidden md:flex flex-col bg-slate-900 text-white fixed h-screen z-50 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl overflow-hidden group/sidebar",
                    isHovered ? "w-64" : "w-20"
                )}
            >
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950 flex-shrink-0">
                    <img
                        src="/hospital-logo.png"
                        alt="Hospital Logo"
                        className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
                        style={{ filter: "brightness(1.2) saturate(1.2)" }}
                    />
                    <span className={cn(
                        "font-black text-lg uppercase tracking-tight transition-all duration-300 whitespace-nowrap",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        Wellness Lab
                    </span>
                </div>

                <div className="px-5 py-6 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                            <FlaskConical className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 whitespace-nowrap",
                            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        )}>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight">Lab Portal</p>
                            <p className="font-black text-sm truncate text-white uppercase tracking-tighter">
                                {session?.user?.name || "Technician"}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="px-3 py-6 space-y-2 flex-1 scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-black group relative",
                                    isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]"
                                        : "text-slate-500 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-all duration-300", isActive ? "text-white" : "group-hover:text-primary group-hover:scale-110")} />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap uppercase text-[11px] tracking-wider",
                                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                )}>
                                    {item.name}
                                </span>
                                {!isHovered && !isActive && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 whitespace-nowrap border border-slate-800 shadow-2xl z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "flex items-center gap-4 px-4 py-3.5 w-full text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black group mb-2",
                            !isHovered && "justify-center px-0"
                        )}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                        <span className={cn(
                            "transition-all duration-300 whitespace-nowrap uppercase text-[11px] tracking-wider",
                            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        )}>
                            Exit Portal
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile Topbar */}
            <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20 shadow-lg border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <img src="/hospital-logo.png" alt="Hospital Logo" className="w-8 h-8 object-contain rounded-lg" />
                    <span className="font-bold uppercase tracking-tight text-white">Wellness Lab</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 z-30 md:hidden backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="w-72 h-full bg-slate-900 text-white p-4 shadow-2xl slide-in-from-left duration-300 animate-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <img src="/hospital-logo.png" alt="Hospital Logo" className="w-8 h-8 object-contain rounded-lg" />
                                <span className="font-bold text-white uppercase tracking-wider">Wellness Lab</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-800"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 border-t border-slate-800 mt-6">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-4 px-5 py-4 w-full text-red-400 font-bold hover:bg-red-400/10 rounded-2xl transition-colors"
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
            <main className={cn(
                "flex-1 transition-all duration-300 ease-in-out min-h-screen",
                isHovered ? "md:ml-64" : "md:ml-20"
            )}>
                <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-[1600px] mx-auto">{children}</div>
            </main>
        </div>
    );
}
