import Image from 'next/image';
import { Phone, Clock, MapPin, AlertTriangle, Ambulance } from 'lucide-react';

const emergencyServices = [
    { image: '/images/cardiac-emergency-v2.png', title: 'Cardiac Emergency', description: '24/7 chest pain & heart attack care', color: 'bg-blue-50' },
    { image: '/images/stroke-care-v3.png', title: 'Stroke Care', description: 'Rapid assessment & intervention', color: 'bg-blue-50' },
    { image: '/images/trauma-center.png', title: 'Trauma Center', description: 'Accident & injury treatment', color: 'bg-blue-50' },
    { image: '/images/pediatric-emergency.png', title: 'Pediatric Emergency', description: 'Specialized child emergency care', color: 'bg-blue-50' },
];

export default function EmergencyPage() {
    return (
        <main className="min-h-screen">
            {/* Emergency Banner */}
            <div className="bg-primary text-white py-4">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-lg font-medium">For Life-Threatening Emergencies</span>
                    <a href="tel:8105666338" className="text-3xl font-bold hover:underline flex items-center gap-2">
                        <Phone className="w-6 h-6" /> 8105666338
                    </a>
                </div>
            </div>

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            24/7 Emergency Services
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            In an emergency, every second counts. Our team of experienced doctors and nurses is ready to help you 24/7 with the care and urgency you need.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="tel:8105666338" className="inline-flex h-12 px-6 items-center gap-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                <Phone className="w-5 h-5" /> Emergency: 8105666338
                            </a>
                            <a href="/ambulance" className="inline-flex h-12 px-6 items-center gap-2 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                                <Ambulance className="w-5 h-5" /> Request Ambulance
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Info */}
            <section className="py-12 bg-card border-y border-border">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Open 24/7</h3>
                        <p className="text-sm text-muted-foreground">Always available, every day of the year</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Central Location</h3>
                        <a href="https://maps.app.goo.gl/fUbAw7S8i1tzBZqz8" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground cursor-pointer block">Beside friend function hall, Gowribidnur main road, Palanjoghalli, Doddaballapur - 561203</a>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
                            <Ambulance className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground">Ambulance Fleet</h3>
                        <p className="text-sm text-muted-foreground">10+ fully equipped ambulances</p>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Emergency Services</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            From minor injuries to critical care, we provide specialized medical attention the moment you walk through our doors.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {emergencyServices.map((service) => (
                            <div key={service.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow overflow-hidden group">
                                <div className={`w-full aspect-square rounded-lg flex items-center justify-center mb-4 overflow-hidden transition-colors ${service.color}`}>
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        width={250}
                                        height={250}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What to Expect */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What to Expect</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: '1', title: 'Arrival & Triage', desc: 'Our team will immediately assess your condition to ensure the most critical cases are seen first.' },
                            { step: '2', title: 'Fast Registration', desc: 'We take only the essential details while our medical team starts looking after you.' },
                            { step: '3', title: 'Care & Treatment', desc: 'You will receive personalized attention from our skilled emergency specialists.' },
                            { step: '4', title: 'Next Steps', desc: 'We help you with clear discharge instructions or arrange for admission if you need further observation.' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
