export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                        <p>At Wellness Hospital, we collect information necessary to provide you with quality healthcare services. This includes personal information such as your name, contact details, medical history, and insurance information.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                        <p>Your information is used solely for providing medical care, scheduling appointments, processing insurance claims, and communicating important health information. We never sell or share your personal health information with third parties for marketing purposes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                        <p>We implement industry-standard security measures to protect your personal and medical information. Our systems are encrypted and regularly audited to ensure compliance with healthcare privacy regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                        <p>You have the right to access, correct, or request deletion of your personal information. You may also request a copy of your medical records at any time by contacting our medical records department.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                        <p>If you have any questions about our privacy practices, please contact us at <a href="mailto:privacy@wellness-hospital.health" className="text-primary hover:underline">privacy@wellness-hospital.health</a> or call us at 6386662345.</p>
                    </section>

                    <p className="text-sm mt-8 pt-8 border-t border-border">Last updated: February 2026</p>
                </div>
            </div>
        </main>
    );
}
