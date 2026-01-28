"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, Mic, Pin } from "lucide-react";

export function NewsFeed() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        // Query for active published posts
        const q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

            // Client-side filter for scheduling/expiry and Pin sorting
            const now = new Date();
            const active = fetchedPosts.filter(post => {
                const scheduledTime = post.scheduledAt?.seconds ? new Date(post.scheduledAt.seconds * 1000) : null;
                const expiryTime = post.expiresAt?.seconds ? new Date(post.expiresAt.seconds * 1000) : null;

                if (scheduledTime && scheduledTime > now) return false;
                if (expiryTime && expiryTime < now) return false;
                return true;
            });

            // Sort: Pinned first, then by date desc
            active.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0; // Already sorted by date in query
            });

            setPosts(active);
        });

        return () => unsubscribe();
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="py-6 container mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-maroon-900 mb-8 text-center md:text-left md:border-l-4 md:border-gold-500 md:pl-4">
                Community Updates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden group hover:shadow-md transition-shadow
                            ${post.priority === 'emergency' ? 'border-red-200 bg-red-50/30' :
                                post.isPinned ? 'border-gold-300 ring-1 ring-gold-100' : 'border-maroon-100'}
                        `}
                    >
                        {/* Pin Icon */}
                        {post.isPinned && (
                            <div className="absolute top-0 right-0 p-2 bg-gold-400 text-maroon-900 rounded-bl-xl shadow-sm z-10">
                                <Pin size={16} fill="currentColor" />
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                            {post.type === 'event' && <Calendar size={18} className="text-purple-600" />}
                            {post.type === 'announcement' && <Mic size={18} className="text-maroon-600" />}
                            {post.type === 'update' && <Bell size={18} className="text-blue-600" />}

                            <span className="text-xs font-bold uppercase tracking-wider text-maroon-500">
                                {post.type}
                            </span>
                            {post.priority === 'high' && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                    High Priority
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-maroon-900 mb-2 leading-tight">
                            {post.title}
                        </h3>

                        <div className="text-maroon-700 text-sm line-clamp-3 mb-4 prose prose-sm prose-p:my-1">
                            {/* Simple render of content - in real app use a Markdown renderer */}
                            {post.content}
                        </div>

                        <div className="flex justify-between items-center text-xs text-maroon-400 mt-auto pt-4 border-t border-maroon-50">
                            <span>{new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
