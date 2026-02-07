import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-slate-50 border-t border-border pt-6 md:pt-16 pb-4 md:pb-8">
            <div className="max-w-7xl mx-auto px-2 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 mb-6 md:mb-12">

                {/* Brand & Description */}
                <div className="space-y-1 md:space-y-4 col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <Image
                            src="/logo.png"
                            alt="Wellness Hospital Logo"
                            width={24}
                            height={24}
                            className="md:w-10 md:h-10"
                        />
                        <span className="text-xs md:text-xl font-bold text-foreground">Wellness Hospital</span>
                    </div>
                    <p className="text-[9px] md:text-base text-muted-foreground leading-tight">
                        World-class healthcare with a personal touch.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-2 md:space-y-4">
                    <h3 className="text-[10px] md:text-base font-semibold text-foreground border-b border-border/50 pb-0.5 md:border-none">Quick Links</h3>
                    <ul className="space-y-1 md:space-y-2">
                        <FooterLink href="/services">Services</FooterLink>
                        <FooterLink href="/doctors">Doctors</FooterLink>
                        <FooterLink href="/appointments">Book Appointment</FooterLink>
                        <FooterLink href="/portal">Patient Portal</FooterLink>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 md:space-y-4">
                    <h3 className="text-[10px] md:text-base font-semibold text-foreground border-b border-border/50 pb-0.5 md:border-none">Contact</h3>
                    <ul className="space-y-1 md:space-y-3">
                        <li className="flex items-start gap-1 md:gap-3 text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5 md:w-5 md:h-5 text-primary shrink-0" />
                            <a href="https://maps.app.goo.gl/fUbAw7S8i1tzBZqz8" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-[9px] md:text-sm">Doddaballapura - 561203</a>
                        </li>
                        <li className="flex items-center gap-1 md:gap-3 text-muted-foreground">
                            <Phone className="w-2.5 h-2.5 md:w-5 md:h-5 text-primary shrink-0" />
                            <span className="text-[9px] md:text-sm">6366662245</span>
                        </li>
                        <li className="flex items-center gap-1 md:gap-3 text-muted-foreground">
                            <Mail className="w-2.5 h-2.5 md:w-5 md:h-5 text-primary shrink-0" />
                            <span className="text-[9px] md:text-sm truncate">wellnesshospital8383@gmail.com</span>
                        </li>
                    </ul>
                </div>

                {/* Emergency */}
                <div className="space-y-2 md:space-y-4 col-span-2 lg:col-span-1">
                    <h3 className="text-[10px] md:text-base font-semibold text-foreground">Emergency</h3>
                    <div className="p-1.5 md:p-4 bg-primary/5 border border-primary/10 rounded-lg md:rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-primary font-bold text-[9px] md:text-base">
                            <Phone className="w-2.5 h-2.5 md:w-5 md:h-5" />
                            <span>24/7 Line</span>
                        </div>
                        <p className="text-[10px] md:text-2xl font-bold text-primary">6366662245</p>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="max-w-7xl mx-auto px-2 md:px-8 pt-3 md:pt-8 border-t border-border flex flex-row items-center justify-between gap-1 text-[8px] md:text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Wellness Hospital</p>
                <div className="flex gap-2 md:gap-6">
                    <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                    <Link href="/terms" className="hover:text-foreground">Terms</Link>
                    <a href="https://staff.wellness-hospital.health" className="hover:text-foreground opacity-50 hover:opacity-100 transition-opacity">Staff Access</a>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    );
}
