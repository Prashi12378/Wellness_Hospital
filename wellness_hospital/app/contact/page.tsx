'use client';

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle, Send } from "lucide-react";


export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
    });

    // Optional: Pre-fill if user is logged in (using NextAuth)
    // For contact forms, often fine to be anonymous or manually entered, preventing complexity.
    // Let's assume anonymous for now regarding pre-fill to simplify, or add useSession later if essential.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to send message");

            setSuccess(true);
            setFormData(prev => ({
                ...prev,
                subject: "",
                message: ""
            }));
        } catch (err: any) {
            console.error(err);
            setError("Failed to send message. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background py-4 md:py-20 px-2 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 gap-3 md:gap-24">

                {/* Contact Information */}
                <div className="space-y-4 md:space-y-12">
                    <div className="space-y-1 md:space-y-4">
                        <h1 className="text-sm md:text-4xl font-bold text-foreground">Get in Touch</h1>
                        <p className="text-[9px] md:text-lg text-muted-foreground leading-tight">
                            We're here to help. Emergency: 8105666338.
                        </p>
                    </div>

                    <div className="space-y-3 md:space-y-8">
                        <ContactItem icon={MapPin} title="Visit" content="Beside friend function hall, Gowribidnur main road, Palanjoghalli, Doddaballapur - 561203" href="https://maps.app.goo.gl/fUbAw7S8i1tzBZqz8" />
                        <ContactItem icon={Phone} title="Call" content="8105666338" />
                        <ContactItem icon={Mail} title="Email" content="wellnesshospital8383@gmail.com" />
                    </div>

                    {/* Emergency Box */}
                    <div className="p-2 md:p-8 bg-primary/5 border border-primary/10 rounded-lg md:rounded-2xl flex items-center md:flex-row gap-2 md:gap-6">
                        <div className="w-6 h-6 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                            <Phone className="w-3 h-3 md:w-8 md:h-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[9px] md:text-xl font-bold text-primary truncate">Urgent help?</h3>
                            <div className="text-[10px] md:text-3xl font-bold text-primary truncate">8105666338</div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card border border-border p-2 md:p-8 rounded-lg md:rounded-2xl shadow-sm">
                    {success ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-4">
                            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                            <h2 className="text-xs md:text-2xl font-bold text-foreground">Sent!</h2>
                            <button onClick={() => setSuccess(false)} className="text-[9px] md:text-base text-primary hover:underline">Send another</button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xs md:text-2xl font-bold mb-3 md:mb-6 text-foreground">Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-6">
                                {error && <div className="p-1.5 rounded bg-red-50 text-red-600 text-[8px]">{error}</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full h-7 md:h-11 px-2 rounded border border-border bg-background text-[9px] md:text-base"
                                        placeholder="First Name"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full h-7 md:h-11 px-2 rounded border border-border bg-background text-[9px] md:text-base"
                                        placeholder="Last Name"
                                    />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-7 md:h-11 px-2 rounded border border-border bg-background text-[9px] md:text-base"
                                    placeholder="Email Address"
                                />
                                <textarea
                                    rows={3}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full p-2 rounded border border-border bg-background text-[9px] md:text-base resize-none"
                                    placeholder="Message..."
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-8 md:h-12 bg-primary text-primary-foreground text-[9px] md:text-base font-semibold rounded hover:bg-primary/90 transition-colors"
                                >
                                    {loading ? "..." : "Send"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

function ContactItem({ icon: Icon, title, content, href }: { icon: any, title: string, content: string, href?: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">{content}</a>
                ) : (
                    <p className="text-muted-foreground">{content}</p>
                )}
            </div>
        </div>
    )
}
