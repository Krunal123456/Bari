import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Bari Samaj | Unity & Tradition",
  description: "Official Bari Samaj Community Platform - Honoring Tradition, Embracing Future.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bari Samaj",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#5D001E",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { MobileNav } from "@/components/layout/MobileNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased scroll-smooth`}>
      <body className="bg-ivory-50 text-maroon-900 font-sans min-h-screen flex flex-col pb-16 md:pb-0">
        <AuthProvider>
          {children}
          <InstallPrompt />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
