export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                    <section className="space-y-4">
                        <p>Welcome to Wellness Hospital. We value your privacy and are committed to protecting the personal and medical data of our patients, staff, and visitors. This Privacy Policy describes how we collect, use, and safeguard your information when you use our services, including our web portals and mobile applications, specifically the <strong>Wellness Hospital Mobile Application</strong> (Package ID: <code>com.wellness.hospital.wellness_app</code>).</p>
                        <p>By using our services, you consent to the data collection and usage practices described in this policy. If you do not agree to this policy, please do not access or use our apps or web portals.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">1. Information We Collect</h2>
                        <p>To provide you with quality healthcare and seamless portal access, we collect several categories of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Details:</strong> Name, Date of Birth, Gender, and unique patient identifiers such as UHID (Unique Health ID).</li>
                            <li><strong>Contact Information:</strong> Email address, physical address, and mobile phone number.</li>
                            <li><strong>Medical and Health Records:</strong> Appointments history, medical diagnosis, clinical symptoms, digital prescriptions, lab test requests, and lab reports.</li>
                            <li><strong>Financial Information:</strong> Payment transactions history, invoices details, and billing records.</li>
                            <li><strong>Account Credentials:</strong> Secure password hashes and authentication credentials used to log in to our portals.</li>
                            <li><strong>Device Metadata:</strong> Basic device diagnostics, Operating System version, and log details when using the Mobile Application to ensure safe operations.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">2. How We Use Your Information</h2>
                        <p>We process your personal and health data for the following essential purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Providing medical care, clinical treatments, and consulting services.</li>
                            <li>Scheduling and managing medical appointments with doctors.</li>
                            <li>Generating and distributing digital prescriptions and laboratory diagnostic reports.</li>
                            <li>Processing invoices, pharmacy bills, and managing inventory.</li>
                            <li>Securing your access to our mobile app and portal dashboards via authentication.</li>
                            <li>Sending critical healthcare updates, transactional messages, and security notifications.</li>
                        </ul>
                        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 my-4 rounded-r">
                            <p className="text-emerald-800 font-medium m-0"><strong>Crucial Rule:</strong> We never sell, rent, or trade your personal health records or contact information to any third parties for promotional or marketing purposes.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">3. Data Sharing & Disclosure</h2>
                        <p>We share your data only in the following specific circumstances:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Internal Health Providers:</strong> With hospital staff, medical doctors, and laboratory technicians to coordinate your medical services.</li>
                            <li><strong>Infrastructure Services:</strong> With secure cloud service providers who host our platform databases (such as AWS RDS PostgreSQL databases) and secure object storage (AWS S3) for lab reports.</li>
                            <li><strong>Communication Gateways:</strong> With transaction tools such as Resend (for sending email updates) to deliver clinical information.</li>
                            <li><strong>Legal Compliance:</strong> When required by healthcare laws, public health orders, court orders, or regulations.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">4. Data Security</h2>
                        <p>We implement strict administrative, technical, and physical security measures to safeguard patient data:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All data transmissions are encrypted using standard SSL/TLS protocols.</li>
                            <li>Patient and medical records are stored in secure cloud systems protected by multi-factor authentication and role-based access rules.</li>
                            <li>System logs are regularly audited to check for unauthorized access or security breaches.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">5. Data Retention</h2>
                        <p>We retain your personal and health records as long as your account is active, or as needed to provide healthcare services to you. Additionally, we are legally required by health regulations and medical records archival laws to retain medical records (including prescriptions and reports) for specific minimum statutory durations, even after account closure.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">6. Your Rights & Data Deletion Request</h2>
                        <p>You have full rights over your personal data under healthcare protection frameworks, including the right to access your files, update errors, or export your clinical history. You can manage your information directly through the patient portal dashboards.</p>
                        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 my-4 rounded-r space-y-2">
                            <p className="text-emerald-950 font-bold">How to Request Account & Data Deletion:</p>
                            <p className="text-emerald-900 m-0">You can request complete deletion of your portal account and personal details by contacting our Data Protection Officer at <a href="mailto:privacy@wellness-hospital.health" className="text-emerald-700 underline font-semibold hover:text-emerald-800">privacy@wellness-hospital.health</a>. Upon receiving your verified request, we will delete your login credentials and personal identifiers within 30 days, except where we are legally required to retain medical records for compliance or health regulations.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">7. Mobile App Permissions</h2>
                        <p>To deliver specific features, the <strong>Wellness Hospital App</strong> may request permissions to access certain device resources:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Camera / Files:</strong> Used only if you upload profile pictures or choose to upload existing health reports.</li>
                            <li><strong>Storage:</strong> Required to download and save your digital prescriptions and lab reports locally on your phone.</li>
                        </ul>
                        <p>You can revoke these permissions at any time via your device's settings menu without losing core access to the application.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4 border-l-4 border-emerald-600 pl-3">8. Contact & Support</h2>
                        <p>If you have questions, feedback, or concerns regarding your privacy or this policy, please contact our Data Protection Officer:</p>
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 max-w-md">
                            <p className="text-slate-800 m-0 flex justify-between"><span className="font-semibold text-slate-900">Organization:</span> Wellness Hospital & Research Centre</p>
                            <p className="text-slate-800 m-0 flex justify-between"><span className="font-semibold text-slate-900">Email Support:</span> <a href="mailto:privacy@wellness-hospital.health" className="text-emerald-600 hover:underline">privacy@wellness-hospital.health</a></p>
                            <p className="text-slate-800 m-0 flex justify-between"><span className="font-semibold text-slate-900">Contact Number:</span> 6386662345</p>
                        </div>
                    </section>

                    <p className="text-sm mt-8 pt-8 border-t border-border">Last updated: February 2026</p>
                </div>
            </div>
        </main>
    );
}
