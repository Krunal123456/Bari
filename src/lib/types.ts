export type PostType = 'announcement' | 'event' | 'matrimony' | 'update' | 'general';
export type PostPriority = 'normal' | 'high' | 'emergency';
export type PostVisibility = 'public' | 'private' | 'admin'; // private = logged-in users only, admin = admin only
export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
    id?: string;
    title: string;
    content: string; // HTML or Markdown
    type: PostType;
    priority: PostPriority;
    visibility: PostVisibility;
    status: PostStatus;
    isPinned?: boolean; // Pin to top

    // Media
    images?: string[]; // URLs
    attachments?: { name: string; url: string }[]; // PDFs etc.
    videoUrl?: string;

    // Scheduling
    scheduledAt?: any; // Configured Timestamp
    expiresAt?: any;   // Configured Timestamp

    // Audit
    createdBy: string;
    createdAt: any;
    updatedAt: any;
}
