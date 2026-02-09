"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Ambulance, TestTube, Heart, Phone, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const services = [
    { href: "/services", label: "All Services", icon: Stethoscope },
    { href: "/emergency", label: "Emergency 24/7", icon: Phone },
    { href: "/ambulance", label: "Ambulance Service", icon: Ambulance },
    { href: "/blood-collection", label: "Home Blood Collection", icon: TestTube },
    { href: "/health-packages", label: "Health Packages", icon: Heart },
];

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-8">
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image
                            src="/logo.png"
                            alt="Wellness Hospital Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 md:w-10 md:h-10"
                        />
                        <span className="text-lg md:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                            Wellness Hospital
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {/* Services Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1">
                            Services <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                        </button>
                        <div className="absolute top-full left-0 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                            <div className="w-56 bg-card rounded-xl border border-border shadow-lg py-1.5 z-50">
                                {services.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <NavLink href="/doctors">Doctors</NavLink>
                    <NavLink href="/about">About Us</NavLink>
                    <NavLink href="/contact">Contact</NavLink>
                </nav>

                {/* Action Buttons & Mobile Toggle */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/portal"
                        className="h-8 md:h-10 px-3 md:px-5 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs md:text-sm font-medium shadow hover:bg-primary/90 transition-colors"
                    >
                        Patient Portal
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-1 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-14 left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-2">
                        <div className="font-semibold text-sm text-foreground mb-1">Services</div>
                        {services.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-muted-foreground text-sm"
                            >
                                <item.icon className="w-4 h-4 text-primary" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-border pt-2 flex flex-col gap-2">
                        <MobileNavLink href="/doctors" onClick={() => setIsMobileMenuOpen(false)}>Doctors</MobileNavLink>
                        <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</MobileNavLink>
                        <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MobileNavLink>
                    </div>
                </div>
            )}
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block p-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
        >
            {children}
        </Link>
    );
}
