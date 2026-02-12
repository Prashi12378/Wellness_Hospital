import Link from "next/link";
import Image from "next/image";
import { Heart, Brain, Baby, Bone, Eye, Stethoscope, Microscope, Pill, ArrowRight, AlertTriangle, Shield, Activity, Droplet, Sparkles, Wind, Scissors } from "lucide-react";
import BookingButton from "@/components/BookingButton";

const departments = [
    { icon: Heart, image: "/images/cardiology-v2.png", title: "Cardiology", description: "Comprehensive heart care with advanced diagnostics, non-invasive cardiology, and expert treatment for cardiovascular conditions." },
    { icon: Brain, image: "/images/neurology.png", title: "Neurology", description: "Specialized care for disorders of the nervous system, including brain, spinal cord, and peripheral nerves with advanced imaging." },
    { icon: Baby, image: "/images/pediatrics.png", title: "Pediatrics", description: "Providing a wide range of healthcare services for newborns, infants, and children to ensure healthy growth and development." },
    { icon: Bone, image: "/images/orthopedics.png", title: "Orthopedics", description: "Expert care for bone, joint, and muscle conditions, including fracture management, joint replacements, and sports medicine." },
    { icon: Eye, image: "/images/ophthalmology.png", title: "Ophthalmology", description: "Complete eye care services ranging from routine exams to advanced surgeries like cataract and refractive procedures." },
    { icon: Stethoscope, image: "/images/general-medicine.png", title: "General Medicine", description: "Primary healthcare services for adults, focusing on preventive medicine, chronic disease management, and general wellness." },
    { icon: Droplet, image: "/images/radiology.png", title: "Radiology", description: "Advanced diagnostic imaging services including X-Ray, Ultrasound, and CT scans for precise medical evaluation." },
    { icon: Activity, image: "/images/physiotherapy.png", title: "Physiotherapy", description: "Personalized rehabilitation programs to restore mobility, strength, and function after injury or surgery." },
    { icon: Shield, image: "/images/gastroenterology.png", title: "Gastroenterology", description: "Specialized treatment for digestive system disorders, including liver, gallbladder, and pancreatic conditions." },
    { icon: Baby, image: "/images/gynecology.png", title: "Gynecology & Obstetrics", description: "Specialized care for women's reproductive health, prenatal care, and safe childbirth services with a compassionate approach." },
    { icon: Sparkles, image: "/images/dermatology.png", title: "Dermatology", description: "Expert diagnosis and treatment for all skin, hair, and nail conditions, including medical, surgical, and cosmetic dermatology." },
    { icon: Wind, image: "/images/pulmonology.png", title: "Pulmonology", description: "Comprehensive care for respiratory and lung-related conditions, specializing in asthma, COPD, and sleep-related breathing disorders." },
    { icon: Scissors, image: "/images/general-surgery.png", title: "General Surgery", description: "Broad-spectrum surgical services for various conditions of the abdomen, digestive tract, endocrine system, and more." },
    { icon: AlertTriangle, image: "/images/emergency-care.png", title: "Emergency Care", description: "24/7 emergency medical services with a rapid response team and life-support equipment for critical care situations.", href: "/emergency" },
    { icon: Microscope, image: "/images/pathology.png", title: "Pathology", description: "State-of-the-art laboratory services for accurate and timely diagnostic testing across all medical disciplines.", showAction: false },
    { icon: Pill, image: "/images/pharmacy.png", title: "Pharmacy", description: "A fully stocked 24/7 pharmacy providing all essential medications and professional counseling with home delivery options.", showAction: false },
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Medical Services</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Wellness Hospital provides world-class healthcare across multiple specialties. Our dedicated experts and advanced technology ensure you receive the best possible care.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 md:py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {departments.map((dept: any) => (
                            <div
                                key={dept.title}
                                id={dept.title.toLowerCase().replace(/\s+/g, '-')}
                                className="group flex flex-col rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-300 overflow-hidden h-full scroll-mt-24"
                            >
                                <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-50">
                                    {dept.image ? (
                                        <Image src={dept.image} alt={dept.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center transition-colors group-hover:from-primary/10 group-hover:to-primary/30">
                                            <dept.icon className="w-16 h-16 text-primary/30 group-hover:text-primary transition-all duration-500 group-hover:scale-110" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary lg:hidden group-hover:flex">
                                            <dept.icon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{dept.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">{dept.description}</p>
                                    {dept.showAction !== false && (
                                        <Link href={dept.href || "/contact"} className="mt-auto flex items-center gap-2 text-primary text-sm font-semibold hover:gap-3 transition-all">
                                            {dept.href ? "Learn More" : "Book Consultation"} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 md:py-28 px-4 md:px-8 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 italic">Committed to Your Health and Well-being</h2>
                    <p className="text-primary-foreground/90 mb-10 text-lg max-w-xl mx-auto">
                        Experience compassionate care from the best medical professionals in the region.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <BookingButton
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl bg-white text-primary font-bold hover:bg-white/95 transition-all shadow-lg active:scale-95"
                            text="Book Appointment"
                        />
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all active:scale-95"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
