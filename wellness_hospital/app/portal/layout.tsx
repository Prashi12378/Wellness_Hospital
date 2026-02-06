'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Calendar, FileText, CreditCard, Pill, TestTube, ChevronRight, Bell, Settings, LogOut, LayoutDashboard, ArrowLeft } from 'lucide-react';
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
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg"><Bell className="w-5 h-5" /></button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm hover:bg-white/10 px-3 py-2 rounded-lg"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-2 md:px-8 py-4 md:py-8">
                <div className="flex gap-4 md:gap-8 min-h-[calc(100vh-12rem)]">
                    {/* PC-Style Sidebar (Always visible) */}
                    <aside className="w-[60px] xs:w-[80px] md:w-64 shrink-0">
                        <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-20 md:top-32 shadow-sm">
                            <div className="p-2 md:p-4 border-b border-border bg-muted/30">
                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs md:text-sm">
                                        {initials}
                                    </div>
                                    <div className="overflow-hidden text-center md:text-left hidden xs:block">
                                        <p className="font-bold text-foreground text-[8px] md:text-sm truncate">{patient.name}</p>
                                        <p className="text-[7px] md:text-[10px] text-muted-foreground truncate uppercase tracking-wider">{patient.id}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-1 md:p-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:py-2.5 rounded-lg transition-all ${pathname === item.href
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        title={item.label}
                                    >
                                        <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                                        <span className="text-[8px] md:text-sm font-medium hidden md:block">{item.label}</span>
                                        <span className="text-[7px] font-bold md:hidden block text-center leading-tight">
                                            {item.label.split(' ')[0]}
                                        </span>
                                        {pathname === item.href && (
                                            <div className="hidden md:block w-1 h-4 bg-primary rounded-full ml-auto" />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                            <nav className="px-1 md:px-2 pb-2">
                                <div className="my-1 md:my-2 border-t border-border mx-2" />
                                <Link
                                    href="/"
                                    className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:py-2.5 rounded-lg transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
                                    title="Back to Home Page"
                                >
                                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="text-[8px] md:text-sm font-medium hidden md:block">Back to Home Page</span>
                                    <span className="text-[7px] font-bold md:hidden block text-center leading-tight">Home</span>
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

