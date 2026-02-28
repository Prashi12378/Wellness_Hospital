'use client';

import { useState, useEffect } from 'react';
import { Pill, AlertCircle, ShoppingCart, Clock, Hash } from 'lucide-react';
import Link from 'next/link';

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const res = await fetch('/api/prescriptions');
                if (res.ok) {
                    const data = await res.json();
                    setPrescriptions(data);
                }
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Active Prescriptions</h1>
            </div>

            {prescriptions.length > 0 ? (
                <div className="grid gap-4">
                    {prescriptions.map((px) => (
                        <div key={px.id} className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 shrink-0 border border-green-100">
                                        <Pill className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{px.medication}</h3>
                                        <p className="text-sm text-primary font-medium">{px.doctor_name}</p>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1 font-medium border border-border">
                                                <Clock className="w-3 h-3" /> {px.frequency}
                                            </span>
                                            <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1 font-medium border border-border">
                                                <Hash className="w-3 h-3" /> {px.dosage}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Prescribed On</p>
                                    <p className="text-sm font-semibold">{new Date(px.created_at).toLocaleDateString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Duration: {px.duration || 'As needed'}</p>
                                </div>
                            </div>
                            {px.notes && (
                                <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground border border-border/50">
                                    <span className="font-bold text-foreground/70 not-italic mr-1">Note:</span> {px.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                            <Pill className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No active prescriptions</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                            Digitized prescriptions from your doctors at Wellness Hospital will appear here automatically.
                        </p>

                    </div>
                </div>
            )}

            <div className="bg-muted/30 border border-border rounded-xl p-6">
                <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-lg border border-border shrink-0 h-fit shadow-sm">
                        <AlertCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-1 text-sm">Medication Safety Reminder</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Always follow the dosage and timing instructions provided by your physician.
                            In case of any adverse reactions or severe side effects, please contact our emergency
                            helpline immediately or visit the nearest ER.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground text-sm">Online Pharmacy</h4>
                        <p className="text-xs text-muted-foreground">Order medicines and get home delivery within 2 hours.</p>
                    </div>
                </div>
                <button className="text-primary text-sm font-bold border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap">
                    Coming Soon
                </button>
            </div>
        </div>
    );
}
