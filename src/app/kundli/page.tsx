"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Star, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function KundliPage() {
    const [partner1, setPartner1] = useState({ name: "", dob: "", time: "", place: "" });
    const [partner2, setPartner2] = useState({ name: "", dob: "", time: "", place: "" });
    const [result, setResult] = useState<{ score: number, desc: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const calculateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        const randomScore = Math.floor(Math.random() * (36 - 18 + 1) + 18); // Pass score > 18
        setResult({
            score: randomScore,
            desc: randomScore > 25 ? "Excellent Match" : "Good Match"
        });
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-ivory-50 font-sans pb-12">
            <Navbar />
            <div className="pt-32 pb-12 container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-maroon-900 mb-2">Kundli Matching</h1>
                    <p className="text-maroon-600">Vedic astrology compatibility check for prospective couples.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Partner 1 Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-maroon-50">
                        <h3 className="text-xl font-bold text-maroon-800 mb-4 flex items-center gap-2">
                            <Star className="text-gold-500" size={20} /> Groom Details
                        </h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Full Name"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner1.name} onChange={(e) => setPartner1({ ...partner1, name: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner1.dob} onChange={(e) => setPartner1({ ...partner1, dob: e.target.value })}
                            />
                            <input
                                type="time"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner1.time} onChange={(e) => setPartner1({ ...partner1, time: e.target.value })}
                            />
                            <input
                                placeholder="Place of Birth"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner1.place} onChange={(e) => setPartner1({ ...partner1, place: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Partner 2 Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-maroon-50">
                        <h3 className="text-xl font-bold text-maroon-800 mb-4 flex items-center gap-2">
                            <Star className="text-gold-500" size={20} /> Bride Details
                        </h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Full Name"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner2.name} onChange={(e) => setPartner2({ ...partner2, name: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner2.dob} onChange={(e) => setPartner2({ ...partner2, dob: e.target.value })}
                            />
                            <input
                                type="time"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner2.time} onChange={(e) => setPartner2({ ...partner2, time: e.target.value })}
                            />
                            <input
                                placeholder="Place of Birth"
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg outline-none focus:ring-1 focus:ring-maroon-500"
                                value={partner2.place} onChange={(e) => setPartner2({ ...partner2, place: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={calculateMatch}
                        disabled={loading}
                        className="px-8 py-3 bg-maroon-900 text-ivory-50 text-lg font-bold rounded-full hover:bg-maroon-800 transition-colors shadow-lg disabled:opacity-70"
                    >
                        {loading ? "Calculating Stars..." : "Check Compatibility"}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto mt-12 bg-white border-2 border-gold-300 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 left-0" />
                        <div className="w-24 h-24 bg-maroon-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gold-400">
                            <span className="text-3xl font-bold text-maroon-900">{result.score}/36</span>
                        </div>
                        <h2 className="text-3xl font-serif text-maroon-900 font-bold mb-2">{result.desc}</h2>
                        <p className="text-maroon-600 mb-6">
                            The astrological charts indicate a high level of harmony and prosperity for this union.
                        </p>
                        <button className="flex items-center gap-2 px-4 py-2 border border-maroon-200 rounded-lg mx-auto text-maroon-800 hover:bg-maroon-50 transition-colors">
                            <FileText size={18} /> Download Full Report
                        </button>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
