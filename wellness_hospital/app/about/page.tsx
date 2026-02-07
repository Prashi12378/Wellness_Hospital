
import { Heart, Award, Users, Clock, Shield, Stethoscope, CheckCircle } from "lucide-react";

const values = [
    { icon: Heart, title: "Compassionate Care", description: "We treat every patient with dignity, respect, and genuine concern for their well-being." },
    { icon: Award, title: "Excellence", description: "We strive for the highest standards in medical practice, technology, and patient outcomes." },
    { icon: Shield, title: "Trust & Safety", description: "Patient safety is paramount. We maintain strict protocols and transparent practices." },
    { icon: Users, title: "Teamwork", description: "Our multidisciplinary teams collaborate seamlessly to provide comprehensive care." },
];

const stats = [
    { value: "10+", label: "Years of Experience" },
    { value: "150+", label: "Expert Doctors" },
    { value: "50,000+", label: "Patients Treated" },
    { value: "24/7", label: "Emergency Care" },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-3xl">
                        <p className="text-primary font-medium mb-4">About Wellness Hospital</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                            Caring for Your Health with Experienced Professionals
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Founded in 2026, Wellness Hospital brings together a team of highly experienced medical professionals with over a decade of expertise. We combine warm, personal care with advanced medical practices to make sure every patient feels seen, heard, and cared for.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</p>
                                <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our goal is simple: to make sure everyone in our community has access to quality healthcare without worrying about the cost. We focus on listening to our patients and building treatments that work for their unique lives.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We aim to be the heart of healthcare in our region—a place where clinical excellence meets a friendly, helping hand. We&apos;re constantly learning and growing so we can keep giving you the best care possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-foreground">Why Choose Wellness Hospital?</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We've assembled a team of healthcare professionals with over 10 years of experience to build a modern healthcare institution that doesn't just treat patients, but cares for people. Our facility is equipped with the latest medical technology, but it's our compassionate approach that truly sets us apart.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { title: "Advanced Diagnostics", desc: "Equipped with high-precision imaging and laboratory technology." },
                                    { title: "24/7 Emergency Support", desc: "A dedicated trauma team ready for any critical situation." },
                                    { title: "Patient-First Approach", desc: "Treatment plans tailored to your specific needs and lifestyle." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Shield className="w-16 h-16 text-primary/40" />
                            </div>
                            <div className="aspect-square bg-green-50 rounded-2xl flex items-center justify-center translate-y-8">
                                <Award className="w-16 h-16 text-green-600/40" />
                            </div>
                            <div className="aspect-square bg-pink-50 rounded-2xl flex items-center justify-center -translate-y-4">
                                <Heart className="w-16 h-16 text-pink-600/40" />
                            </div>
                            <div className="aspect-square bg-amber-50 rounded-2xl flex items-center justify-center translate-y-4">
                                <Clock className="w-16 h-16 text-amber-600/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These principles guide every decision we make and every interaction we have with our patients.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Experience Our Care?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Book an appointment today and let our expert team take care of your health needs.
                    </p>
                    <a
                        href="/appointments"
                        className="inline-flex h-12 px-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors"
                    >
                        Book Appointment
                    </a>
                </div>
            </section>
        </main>
    );
}
