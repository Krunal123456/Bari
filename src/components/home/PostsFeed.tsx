'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostsListener } from '@/hooks/usePostsListener';
import { AlertCircle, Zap, Bell } from 'lucide-react';
import { Post } from '@/lib/types';

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  if (!isOpen) return null;

  const getPriorityColor = () => {
    switch (post.priority) {
      case 'emergency':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-ivory-50 border-maroon-100';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getPriorityColor()} border-l-4 ${
            post.priority === 'emergency'
              ? 'border-l-red-500'
              : post.priority === 'high'
              ? 'border-l-orange-500'
              : 'border-l-maroon-900'
          }`}
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.priority === 'emergency'
                      ? 'bg-red-100 text-red-700'
                      : post.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-maroon-100 text-maroon-700'
                  }`}>
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </span>
                  {post.isPinned && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                      📌 Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-maroon-900">{post.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-maroon-400 hover:text-maroon-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Date */}
            <p className="text-sm text-maroon-600 mb-6">
              {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* Content */}
            <div className="prose prose-sm max-w-none mb-6 text-maroon-800">
              {post.content.split('\n').map((line, idx) => (
                <p key={idx} className="mb-3">
                  {line}
                </p>
              ))}
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`Post image ${idx + 1}`}
                    className="rounded-lg w-full object-cover max-h-64"
                  />
                ))}
              </div>
            )}

            {/* Video */}
            {post.videoUrl && (
              <div className="mb-6 relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={post.videoUrl}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            )}

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-6 border-t pt-4">
                <h3 className="font-semibold text-maroon-900 mb-3">Attachments</h3>
                <div className="space-y-2">
                  {post.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-maroon-700 hover:text-maroon-900 font-medium p-2 rounded hover:bg-maroon-100 transition-colors"
                    >
                      📎 {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 bg-maroon-900 text-ivory-50 rounded-lg font-semibold hover:bg-maroon-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function PostsFeed() {
  const { posts, loading, error } = usePostsListener('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/50 animate-pulse h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
      >
        <AlertCircle className="text-red-600" size={20} />
        <p className="text-red-800">Unable to load posts at this time.</p>
      </motion.div>
    );
  }

  // Separate posts by priority and pin status
  const emergencyPosts = posts.filter(p => p.priority === 'emergency' && p.status === 'published');
  const highPriorityPosts = posts.filter(p => p.priority === 'high' && p.status === 'published');
  const normalPosts = posts.filter(p => p.priority === 'normal' && p.status === 'published');

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ivory-100 rounded-xl p-8 text-center"
      >
        <Bell className="mx-auto mb-3 text-maroon-400" size={32} />
        <p className="text-maroon-700 font-medium">No announcements at this time.</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-4 w-full">
        {/* Emergency Posts - Full Width Banner */}
        <AnimatePresence>
          {emergencyPosts.map((post) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setSelectedPost(post)}
              className="w-full text-left bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow hover:scale-[1.02] transform"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle size={24} />
                <span className="text-sm font-bold uppercase tracking-wide">Emergency</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-red-50 text-sm line-clamp-2">{post.content}</p>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* High Priority Posts - Featured Cards */}
        <AnimatePresence>
          {highPriorityPosts.map((post) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setSelectedPost(post)}
              className="w-full text-left bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 p-6 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] transform"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="text-orange-600" size={20} />
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">High Priority</span>
              </div>
              <h3 className="text-lg font-bold text-maroon-900 mb-2">{post.title}</h3>
              <p className="text-maroon-700 text-sm line-clamp-2">{post.content}</p>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Normal Posts - Compact Cards */}
        {normalPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {normalPosts.map((post) => (
                <motion.button
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => setSelectedPost(post)}
                  className="text-left bg-white border-2 border-maroon-100 p-4 rounded-lg hover:border-maroon-300 hover:shadow-md transition-all hover:scale-105 transform"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-maroon-600 uppercase">
                      {post.type}
                    </span>
                    {post.isPinned && <span className="text-gold-600">📌</span>}
                  </div>
                  <h3 className="font-bold text-maroon-900 mb-1 line-clamp-1">{post.title}</h3>
                  <p className="text-sm text-maroon-700 line-clamp-2">{post.content}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
