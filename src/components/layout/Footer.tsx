"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    const router = useRouter();
    return (
        <footer className="bg-maroon-900 text-ivory-100 pt-16 pb-8 font-sans">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-3xl font-bold text-gold-400">Bari Samaj</h3>
                        <p className="text-maroon-200 leading-relaxed">
                            Uniting our community, preserving our traditions, and building a brighter future together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-gold-200 mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'About Us', href: '/about' },
                                    { label: 'Our History', href: '/about#history' },
                                    { label: 'Executive Committee', href: '#' },
                                    { label: 'Privacy Policy', href: '/privacy' },
                                    { label: 'Terms of Service', href: '/terms' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="text-maroon-100 hover:text-gold-300 transition-colors"
                                            onClick={(e) => {
                                                // client-side navigation for reliability
                                                if (typeof window !== 'undefined') {
                                                    e.preventDefault();
                                                    router.push(item.href);
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-gold-200 mb-6">Services</h4>
                        <ul className="space-y-3">
                            {["Matrimony", "Kundli Matching", "Community Directory", "Events Calendar", "Donations"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-maroon-100 hover:text-gold-300 transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif text-lg font-bold text-gold-200 mb-6">Contact Us</h4>
                        <div className="space-y-4 text-maroon-100">
                            <div className="flex items-start gap-3">
                                <MapPin className="shrink-0 mt-1" size={18} />
                                <span>123 Community Hall Road,<br />Surat, Gujarat, India 395006</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={18} />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} />
                                <span>contact@barisamaj.com</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-maroon-800 rounded-full hover:bg-gold-600 transition-colors">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-maroon-800 pt-8 text-center text-maroon-300 text-sm">
                    <p>&copy; {new Date().getFullYear()} Bari Samaj Community. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
