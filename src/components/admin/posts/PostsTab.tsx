"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe, Lock, Clock, AlertTriangle } from "lucide-react";
import { Post } from "@/lib/types";
import { postService } from "@/services/postService";
import { PostEditor } from "./PostEditor";
import { motion, AnimatePresence } from "framer-motion";

export function PostsTab() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await postService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            await postService.deletePost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setIsEditorOpen(true);
    };

    const handleCreate = () => {
        setEditingPost(null);
        setIsEditorOpen(true);
    };

    const handleSave = () => {
        setIsEditorOpen(false);
        fetchPosts();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-maroon-900">Announcements & Posts</h3>
                    <p className="text-sm text-maroon-500">Manage community update, events, and notices.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-maroon-900 text-ivory-50 rounded-lg hover:bg-maroon-800 transition-colors shadow-sm font-medium"
                >
                    <Plus size={18} />
                    New Post
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-maroon-400">Loading posts...</div>
            ) : (
                <div className="grid gap-4">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 bg-ivory-50 rounded-xl border border-dashed border-maroon-200 text-maroon-400">
                            No posts found. Create your first announcement!
                        </div>
                    ) : (
                        posts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-5 rounded-xl border border-maroon-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group hover:shadow-md transition-shadow"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                                            ${post.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                                                post.type === 'event' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-50 text-blue-700'}`}
                                        >
                                            {post.type}
                                        </span>
                                        {post.priority === 'high' && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                                <AlertTriangle size={12} /> High Priority
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${post.status === 'published' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                                            'border-gray-200 text-gray-500 bg-gray-50'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-maroon-900 mb-1">{post.title}</h4>
                                    <div className="flex items-center gap-4 text-xs text-maroon-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            {post.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                            {post.visibility}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {/* Date formatting would go here */}
                                            {new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="p-2 text-maroon-400 hover:bg-maroon-50 hover:text-maroon-900 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => post.id && handleDelete(post.id)}
                                        className="p-2 text-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence>
                {isEditorOpen && (
                    <PostEditor
                        post={editingPost}
                        onClose={() => setIsEditorOpen(false)}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
