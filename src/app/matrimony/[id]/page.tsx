"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Phone, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUserProfile } from "@/services/matrimonyService";
import { getActiveSubscriptionByUser } from "@/services/subscriptionService";
import { sendInterest, countInterestsToday } from "@/services/interestService";

export default function ProfileDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerProfile, setViewerProfile] = useState<any>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [interestModalOpen, setInterestModalOpen] = useState(false);
    const [interestMessage, setInterestMessage] = useState('');
    const [dailyCount, setDailyCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, "matrimony_profiles", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status !== "approved") {
                        setError("This profile is not available.");
                        setProfile(null);
                    } else {
                        setProfile({ id: docSnap.id, ...data });
                    }
                } else {
                    setError("Profile not found.");
                }

                // get viewer details and subscription
                if (user) {
                    const viewer = await getUserProfile(user.uid);
                    if (viewer) setViewerProfile(viewer);
                    const sub = await getActiveSubscriptionByUser(user.uid);
                    setIsPaid(!!sub);

                    // prevent viewing own profile
                    if (viewer?.id === id) {
                        setError('You cannot view your own profile here.');
                        setProfile(null);
                    }

                    const cnt = await countInterestsToday(user.uid);
                    setDailyCount(cnt);
                    }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile. Please try again.");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [id, user]);

    if (loading) {
        return (
            <main className="min-h-screen bg-ivory-50 flex items-center justify-center">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-24">
                    <Loader2 size={48} className="text-maroon-600 animate-spin mb-4" />
                    <p className="text-maroon-600 font-medium">Loading profile...</p>
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center">
                <Navbar />
                <div className="text-center pt-24">
                    <p className="text-xl text-maroon-600 mb-6">{error || "Profile not found."}</p>
                    <Link href="/matrimony" className="inline-block px-6 py-3 bg-maroon-900 text-white rounded-lg font-medium hover:bg-maroon-800 transition-colors">
                        Back to Matrimony
                    </Link>
                </div>
            </main>
        );
    }

    const maskedPhone = profile.phone ? profile.phone.replace(/.(?=.{4})/g, '*') : '';

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

                            <div className="flex gap-3 items-center">
                                <button onClick={async () => {
                                    if (!user) { window.location.href = '/login'; return; }
                                    if (!viewerProfile) { alert('Create your matrimony profile to compare.'); return; }
                                    try {
                                        const res = await fetch('/api/kundli/generate', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ dobA: viewerProfile.dob, tobA: viewerProfile.tob, pobA: viewerProfile.pob, dobB: profile.dob, tobB: profile.tob, pobB: profile.pob, requestorId: user.uid })
                                        });
                                        const json = await res.json();
                                        if (json.success) {
                                            const data = json.data;
                                            alert(`Guna Score: ${data.gunaScore}\nManglik: ${data.manglik}\nVerdict: ${data.verdict}`);
                                        } else {
                                            alert('Failed to generate comparison');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error running comparison');
                                    }
                                }} className="px-4 py-2 bg-ivory-100 text-maroon-900 rounded">Compare with my profile</button>

                                <button className="flex items-center gap-2 px-6 py-2 bg-gold-500 text-maroon-900 rounded-full font-bold hover:bg-gold-400 transition-colors">
                                    <Download size={18} /> Download Biodata PDF
                                </button>
                            </div>
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
                            {isPaid ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-maroon-900">
                                        <Phone size={20} className="text-gold-600" />
                                        <span>{profile.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-maroon-900">
                                        <Mail size={20} className="text-gold-600" />
                                        <span>{profile.userEmail}</span>
                                    </div>
                                    <div className="mt-4">
                                        <button className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded" onClick={() => alert('Download Biodata is a premium feature in production')}>Download Biodata</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-maroon-600 mb-6 italic">Contact details are masked for Free members.</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-maroon-900">
                                            <Phone size={20} className="text-gold-600" />
                                            <span>{maskedPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-maroon-900">
                                            <Mail size={20} className="text-gold-600" />
                                            <span className="text-maroon-600">Upgrade to view full contact details</span>
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <a href="/matrimony/plans" className="px-4 py-2 bg-gold-500 text-maroon-900 rounded font-semibold">Upgrade to Premium</a>
                                            <button className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded" onClick={() => setInterestModalOpen(true)}>Send Interest</button>
                                        </div>

                                        {/* Interest modal */}
                                        {interestModalOpen && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                    <h3 className="text-lg font-bold mb-2">Send Interest to {profile.fullName}</h3>
                                                    <p className="text-sm text-maroon-600 mb-3">You have sent {dailyCount} interests today. Free limit: 3/day.</p>
                                                    <textarea value={interestMessage} onChange={(e) => setInterestMessage(e.target.value)} className="w-full border p-2 rounded mb-4" rows={4} />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setInterestModalOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                                                        <button onClick={async () => {
                                                            if (!user) { window.location.href = '/login'; return; }
                                                            const freeLimit = 3;
                                                            if (!isPaid && dailyCount >= freeLimit) { alert('Free daily limit reached. Upgrade to continue.'); return; }
                                                            try {
                                                                await sendInterest(user.uid, profile.id, interestMessage);
                                                                alert('Interest sent');
                                                                setInterestModalOpen(false);
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Failed to send interest');
                                                            }
                                                        }} className="px-3 py-2 bg-maroon-900 text-white rounded">Send</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
