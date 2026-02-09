import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-[#0B1120] text-slate-400 border-t border-slate-800/50 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                {/* Brand & Newsletter */}
                <div className="col-span-1 md:col-span-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shrink-0">
                            <Image src="/logo.png" alt="Wellness Hospital" width={32} height={32} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap">Wellness Hospital</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs text-slate-400">
                        World-class healthcare committed to your well-being.
                    </p>

                    {/* Newsletter Input - CLEAN & SOLID */}
                    <div className="space-y-3">
                        <div className="relative max-w-sm">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>


                </div>

                {/* Links Grid - Strictly Aligned */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">

                    {/* Services */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Services</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="/emergency">Emergency 24/7</FooterLink>
                            <FooterLink href="/services#cardiology">Heart Inst.</FooterLink>
                            <FooterLink href="/services#orthopedics">Orthopedics</FooterLink>
                            <FooterLink href="/services#pediatrics">Pediatrics</FooterLink>
                            <FooterLink href="/services#neurology">Neurology</FooterLink>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/doctors">Our Doctors</FooterLink>
                            <FooterLink href="/contact">Contact Us</FooterLink>
                            <FooterLink href="/careers">Careers</FooterLink>
                            <FooterLink href="/portal">Patient Portal</FooterLink>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 md:col-span-1 space-y-5 border-t border-slate-800 pt-6 md:pt-0 md:border-none">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact</h3>
                        <ul className="space-y-4 text-sm">
                            <ContactItem Icon={MapPin} text={<>Doddaballapura - 561203<br />Bengaluru, India</>} />
                            <ContactItem Icon={Phone} text="6366662245" />
                            <ContactItem Icon={Mail} text="wellnesshospital8383@gmail.com" />
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Bar - Minimalist */}
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
                <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Wellness Hospital. All rights reserved.</p>
                <div className="flex justify-center md:justify-end gap-6">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    <a href="https://staff.wellness-hospital.health" className="hover:text-blue-400 text-slate-400 transition-colors">Staff Login</a>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ Icon, href }: { Icon: any, href: string }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <a href={href} className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
            <Icon className="w-4 h-4" />
        </a>
    )
}

function ContactItem({ Icon, text }: { Icon: any, text: React.ReactNode }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <li className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-slate-400 leading-snug">{text}</span>
        </li>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-slate-400 hover:text-white transition-colors">
                {children}
            </Link>
        </li>
    );
}
