"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Filter, Loader2 } from "lucide-react";

interface Profile {
    id: string;
    fullName: string;
    dob: string;
    gender: string;
    occupation: string;
    education: string;
}

export default function MatrimonyListing() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterGender, setFilterGender] = useState("All");

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const conditions = [where("status", "==", "approved")];
                
                if (filterGender !== "All") {
                    conditions.push(where("gender", "==", filterGender));
                }

                const q = query(collection(db, "matrimony_profiles"), ...conditions);
                const querySnapshot = await getDocs(q);
                const fetched: Profile[] = [];
                querySnapshot.forEach((doc) => {
                    fetched.push({ id: doc.id, ...doc.data() } as Profile);
                });
                setProfiles(fetched);
            } catch (error) {
                console.error("Error fetching profiles:", error);
                setProfiles([]);
            }
            setLoading(false);
        };

        fetchProfiles();
    }, [filterGender]);

    return (
        <main className="min-h-screen bg-ivory-50 font-sans">
            <Navbar />

            <div className="pt-24 pb-12 container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 text-center md:text-left">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-maroon-900 mb-2">Matrimony Profiles</h1>
                        <p className="text-maroon-600">Find your perfect match within our community.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-maroon-200 px-4 py-2 pr-10 rounded-lg text-maroon-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                            >
                                <option value="All">All Genders</option>
                                <option value="Male">Grooms</option>
                                <option value="Female">Brides</option>
                            </select>
                            <Filter className="absolute right-3 top-2.5 text-maroon-400 pointer-events-none" size={16} />
                        </div>
                        <Link
                            href="/dashboard/matrimony/register"
                            className="px-6 py-2 bg-maroon-900 text-ivory-50 rounded-lg font-medium hover:bg-maroon-800 transition-colors"
                        >
                            Create Profile
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-maroon-600 animate-spin mb-4" />
                        <p className="text-maroon-600 font-medium">Loading profiles...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profiles.length > 0 ? (
                            profiles.map((profile) => (
                                <div key={profile.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-maroon-100 hover:shadow-md transition-shadow group">
                                    <div className="h-48 bg-maroon-50 flex items-center justify-center text-maroon-200">
                                        {/* Placeholder for user image */}
                                        <div className="w-20 h-20 rounded-full bg-maroon-200 flex items-center justify-center text-maroon-50 font-serif text-3xl">
                                            {profile.fullName ? profile.fullName.charAt(0) : "?"}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-serif font-bold text-maroon-900 group-hover:text-gold-600 transition-colors">
                                                {profile.fullName || "Unknown Name"}
                                            </h3>
                                            <span className="px-2 py-1 bg-ivory-100 text-maroon-600 text-xs rounded-full border border-maroon-100">
                                                {profile.gender || "N/A"}
                                            </span>
                                        </div>

                                        <p className="text-maroon-600 text-sm mb-4 line-clamp-2">
                                            {profile.occupation} • {profile.education}
                                        </p>

                                        <Link
                                            href={`/matrimony/${profile.id}`}
                                            className="block w-full text-center py-2 border border-maroon-200 text-maroon-800 rounded-lg font-medium hover:bg-maroon-50 transition-colors"
                                        >
                                            View Full Profile
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-maroon-400">
                                <p className="text-lg">No profiles found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
