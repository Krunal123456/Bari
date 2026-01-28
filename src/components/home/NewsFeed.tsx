"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, Mic, Pin, Filter, X } from "lucide-react";

export function NewsFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

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

    // Apply type filter
    useEffect(() => {
        if (selectedType) {
            setFilteredPosts(posts.filter((post) => post.type === selectedType));
        } else {
            setFilteredPosts(posts);
        }
    }, [posts, selectedType]);

    if (posts.length === 0) return null;

    const postTypes = Array.from(new Set(posts.map((p) => p.type)));

    return (
        <section className="py-6 container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h2 className="text-3xl font-serif font-bold text-maroon-900 md:border-l-4 md:border-gold-500 md:pl-4">
                    Community Updates
                </h2>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType(null)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                            selectedType === null
                                ? "bg-maroon-900 text-white"
                                : "bg-maroon-100 text-maroon-700 hover:bg-maroon-200"
                        }`}
                    >
                        All
                    </button>
                    {postTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors capitalize ${
                                selectedType === type
                                    ? "bg-maroon-900 text-white"
                                    : "bg-maroon-100 text-maroon-700 hover:bg-maroon-200"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {filteredPosts.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 text-maroon-400"
                    >
                        <Filter className="mx-auto mb-3 opacity-50" size={32} />
                        <p className="font-medium">No posts found in this category</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group hover:shadow-md transition-shadow
                                    ${post.priority === 'emergency' ? 'border-red-200 bg-red-50/30' :
                                        post.isPinned ? 'border-gold-300 ring-1 ring-gold-100' : 'border-maroon-100'}
                                `}
                            >
                                {/* Image */}
                                {post.images && post.images.length > 0 && (
                                    <div className="relative w-full h-40 overflow-hidden bg-maroon-100">
                                        <img
                                            src={post.images[0]}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        {post.images.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                +{post.images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pin Icon */}
                                {post.isPinned && (
                                    <div className="absolute top-0 right-0 p-2 bg-gold-400 text-maroon-900 rounded-bl-xl shadow-sm z-10">
                                        <Pin size={16} fill="currentColor" />
                                    </div>
                                )}

                                <div className="p-6">
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
                                        {post.priority === 'emergency' && (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                                                Emergency
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

                                    <div className="flex justify-between items-center text-xs text-maroon-400 pt-4 border-t border-maroon-50">
                                        <span>{new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                                        <a href="#" className="text-maroon-600 hover:text-maroon-700 font-medium">
                                            Read More →
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
