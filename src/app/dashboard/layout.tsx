"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { LayoutDashboard, Users, Heart, FileText, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-ivory-50 text-maroon-900">Loading...</div>;
    if (!user) return null;

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const sidebarLinks = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/dashboard/profile", icon: Users },
        { name: "Matrimony", href: "/dashboard/matrimony", icon: Heart },
        { name: "Kundli", href: "/dashboard/kundli", icon: FileText },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-ivory-50 flex flex-col font-sans">
            <Navbar />
            <div className="flex flex-1 pt-24 container mx-auto px-6 gap-8">

                {/* Sidebar */}
                <aside className="w-64 hidden lg:block shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-maroon-100 p-6 sticky top-28">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-maroon-50">
                            <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 font-bold text-lg">
                                {user.email?.[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium text-maroon-900 truncate">{user.displayName || "Member"}</p>
                                <p className="text-xs text-maroon-500 truncate">{user.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center gap-3 px-3 py-2 text-maroon-700 hover:bg-maroon-50 rounded-lg transition-colors group"
                                >
                                    <link.icon size={18} className="group-hover:text-maroon-900" />
                                    <span className="group-hover:text-maroon-900 font-medium">{link.name}</span>
                                </Link>
                            ))}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-8"
                            >
                                <LogOut size={18} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
