"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, Ambulance, TestTube, Video, Heart, Phone, Stethoscope, User as UserIcon, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const services = [
    { href: "/services", label: "All Services", icon: Stethoscope },
    { href: "/emergency", label: "Emergency 24/7", icon: Phone },
    { href: "/ambulance", label: "Ambulance Service", icon: Ambulance },
    { href: "/blood-collection", label: "Home Blood Collection", icon: TestTube },
    { href: "/health-packages", label: "Health Packages", icon: Heart },
];

export function Navbar() {
    const [showServices, setShowServices] = useState(false);
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-3 md:px-8">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <Image
                        src="/logo.png"
                        alt="Wellness Hospital Logo"
                        width={32}
                        height={32}
                        className="md:w-[40px] md:h-[40px]"
                    />
                    <Link href="/" className="text-sm md:text-xl font-bold tracking-tight text-foreground whitespace-nowrap">
                        Wellness Hospital
                    </Link>
                </div>

                {/* Scaled Desktop Navigation */}
                <nav className="flex items-center gap-2 md:gap-6">
                    {/* Services Dropdown */}
                    <div
                        className="relative group hidden sm:block"
                    >
                        <button className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1">
                            Services <ChevronDown className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-180 transition-transform" />
                        </button>
                        <div className="absolute top-full left-0 pt-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                            <div className="w-48 md:w-56 bg-card rounded-xl border border-border shadow-lg py-1.5 z-50">
                                {services.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2.5 text-[10px] md:text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <item.icon className="w-3 md:w-4 h-3 md:h-4" />
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link
                        href="/portal"
                        className="h-8 md:h-10 px-2.5 md:px-5 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-[10px] md:text-sm font-medium shadow hover:bg-primary/90 transition-colors"
                    >
                        Patient Portal
                    </Link>
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-[10px] md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
            {children}
        </Link>
    );
}
