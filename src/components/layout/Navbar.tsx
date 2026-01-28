"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Heart, LogOut, Settings } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
            setIsProfileOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

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
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-gold-500"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white">
                                        <User size={16} />
                                    </div>
                                )}
                                <span className={clsx("font-medium text-sm", isScrolled ? "text-maroon-900" : "text-ivory-50")}>
                                    {user.displayName?.split(" ")[0] || "Profile"}
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-maroon-100 py-2 z-50"
                                    >
                                        {user.email && (
                                            <div className="px-4 py-3 border-b border-maroon-100">
                                                <p className="text-xs text-gray-500">Logged in as</p>
                                                <p className="text-sm font-medium text-maroon-900 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        )}
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-maroon-900 hover:bg-maroon-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User size={18} />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-maroon-900 hover:bg-maroon-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings size={18} />
                                            <span>Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gold-600 hover:bg-gold-50 transition-colors border-t border-maroon-100 text-left"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
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
                            {user ? (
                                <>
                                    {user.email && (
                                        <div className="px-2 py-2 bg-maroon-50 rounded">
                                            <p className="text-xs text-gray-500">Logged in as</p>
                                            <p className="text-sm font-medium text-maroon-900 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    )}
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-2 text-maroon-900 font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User size={20} /> My Profile
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 text-maroon-900 font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Settings size={20} /> Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 text-white bg-gold-500 px-4 py-2 rounded-full font-medium hover:bg-gold-600"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
