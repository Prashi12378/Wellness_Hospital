'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Activity, Brain, Stethoscope, Baby, Shield, CheckCircle, ArrowRight, TestTube, Loader2, Info, ChevronRight } from 'lucide-react';
import PackageDetailsModal from '@/components/PackageDetailsModal';

const iconMap: any = {
    'Stethoscope': Stethoscope,
    'Heart': Heart,
    'Shield': Shield,
    'Activity': Activity,
    'Brain': Brain,
    'Baby': Baby,
    'TestTube': TestTube
};

const colorMap: any = {
    'Stethoscope': 'bg-blue-100 text-blue-600',
    'Heart': 'bg-red-100 text-red-600',
    'Shield': 'bg-purple-100 text-purple-600',
    'Activity': 'bg-pink-100 text-pink-600',
    'Brain': 'bg-amber-100 text-amber-600',
    'Baby': 'bg-green-100 text-green-600',
    'TestTube': 'bg-cyan-100 text-cyan-600'
};

export default function HealthPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPackages(data);
                }
            } catch (error) {
                console.error("Failed to fetch packages", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const openDetails = (pkg: any) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Health Checkup Packages
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Comprehensive health packages designed to assess your overall well-being.
                        Early detection is key to prevention. Book your checkup today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Free Blood@Home
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Reports in 24-48 hrs
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Doctor Consultation
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-2xl">
                            <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-foreground">No Packages Available</h3>
                            <p className="text-muted-foreground">Please check back later for updated health packages.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => {
                                const Icon = iconMap[pkg.icon] || Stethoscope;
                                const colorClass = colorMap[pkg.icon] || 'bg-blue-100 text-blue-600';
                                const discount = pkg.original_price > pkg.price
                                    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`bg-card rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg flex flex-col ${pkg.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                            }`}
                                    >
                                        {pkg.popular && (
                                            <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
                                                Most Popular
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-1">{pkg.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {Array.isArray(pkg.includes) ? pkg.includes.length : 0} tests included
                                            </p>

                                            <div className="flex items-baseline gap-2 mb-6">
                                                <span className="text-3xl font-bold text-foreground">₹{pkg.price.toLocaleString()}</span>
                                                {pkg.original_price > pkg.price && (
                                                    <span className="text-lg text-muted-foreground line-through">₹{pkg.original_price.toLocaleString()}</span>
                                                )}
                                                {discount > 0 && (
                                                    <span className="text-sm text-green-600 font-medium">
                                                        {discount}% off
                                                    </span>
                                                )}
                                            </div>

                                            <div className="border-t border-border pt-4 mb-6 flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-sm font-medium text-foreground">Includes:</p>
                                                    <button
                                                        onClick={() => openDetails(pkg)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1 group/btn"
                                                    >
                                                        View All Details <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {Array.isArray(pkg.includes) && pkg.includes.slice(0, 5).map((item: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> {item}
                                                        </li>
                                                    ))}
                                                    {Array.isArray(pkg.includes) && pkg.includes.length > 5 && (
                                                        <li
                                                            onClick={() => openDetails(pkg)}
                                                            className="text-sm text-primary font-bold cursor-pointer hover:underline flex items-center gap-1.5"
                                                        >
                                                            + {pkg.includes.length - 5} more tests <ArrowRight className="w-3.5 h-3.5" />
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            <Link
                                                href="/blood-collection"
                                                className="w-full h-11 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mt-auto"
                                            >
                                                Book Now <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal */}
            {selectedPackage && (
                <PackageDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    packageName={selectedPackage.name}
                    tests={Array.isArray(selectedPackage.includes) ? selectedPackage.includes : []}
                />
            )}

            {/* CTA */}
            <section className="py-16 md:py-24 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Need a Custom Package?</h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                        Our healthcare advisors can create a personalized health checkup package based on your age,
                        medical history, and specific requirements.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex h-12 px-8 items-center justify-center rounded-lg bg-white text-primary font-medium hover:bg-gray-100 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>
        </main>
    );
}
