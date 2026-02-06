import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wellness Hospital | Hospital Management",
  description: "Administrative Dashboard for Wellness Hospital",
  icons: {
    icon: "/favicon.ico",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.variable,
          "antialiased min-h-screen bg-background font-sans text-foreground"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
