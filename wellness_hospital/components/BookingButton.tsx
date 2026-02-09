'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Phone, Calendar, X } from 'lucide-react';

interface BookingButtonProps {
    className?: string;
    text?: string;
}

export default function BookingButton({ className, text = "Book Appointment" }: BookingButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

            {showModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 relative">

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                <Calendar className="w-5 h-5 text-primary" />
                                Book Appointment
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors bg-slate-50"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center text-center space-y-6 bg-white">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                                <Phone className="w-9 h-9 text-primary" />
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Call for Booking</p>
                                <a
                                    href="tel:+918105666338"
                                    className="block text-3xl font-extrabold text-slate-900 hover:text-primary transition-colors tracking-tight"
                                >
                                    +91 63666 62245
                                </a>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Our support team is available <span className="font-semibold text-slate-900">24/7</span> to assist you with appointments.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
