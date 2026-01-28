"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Post, PostType, PostPriority, PostVisibility, PostStatus } from "@/lib/types";
import { postService } from "@/services/postService";
import { X, Upload, Loader2, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface PostEditorProps {
    post?: Post | null;
    onClose: () => void;
    onSave: () => void;
}

export function PostEditor({ post, onClose, onSave }: PostEditorProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<Post>({
        defaultValues: post || {
            title: "",
            content: "",
            type: "announcement",
            priority: "normal",
            visibility: "public",
            status: "draft",
            images: [],
            scheduledAt: undefined,
            expiresAt: undefined
        }
    });

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>(post?.images || []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                // Validate file type and size
                if (!file.type.startsWith("image/")) {
                    alert("Please upload only image files");
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert("Image size must be less than 5MB");
                    continue;
                }

                const url = await postService.uploadFile(file, "posts/images");
                setUploadedImages((prev) => [...prev, url]);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: Post) => {
        setSaving(true);
        try {
            // Convert date strings to timestamps if needed (handling plain inputs)
            const payload = {
                ...data,
                images: uploadedImages,
                // Simple date handling for MVP - in real app, convert to Firestore Timestamps
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            };

            const createdPostId = post?.id;
            
            if (post?.id) {
                await postService.updatePost(post.id, payload);
                
                // If status changed to published, send notifications
                if (payload.status === "published" && post.status !== "published") {
                    await postService.sendNotificationToUsers(post.id, payload as Post);
                }
            } else {
                const newPostId = await postService.createPost({
                    ...payload,
                    createdBy: "admin", // Replace with actual user ID in real usage
                } as any);
                
                // Send notifications if post is published immediately
                if (payload.status === "published") {
                    await postService.sendNotificationToUsers(newPostId, payload as Post);
                }
            }
            onSave();
        } catch (error) {
            console.error("Failed to save post", error);
            alert("Failed to save post");
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-maroon-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-serif font-bold text-maroon-900">
                        {post ? "Edit Post" : "Create New Post"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-maroon-50 rounded-full text-maroon-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Title</label>
                        <input
                            {...register("title", { required: true })}
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:outline-none"
                            placeholder="Enter post title..."
                        />
                        {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-1">Content (Markdown supported)</label>
                        <textarea
                            {...register("content", { required: true })}
                            rows={6}
                            className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:outline-none font-mono text-sm"
                            placeholder="Write your content here..."
                        />
                        {errors.content && <span className="text-red-500 text-xs">Content is required</span>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-maroon-700 mb-2">Images</label>
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-maroon-300 rounded-lg cursor-pointer hover:bg-maroon-50 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            {uploading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin text-maroon-600" />
                                    <span className="text-maroon-600 font-medium">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={18} className="text-maroon-600" />
                                    <span className="text-maroon-600 font-medium">Click to upload images</span>
                                </>
                            )}
                        </label>

                        {/* Image Preview Grid */}
                        {uploadedImages.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {uploadedImages.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Upload ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                                        >
                                            <Trash2 size={18} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Type</label>
                            <select
                                {...register("type")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            >
                                <option value="announcement">Announcement</option>
                                <option value="event">Event</option>
                                <option value="matrimony">Matrimony Notice</option>
                                <option value="update">Important Update</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Priority</label>
                            <select
                                {...register("priority")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High Priority</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Status</label>
                            <select
                                {...register("status")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Visibility</label>
                            <select
                                {...register("visibility")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            >
                                <option value="public">Public</option>
                                <option value="private">Members Only</option>
                            </select>
                        </div>

                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer p-2 border border-maroon-100 rounded-lg hover:bg-maroon-50 transition-colors w-full">
                                <input
                                    type="checkbox"
                                    {...register("isPinned")}
                                    className="w-5 h-5 accent-maroon-900"
                                />
                                <span className="text-maroon-900 font-medium">Pin to Top</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Schedule Publish</label>
                            <input
                                type="datetime-local"
                                {...register("scheduledAt")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-maroon-700 mb-1">Expiry Date</label>
                            <input
                                type="datetime-local"
                                {...register("expiresAt")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-maroon-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-maroon-600 hover:bg-maroon-50 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-maroon-900 text-white rounded-lg font-medium hover:bg-maroon-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {post ? "Update Post" : "Create Post"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
