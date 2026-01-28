"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Heart } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Traditions", href: "/#traditions" },
        { name: "Matrimony", href: "/matrimony" },
        { name: "Community", href: "/community" },
        { name: "Kundli", href: "/kundli" },
    ];

    return (
        <nav
            className={clsx(
                "fixed top-0 inset-x-0 z-50 transition-all duration-300 font-serif",
                isScrolled
                    ? "bg-ivory-50/80 backdrop-blur-md shadow-sm py-3"
                    : "bg-gradient-to-b from-black/60 to-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className={clsx("text-2xl font-bold tracking-tight transition-colors", isScrolled ? "text-maroon-900" : "text-ivory-50")}>
                    Bari Samaj
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(
                                "transition-colors font-medium hover:text-gold-600",
                                isScrolled ? "text-maroon-800" : "text-ivory-50 text-shadow-sm"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/login"
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
                            isScrolled
                                ? "border-maroon-200 text-maroon-900 hover:bg-maroon-50"
                                : "border-ivory-200/50 text-ivory-50 hover:bg-white/10"
                        )}
                    >
                        <User size={18} />
                        <span>Login</span>
                    </Link>
                    <Link
                        href="/donate"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-white hover:bg-gold-600 transition-colors shadow-sm"
                    >
                        <Heart size={18} />
                        <span>Donate</span>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={clsx("md:hidden transition-colors", isScrolled ? "text-maroon-900" : "text-ivory-50")}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-ivory-50 border-t border-maroon-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg text-maroon-900 font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-maroon-100 my-2" />
                            <Link
                                href="/login"
                                className="flex items-center gap-2 text-maroon-900"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <User size={20} /> Login
                            </Link>
                            <Link
                                href="/donate"
                                className="flex items-center gap-2 text-gold-700 font-semibold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Heart size={20} /> Donate
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
