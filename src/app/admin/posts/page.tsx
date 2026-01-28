"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Edit, Trash2, Eye, Archive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPosts, deletePost } from "@/services/adminService";
import { AdminPost } from "@/lib/admin-types";

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to archive this post?")) {
      try {
        await deletePost(id);
        setPosts(posts.filter((p) => p.id !== id));
      } catch (err) {
        alert("Failed to delete post");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-maroon-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-maroon-900">Posts & Announcements</h1>
          <p className="text-maroon-600 mt-1">Manage community posts and notifications</p>
        </div>
        <a
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Create Post
        </a>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-900">{error}</p>
        </div>
      )}

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow border border-maroon-200 overflow-hidden"
      >
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-maroon-600 text-lg">No posts found. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-maroon-50 border-b border-maroon-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Priority</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-maroon-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100">
                {posts.map((post) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-ivory-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-maroon-900">{post.title}</div>
                      <div className="text-sm text-maroon-600 line-clamp-1">
                        {post.content?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          post.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "Draft"
                            ? "bg-gray-100 text-gray-800"
                            : post.status === "Scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        post.priority === "High Priority" ? "text-red-600" :
                        post.priority === "Emergency" ? "text-red-900" :
                        "text-maroon-600"
                      }`}>
                        {post.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-maroon-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={`/admin/posts/${post.id}`}
                          className="p-1.5 text-maroon-600 hover:bg-maroon-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </a>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Post Preview Modal */}
      {selectedPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-maroon-900 mb-2">{selectedPost.title}</h2>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {selectedPost.type}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                {selectedPost.status}
              </span>
            </div>
            <p className="text-maroon-700 whitespace-pre-wrap">{selectedPost.content}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
