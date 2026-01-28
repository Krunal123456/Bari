"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function ProfileDetail() {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, "matrimony_profiles", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error:", error);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-ivory-50 flex items-center justify-center">Loading...</div>;
    if (!profile) return <div className="min-h-screen bg-ivory-50 flex items-center justify-center">Profile not found.</div>;

    return (
        <main className="min-h-screen bg-ivory-50 font-sans pb-12">
            <Navbar />
            <div className="bg-maroon-900 text-ivory-50 pt-32 pb-16 px-6">
                <div className="container mx-auto">
                    <Link href="/matrimony" className="inline-flex items-center gap-2 text-maroon-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={20} /> Back to Listings
                    </Link>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-ivory-100 flex items-center justify-center text-maroon-800 text-6xl font-serif font-bold shadow-xl border-4 border-gold-400">
                            {profile.fullName[0]}
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-gold-400 mb-2">{profile.fullName}</h1>
                            <div className="flex flex-wrap gap-4 text-maroon-100 mb-6">
                                <span className="px-3 py-1 bg-maroon-800 rounded-full border border-maroon-700">{profile.occupation}</span>
                                <span className="px-3 py-1 bg-maroon-800 rounded-full border border-maroon-700">{profile.age || "Age N/A"} yrs</span>
                                <span className="px-3 py-1 bg-maroon-800 rounded-full border border-maroon-700">{profile.education}</span>
                                <span className="px-3 py-1 bg-maroon-800 rounded-full border border-maroon-700">{profile.maritalStatus}</span>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-2 bg-gold-500 text-maroon-900 rounded-full font-bold hover:bg-gold-400 transition-colors">
                                <Download size={18} /> Download Biodata PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-maroon-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold text-maroon-800 mb-6 border-b border-maroon-100 pb-2">Personal Details</h3>
                            <dl className="grid grid-cols-2 gap-y-4">
                                <dt className="text-maroon-500">Date of Birth</dt>
                                <dd className="font-medium text-maroon-900">{profile.dob}</dd>

                                <dt className="text-maroon-500">Height</dt>
                                <dd className="font-medium text-maroon-900">{profile.height}</dd>

                                <dt className="text-maroon-500">Gender</dt>
                                <dd className="font-medium text-maroon-900">{profile.gender}</dd>

                                <dt className="text-maroon-500">Gotra</dt>
                                <dd className="font-medium text-maroon-900">{profile.gotra || "Not specified"}</dd>
                            </dl>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-maroon-800 mb-6 border-b border-maroon-100 pb-2">Contact Information</h3>
                            <p className="text-maroon-600 mb-6 italic">Visible only to registered members.</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-maroon-900">
                                    <Phone size={20} className="text-gold-600" />
                                    <span>+91 9xxxx xxxxx</span>
                                </div>
                                <div className="flex items-center gap-3 text-maroon-900">
                                    <Mail size={20} className="text-gold-600" />
                                    <span>hidden@email.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
