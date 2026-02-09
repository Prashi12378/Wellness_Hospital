import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Phone, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const departments = [
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Gynecology'
];

function AppointmentForm() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect via useEffect
    }

    return (
        <main className="min-h-screen bg-muted/30 py-16 px-4">
            <div className="max-w-md mx-auto bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-primary/5 p-6 border-b border-border/50 text-center">
                    <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        Book Appointment
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Online booking is currently paused.
                    </p>
                </div>

                <div className="p-8 flex flex-col items-center text-center space-y-8">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-pulse">
                        <Phone className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">For Enquiries & Appointments</p>
                        <a
                            href="tel:+916366662245"
                            className="block text-3xl font-bold text-foreground hover:text-primary transition-colors"
                        >
                            +91 63666 62245
                        </a>
                        <p className="text-sm font-medium text-foreground/80">
                            (All Departments)
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 w-full text-sm text-muted-foreground border border-border/30">
                        <p>
                            Our support team is available 24/7 to assist you. Please call the number above to schedule your visit.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="text-primary font-medium hover:underline flex items-center gap-2"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function AppointmentsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <AppointmentForm />
        </Suspense>
    );
}
