export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                        <p>By accessing and using Wellness Hospital's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Medical Services</h2>
                        <p>Wellness Hospital provides medical care and services to patients. All medical decisions are made by licensed healthcare professionals. We reserve the right to refuse service in certain circumstances as determined by our medical staff.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Appointments</h2>
                        <p>Appointments can be scheduled online or by phone. We require at least 24 hours notice for cancellations. Repeated no-shows may result in denial of future appointments.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Payment and Billing</h2>
                        <p>Payment is expected at the time of service unless prior arrangements have been made. We accept most major insurance plans. Patients are responsible for any charges not covered by insurance.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Patient Responsibilities</h2>
                        <p>Patients are expected to provide accurate medical history, follow treatment plans, and treat staff and other patients with respect. Violent or abusive behavior will not be tolerated.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                        <p>While we strive to provide the best care possible, Wellness Hospital is not liable for outcomes resulting from patient non-compliance with medical advice or treatment plans.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
                        <p>For questions about these terms, contact us at <a href="mailto:info@wellness-hospital.health" className="text-primary hover:underline">info@wellness-hospital.health</a> or call 6386662345.</p>
                    </section>

                    <p className="text-sm mt-8 pt-8 border-t border-border">Last updated: February 2026</p>
                </div>
            </div>
        </main>
    );
}
