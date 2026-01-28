"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import { Bell, Info, Calendar, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationPanel() {
    const [notifications, setNotifications] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Query for published posts (public or private)
        // In a real app, we would filtering visibility based on user role/status
        // For now, we show everything that is published
        const q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const fetched = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                .filter(post => {
                    // Filter scheduled/expired
                    if (post.scheduledAt?.seconds && new Date(post.scheduledAt.seconds * 1000) > now) return false;
                    if (post.expiresAt?.seconds && new Date(post.expiresAt.seconds * 1000) < now) return false;
                    return true;
                });

            setNotifications(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-4 text-center text-maroon-400 text-sm">Loading notifications...</div>;
    if (notifications.length === 0) return <div className="p-4 text-center text-maroon-400 text-sm">No new notifications.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-maroon-100 overflow-hidden">
            <div className="p-4 border-b border-maroon-50 bg-maroon-50/50 flex items-center justify-between">
                <h3 className="font-serif font-bold text-maroon-900 flex items-center gap-2">
                    <Bell size={18} /> Notifications
                </h3>
                <span className="text-xs font-medium bg-maroon-100 text-maroon-800 px-2 py-0.5 rounded-full">
                    {notifications.length} New
                </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-maroon-50">
                {notifications.map((note) => (
                    <div key={note.id} className="p-4 hover:bg-ivory-50 transition-colors group">
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full shrink-0 
                                ${note.priority === 'emergency' ? 'bg-red-100 text-red-600' :
                                    note.type === 'event' ? 'bg-purple-100 text-purple-600' :
                                        'bg-blue-50 text-blue-600'}`}
                            >
                                {note.type === 'event' ? <Calendar size={16} /> :
                                    note.type === 'announcement' ? <Mic size={16} /> : <Info size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-bold ${note.priority === 'emergency' ? 'text-red-700' : 'text-maroon-900'}`}>
                                        {note.title}
                                    </h4>
                                    <span className="text-[10px] text-maroon-400 whitespace-nowrap ml-2">
                                        {new Date(note.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-maroon-600 mt-1 line-clamp-2">
                                    {note.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
