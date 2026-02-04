"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { Search, MapPin } from "lucide-react";

interface Member {
    id: string;
    name: string;
    address?: string;
    gotra?: string;
}

export default function CommunityPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const q = query(collection(db, "users"), limit(50));
                const querySnapshot = await getDocs(q);
                const fetched: Member[] = [];
                querySnapshot.forEach((doc) => {
                    fetched.push({ id: doc.id, ...doc.data() } as Member);
                });
                setMembers(fetched);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchMembers();
    }, []);

    return (
        <main className="min-h-screen bg-ivory-50 font-sans pb-12">
            <Navbar />
            <div className="pt-24 pb-12 container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 text-center md:text-left">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-maroon-900 mb-2">Community Directory</h1>
                        <p className="text-maroon-600">Connect with members of the Bari Samaj.</p>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-maroon-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-maroon-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-maroon-400" size={18} />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white h-32 rounded-xl border border-maroon-50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {members.filter(member => {
                            if (!searchTerm) return true;
                            const searchLower = searchTerm.toLowerCase();
                            return (
                                member.name?.toLowerCase().includes(searchLower) ||
                                member.gotra?.toLowerCase().includes(searchLower) ||
                                member.address?.toLowerCase().includes(searchLower)
                            );
                        }).map((member) => (
                            <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-maroon-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-full bg-maroon-100 flex-shrink-0 flex items-center justify-center text-maroon-800 font-bold text-lg">
                                    {member.name?.[0] || "?"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-maroon-900">{member.name || "Unknown Member"}</h3>
                                    {member.gotra && <p className="text-sm text-maroon-600 mb-1">Gotra: {member.gotra}</p>}
                                    {member.address && (
                                        <div className="flex items-center gap-1 text-xs text-maroon-400 mt-2">
                                            <MapPin size={12} />
                                            <span className="truncate max-w-[150px]">{member.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {members.filter(member => {
                            if (!searchTerm) return true;
                            const searchLower = searchTerm.toLowerCase();
                            return (
                                member.name?.toLowerCase().includes(searchLower) ||
                                member.gotra?.toLowerCase().includes(searchLower) ||
                                member.address?.toLowerCase().includes(searchLower)
                            );
                        }).length === 0 && (
                                <div className="col-span-full py-12 text-center text-maroon-400">
                                    <p>No members found matching "{searchTerm}"</p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </main>
    );
}
