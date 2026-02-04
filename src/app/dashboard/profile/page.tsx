"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveSubscriptionByUser } from "@/services/subscriptionService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        gotra: ""
    });
    const [message, setMessage] = useState("");
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        gotra: data.gotra || ""
                    });
                }

                const sub = await getActiveSubscriptionByUser(user.uid);
                setSubscription(sub);
            };
            fetchProfile();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), formData);
            setMessage("Profile updated successfully!");
        } catch (error) {
            setMessage("Failed to update profile.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-maroon-50">
            <h2 className="text-2xl font-serif font-bold text-maroon-900 mb-6">My Profile</h2>

            {message && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-gold-50 text-gold-800 p-3 rounded mb-6 text-sm font-medium"
                >
                    {message}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-medium">Membership</h3>
                        <p className="text-sm text-maroon-600">Manage your membership and plan status</p>
                    </div>
                    <div>
                        {subscription ? (
                            <div className="inline-flex items-center gap-3 px-3 py-2 bg-ivory-100 rounded-lg border">
                                <span className="text-sm font-semibold">{subscription.plan.toUpperCase()}</span>
                                <span className="text-xs text-maroon-600">Expires {new Date(subscription.expiryDate).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-3 px-3 py-2 bg-ivory-100 rounded-lg border">
                                <span className="text-sm font-semibold">FREE</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Gotra</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                            value={formData.gotra}
                            onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Address</label>
                        <textarea
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none h-24"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-maroon-900 text-ivory-50 rounded-lg font-medium hover:bg-maroon-800 transition-colors disabled:opacity-70"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
