'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Calendar, FileText, CreditCard, Pill, TestTube, ChevronRight, Bell, Settings, LogOut, LayoutDashboard, ArrowLeft, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/portal' },
    { icon: User, label: 'My Profile', href: '/portal/profile' },
    { icon: Calendar, label: 'Appointments', href: '/portal/appointments' },
    { icon: FileText, label: 'Medical Records', href: '/portal/records' },
    { icon: TestTube, label: 'Lab Reports', href: '/portal/reports' },
    { icon: Pill, label: 'Prescriptions', href: '/portal/prescriptions' },
    { icon: CreditCard, label: 'Billing & Payments', href: '/portal/billing' },
    { icon: Settings, label: 'Settings', href: '/portal/settings' },
];

interface PatientAuth {
    isAuthenticated: boolean;
    id: string;
    name: string;
    email: string;
    phone: string;
}

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [patient, setPatient] = useState<PatientAuth | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (session?.user) {
            // In a real app we might fetch more profile details here if needed, 
            // but session usually has what we need for the layout header.
            // We can assume session.user is populated properly.
            const user = session.user as any; // Cast if needed for custom props like uhid or phone if added to session

            if (!user.name) {
                // Maybe redirect to completion or just show generic?
                // For now, assume consistent.
            }

            setPatient({
                isAuthenticated: true,
                id: (user.uhid || user.id || '').toUpperCase(), // Display UHID if available
                name: user.name || 'User',
                email: user.email || '',
                phone: '', // Phone might need profile fetch if critical here, but likely fine to omit or fetch
            });
            setLoading(false);
        }
    }, [status, session, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!patient) return null;

    const initials = patient.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <main className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="bg-primary text-primary-foreground py-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                        <Image src="/logo-final.png" alt="Wellness Hospital" width={48} height={48} style={{ height: 'auto' }} />
                        <div>
                            <h1 className="text-xl font-bold">Patient Portal</h1>
                            <p className="text-sm text-primary-foreground/80">Welcome back, {patient.name}</p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg"><Bell className="w-5 h-5" /></button>
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-2 rounded-lg"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-2 md:px-8 py-4 md:py-8">
                <div className="flex gap-4 md:gap-8 min-h-[calc(100vh-12rem)]">
                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside className={`
                        fixed md:static top-0 left-0 h-full md:h-auto
                        w-64 md:w-64 shrink-0 z-50
                        transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}>
                        <div className="bg-card rounded-none md:rounded-xl border-r md:border border-border overflow-hidden h-full md:h-auto md:sticky md:top-20 md:top-32 shadow-sm">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                        {initials}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-foreground text-sm truncate">{patient.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{patient.id}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === item.href
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {pathname === item.href && (
                                            <div className="w-1 h-4 bg-primary rounded-full ml-auto" />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                            <nav className="px-2 pb-2">
                                <div className="my-2 border-t border-border mx-2" />
                                <Link
                                    href="/"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="text-sm font-medium">Back to Home Page</span>
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}

