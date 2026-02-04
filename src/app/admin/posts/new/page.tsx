"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/postService";
import { Post, PostType, PostPriority, PostVisibility, PostStatus } from "@/lib/types";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "announcement" as PostType,
    priority: "normal" as PostPriority,
    visibility: "public" as PostVisibility,
    status: "published" as PostStatus,
    isPinned: false,
    images: [] as string[],
    videoUrl: "",
    scheduledAt: null as Date | null,
    expiresAt: null as Date | null,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await postService.uploadFile(files[i], "posts");
        newImages.push(url);
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authLoading) {
        setError("Authentication initializing. Please wait a moment and try again.");
        setLoading(false);
        return;
      }

      if (!isAdmin) {
        setError("Permission denied: only administrators can create posts.");
        setLoading(false);
        return;
      }
      if (!formData.title.trim() || !formData.content.trim()) {
        setError("Title and content are required");
        setLoading(false);
        return;
      }

      const postData: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        visibility: formData.visibility,
        status: formData.status,
        isPinned: formData.isPinned,
        images: formData.images,
        videoUrl: formData.videoUrl || undefined,
        scheduledAt: formData.scheduledAt,
        expiresAt: formData.expiresAt,
        createdBy: user?.uid || "unknown",
      };

      const postId = await postService.createPost(postData);

      // Send notifications for high-priority and emergency posts
      if (formData.priority === "high" || formData.priority === "emergency") {
        await postService.sendNotificationToUsers(postId, { id: postId, ...postData } as Post);
      }

      router.push("/admin/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {authLoading && (
        <div className="mb-6 p-4 bg-ivory-100 border border-maroon-100 rounded">Initializing authentication…</div>
      )}
      {!authLoading && !isAdmin && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-900 font-medium">You do not have permission to create posts. Please contact an administrator.</p>
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/admin/posts"
          className="p-2 hover:bg-maroon-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-maroon-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-maroon-900">Create New Post</h1>
          <p className="text-maroon-600 mt-1">Add a new announcement or update</p>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6"
        >
          <p className="text-red-900 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-lg border border-maroon-200 shadow"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-maroon-900 mb-2">
            Post Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            disabled={loading}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-maroon-900 mb-2">
            Post Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
            className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            disabled={loading}
          />
        </div>

        {/* Row 1: Type, Priority, Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Post Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            >
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="matrimony">Matrimony</option>
              <option value="update">Update</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Visibility
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => handleInputChange("visibility", e.target.value)}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            >
              <option value="public">Public</option>
              <option value="private">Private (Logged-in users)</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status, Pinned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleInputChange("isPinned", e.target.checked)}
                className="w-4 h-4 rounded border-2 border-maroon-300"
                disabled={loading}
              />
              <span className="text-sm font-semibold text-maroon-900">📌 Pin to Top</span>
            </label>
          </div>
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Publish Date (Optional)
            </label>
            <input
              type="datetime-local"
              onChange={(e) => {
                handleInputChange("scheduledAt", e.target.value ? new Date(e.target.value) : null);
              }}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            />
            <p className="text-xs text-maroon-600 mt-1">Leave empty to publish immediately</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-maroon-900 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              onChange={(e) => {
                handleInputChange("expiresAt", e.target.value ? new Date(e.target.value) : null);
              }}
              className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
              disabled={loading}
            />
            <p className="text-xs text-maroon-600 mt-1">Post will be hidden after this date</p>
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-semibold text-maroon-900 mb-2">
            Video URL (Optional)
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange("videoUrl", e.target.value)}
            placeholder="https://youtube.com/embed/..."
            className="w-full px-4 py-2 border-2 border-maroon-200 rounded-lg focus:outline-none focus:border-maroon-500 bg-white"
            disabled={loading}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-maroon-900 mb-2">
            Upload Images
          </label>
          <div className="border-2 border-dashed border-maroon-300 rounded-lg p-6 text-center hover:bg-maroon-50 transition-colors">
            <Upload className="mx-auto text-maroon-400 mb-2" size={24} />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={loading}
            />
            <label htmlFor="image-upload" className="block cursor-pointer">
              <p className="text-sm font-medium text-maroon-900">Click to upload images</p>
              <p className="text-xs text-maroon-600">or drag and drop</p>
            </label>
          </div>

          {/* Uploaded Images Preview */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t border-maroon-200">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="px-6 py-2 border-2 border-maroon-300 text-maroon-900 rounded-lg font-semibold hover:bg-maroon-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
