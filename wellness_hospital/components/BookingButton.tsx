'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Phone, Calendar, X } from 'lucide-react';

interface BookingButtonProps {
    className?: string;
    text?: string;
}

export default function BookingButton({ className, text = "Book Appointment" }: BookingButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push('/login?callbackUrl=/');
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={className || "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-all"}
            >
                {text}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-border">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Book Your Appointment
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center animate-pulse">
                                <Phone className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">For Enquiries & Appointments</p>
                                <a
                                    href="tel:+916366662245"
                                    className="block text-3xl font-bold text-foreground hover:text-primary transition-colors"
                                >
                                    +91 63666 62245
                                </a>
                            </div>

                            <p className="text-sm text-muted-foreground max-w-xs">
                                Our team is available 24/7 to assist you with booking appointments for all departments.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-muted/30 border-t border-border flex justify-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
