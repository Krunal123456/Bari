"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Calendar } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-serif font-bold text-maroon-900 mb-2">Dashboard</h1>
                <p className="text-maroon-600">Welcome to your community hub.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: "Community Events", value: "3 Upcoming", icon: Calendar, color: "bg-gold-100 text-gold-800" },
                    { label: "Profile Views", value: "12 This Week", icon: Users, color: "bg-maroon-100 text-maroon-800" },
                    { label: "Updates", value: "New Features", icon: Sparkles, color: "bg-purple-100 text-purple-800" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-maroon-50 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-maroon-500 font-medium">{stat.label}</p>
                            <p className="text-xl font-bold text-maroon-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-maroon-50 p-6">
                <h2 className="text-xl font-serif font-bold text-maroon-900 mb-4">Recent Activity</h2>
                <div className="h-32 flex items-center justify-center text-maroon-400 italic bg-ivory-50 rounded-lg">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
}
