"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
    Users,
    Heart,
    Calendar,
    Settings,
    CheckCircle,
    XCircle,
    Search,
    Database,
    Loader2,
    Bell
} from "lucide-react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { PostsTab } from "@/components/admin/posts/PostsTab";

// Tabs Component
const Tabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
    const tabs = [
        { id: "overview", label: "Overview", icon: Users },
        { id: "posts", label: "Posts", icon: Bell },
        { id: "matrimony", label: "Matrimony", icon: Heart },
        { id: "events", label: "Events", icon: Calendar },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex space-x-2 border-b border-maroon-100 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${isActive
                            ? "bg-maroon-900 text-ivory-50 border-b-2 border-maroon-900"
                            : "text-maroon-600 hover:bg-maroon-50"
                            }`}
                    >
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

// Overview Tab
const OverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {[
            { label: "Total Members", value: "1,248", change: "+12% this month", color: "bg-blue-50 text-blue-700" },
            { label: "Pending Approvals", value: "15", change: "Requires attention", color: "bg-amber-50 text-amber-700" },
            { label: "Upcoming Events", value: "3", change: "Next: Holi Milan", color: "bg-emerald-50 text-emerald-700" },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-maroon-100 shadow-sm">
                <p className="text-maroon-500 text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-maroon-900">{stat.value}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${stat.color}`}>
                        {stat.change}
                    </span>
                </div>
            </div>
        ))}
    </div>
);

// Matrimony Tab

const MatrimonyTab = ({ onSeed }: { onSeed: () => void }) => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingProfiles = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "matrimony_profiles"), where("status", "==", "pending"));
            const snapshot = await getDocs(q);
            setProfiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingProfiles();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            if (action === "approve") {
                await updateDoc(doc(db, "matrimony_profiles", id), { status: "approved" });
            } else {
                await deleteDoc(doc(db, "matrimony_profiles", id)); // Or set status to 'rejected'
            }
            // Refresh local state
            setProfiles(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-maroon-900">Pending Profiles</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => { onSeed(); setTimeout(fetchPendingProfiles, 2000); }}
                        className="flex items-center gap-2 px-4 py-2 bg-maroon-100 text-maroon-800 rounded-lg hover:bg-maroon-200 transition-colors text-sm font-medium"
                    >
                        <Database size={16} />
                        Seed Test Data
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-maroon-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search profiles..."
                            className="pl-9 pr-4 py-2 border border-maroon-200 rounded-lg text-sm focus:outline-none focus:border-maroon-400"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-maroon-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-maroon-50 text-maroon-900 font-serif">
                        <tr>
                            <th className="p-4 font-bold">Name</th>
                            <th className="p-4 font-bold">Details</th>
                            <th className="p-4 font-bold">Profession</th>
                            <th className="p-4 font-bold">Joined</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-maroon-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-maroon-400">Loading...</td></tr>
                        ) : profiles.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-maroon-400">No pending profiles found.</td></tr>
                        ) : (
                            profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-ivory-50 transition-colors">
                                    <td className="p-4 font-medium text-maroon-900">{profile.fullName || "Unknown"}</td>
                                    <td className="p-4 text-maroon-600">{profile.gender}, {profile.dob}</td>
                                    <td className="p-4 text-maroon-600">{profile.occupation}</td>
                                    <td className="p-4 text-maroon-500">Recently</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleAction(profile.id, "approve")}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(profile.id, "reject")}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login"); // Redirect to login if not authenticated
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ivory-50">
                <Loader2 className="animate-spin text-maroon-900" size={48} />
            </div>
        );
    }

    const seedData = async () => {
        setIsSeeding(true);
        try {
            // Seed Matrimony Profiles
            const mockProfiles = [
                {
                    fullName: "Aarav Gupta",
                    gender: "Male",
                    dob: "1995-05-15",
                    occupation: "Software Engineer",
                    education: "B.Tech, IIT Delhi",
                    status: "approved",
                    about: "Hardworking and family-oriented.",
                    income: "25 LPA",
                    height: "5'10\"",
                    createdAt: serverTimestamp()
                },
                {
                    fullName: "Priya Sharma",
                    gender: "Female",
                    dob: "1997-08-22",
                    occupation: "Doctor",
                    education: "MBBS, MD",
                    status: "approved",
                    about: "Passionate about healthcare and travel.",
                    income: "18 LPA",
                    height: "5'5\"",
                    createdAt: serverTimestamp()
                },
                {
                    fullName: "Rohan Verma",
                    gender: "Male",
                    dob: "1994-11-10",
                    occupation: "Chartered Accountant",
                    education: "CA, B.Com",
                    status: "pending",
                    about: "Financial analyst with a love for music.",
                    income: "30 LPA",
                    height: "5'9\"",
                    createdAt: serverTimestamp()
                }
            ];

            for (const profile of mockProfiles) {
                await addDoc(collection(db, "matrimony_profiles"), profile);
            }

            alert("Test data seeded successfully!");
        } catch (error) {
            console.error("Error seeding data:", error);
            alert("Failed to seed data.");
        }
        setIsSeeding(false);
    };

    return (
        <main className="min-h-screen bg-ivory-50 text-maroon-900 font-sans pb-20">
            <div className="bg-maroon-900 text-ivory-50 py-12 px-6 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-maroon-200">Manage your community, approvals, and settings.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-8">
                <div className="bg-white rounded-xl shadow-xl border border-maroon-100 p-6 min-h-[500px]">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="mt-6">
                        {activeTab === "overview" && <OverviewTab />}
                        {activeTab === "posts" && <PostsTab />}
                        {activeTab === "matrimony" && <MatrimonyTab onSeed={seedData} />}
                        {activeTab === "events" && (
                            <div className="flex flex-col items-center justify-center h-64 text-maroon-400 bg-ivory-50 rounded-xl border border-dashed border-maroon-200">
                                <Calendar size={48} className="mb-4 opacity-50" />
                                <p>Event management coming soon...</p>
                            </div>
                        )}
                        {activeTab === "settings" && (
                            <div className="flex flex-col items-center justify-center h-64 text-maroon-400 bg-ivory-50 rounded-xl border border-dashed border-maroon-200">
                                <Settings size={48} className="mb-4 opacity-50" />
                                <p>System settings coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isSeeding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-maroon-600" size={32} />
                        <p className="font-medium text-maroon-900">Seeding Database...</p>
                    </div>
                </div>
            )}
        </main>
    );
}
