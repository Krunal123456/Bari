'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostsListener } from '@/hooks/usePostsListener';
import { usePostReadStatus } from '@/hooks/usePostReadStatus';
import { Bell, AlertCircle, Zap, ChevronDown } from 'lucide-react';
import { Post } from '@/lib/types';

interface PostNotificationItemProps {
  post: Post;
  isRead: boolean;
  onMarkAsRead: (postId: string) => void;
  onExpand: (post: Post) => void;
}

function PostNotificationItem({
  post,
  isRead,
  onMarkAsRead,
  onExpand,
}: PostNotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = () => {
    switch (post.priority) {
      case 'emergency':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-maroon-500 bg-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`border-l-4 rounded-r-lg overflow-hidden ${getPriorityStyles()} ${
        !isRead ? 'shadow-md' : ''
      } transition-all`}
    >
      <div
        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => {
          if (!isRead) {
            onMarkAsRead(post.id!);
          }
          setIsExpanded(!isExpanded);
        }}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Priority Badge & Type */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {!isRead && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
              {post.priority === 'emergency' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  <AlertCircle size={12} /> Emergency
                </span>
              )}
              {post.priority === 'high' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  <Zap size={12} /> High Priority
                </span>
              )}
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gold-100 text-gold-700">
                  📌 Pinned
                </span>
              )}
              <span className="text-xs text-maroon-600 font-medium uppercase">
                {post.type}
              </span>
            </div>

            {/* Title */}
            <h3 className={`font-semibold ${!isRead ? 'font-bold' : ''} text-maroon-900 mb-1 line-clamp-2`}>
              {post.title}
            </h3>

            {/* Preview */}
            <p className="text-sm text-maroon-700 line-clamp-2">{post.content}</p>

            {/* Date */}
            <p className="text-xs text-maroon-500 mt-2">
              {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: post.createdAt?.toDate?.().getFullYear?.() !== new Date().getFullYear() ? 'numeric' : undefined,
                }
              )}
            </p>
          </div>

          {/* Expand Button */}
          <button
            className={`mt-1 p-1 text-maroon-600 hover:text-maroon-800 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t mt-3 pt-3"
            >
              <div className="prose prose-sm max-w-none mb-3 text-maroon-800">
                {post.content.split('\n').map((line, idx) => (
                  <p key={idx} className="text-sm mb-2">
                    {line}
                  </p>
                ))}
              </div>

              {/* Images Preview */}
              {post.images && post.images.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {post.images.slice(0, 2).map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className="rounded w-full h-20 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Attachments */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mb-3 space-y-1">
                  {post.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-maroon-700 hover:text-maroon-900 font-medium p-1.5 rounded hover:bg-maroon-100 transition-colors"
                    >
                      📎 {attachment.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => onExpand(post)}
                  className="flex-1 py-2 text-xs font-semibold text-maroon-700 hover:text-maroon-900 rounded hover:bg-maroon-100 transition-colors"
                >
                  View Full
                </button>
                {!isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(post.id!);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-maroon-900 rounded hover:bg-maroon-800 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-maroon-100 text-maroon-700">
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </span>
                  {post.isPinned && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700">
                      📌 Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-serif font-bold text-maroon-900">{post.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-maroon-400 hover:text-maroon-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-maroon-600 mb-6">
              {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="prose prose-sm max-w-none mb-6 text-maroon-800">
              {post.content.split('\n').map((line, idx) => (
                <p key={idx} className="mb-3">
                  {line}
                </p>
              ))}
            </div>

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

export function PostsNotifications() {
  const { posts, loading, error } = usePostsListener('dashboard');
  const { isRead, markAsRead } = usePostReadStatus();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white animate-pulse h-24 rounded-xl border-l-4" />
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
        <p className="text-red-800">Unable to load notifications.</p>
      </motion.div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Bell className="mx-auto mb-3 text-maroon-300" size={32} />
        <p className="text-maroon-600">No notifications at this time.</p>
      </motion.div>
    );
  }

  // Sort by unread first, then by priority and date
  const sortedPosts = [...posts].sort((a, b) => {
    const aRead = isRead(a.id!);
    const bRead = isRead(b.id!);

    if (aRead !== bRead) return aRead ? 1 : -1;

    const priorityOrder = { emergency: 0, high: 1, normal: 2 };
    const aPriority = priorityOrder[a.priority] ?? 2;
    const bPriority = priorityOrder[b.priority] ?? 2;

    if (aPriority !== bPriority) return aPriority - bPriority;

    const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return bTime.getTime() - aTime.getTime();
  });

  const unreadCount = sortedPosts.filter(p => !isRead(p.id!)).length;

  return (
    <>
      <div className="space-y-3">
        {/* Header with unread count */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <span className="text-sm font-semibold text-blue-700">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </span>
          </motion.div>
        )}

        {/* Notifications List */}
        <AnimatePresence mode="popLayout">
          {sortedPosts.map((post) => (
            <PostNotificationItem
              key={post.id}
              post={post}
              isRead={isRead(post.id!)}
              onMarkAsRead={markAsRead}
              onExpand={setSelectedPost}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
