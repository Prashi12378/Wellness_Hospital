"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Routes that should NOT show the main Navbar and Footer
const excludedRoutes = ["/portal", "/dashboard", "/login"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const shouldShowNav = !excludedRoutes.some(route => pathname.startsWith(route));

    return (
        <>
            {shouldShowNav && <Navbar />}
            <div className="flex-1">{children}</div>
            {shouldShowNav && <Footer />}
        </>
    );
}
