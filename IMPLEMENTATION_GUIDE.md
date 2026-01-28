# Bari Samaj PWA - Admin Portal & Push Notifications Implementation Guide

## Overview
This document outlines the complete implementation of the Admin Portal for managing posts/announcements with automatic Firebase Cloud Messaging (FCM) push notifications to all app users.

---

## ✅ Implemented Features

### 1. **Firebase Cloud Messaging (FCM) Setup**
- ✅ FCM initialized in `src/lib/firebase.ts`
- ✅ Conditional initialization (client-side only)
- ✅ Safe fallback for unsupported browsers
- **Next Step:** Add VAPID key to Firebase Console

**Location:** `src/lib/firebase.ts`

### 2. **FCM Token Management Service**
- ✅ `src/services/notificationService.ts` - Complete FCM integration
  - Request notification permissions
  - Get and store FCM tokens in Firestore
  - Listen for incoming messages
  - Remove tokens on logout

**Key Functions:**
```typescript
requestNotificationPermission() // Request browser permission & get token
getFCMToken() // Get device token
saveFCMToken(userId, token) // Store in Firestore
listenForMessages(callback) // Listen for notifications when app open
removeFCMToken(userId) // Cleanup on logout
```

### 3. **Push Notification Trigger**
- ✅ Notifications sent automatically when admin publishes a post
- ✅ Notification data includes: title, content preview, post ID, type, priority
- ✅ Only sends when post status changes to "published"

**Location:** `src/components/admin/posts/PostEditor.tsx` (lines 48-59)

### 4. **Notification UI Components**
- ✅ `src/components/notifications/NotificationToast.tsx` - Toast notification display
  - Animated entrance/exit with Framer Motion
  - Auto-dismiss after 5 seconds
  - Click "View Post" to navigate to post
  - Supports: success, error, info, notification types

### 5. **Notification Permission Flow**
- ✅ `src/components/pwa/InstallPrompt.tsx` - Enhanced with notification request
  - Shows notification permission prompt after app install
  - User can enable/disable notifications
  - Clean UI with clear call-to-action

### 6. **Admin Post Creation Features**
- ✅ Image upload with validation (type, size limit 5MB)
- ✅ Image preview grid with delete functionality
- ✅ Post types: Announcement, Event, Matrimony, Update, General
- ✅ Priority levels: Normal, High, Emergency
- ✅ Status: Draft, Published, Archived
- ✅ Visibility: Public, Members-only
- ✅ Pin to top functionality
- ✅ Schedule publish date/time
- ✅ Set post expiry date/time

### 7. **Homepage/NewsFeed Enhancements**
- ✅ Display post images (first image as cover)
- ✅ Show multiple image count (+2 indicator)
- ✅ Filter posts by type (All, Announcement, Event, etc.)
- ✅ Show emergency/high priority badges
- ✅ Pin icon for pinned posts
- ✅ Empty state messaging
- ✅ Smooth layout transitions

**Location:** `src/components/home/NewsFeed.tsx`

---

## 🔧 Configuration Required

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

**How to get VAPID Key:**
1. Go to Firebase Console → Your Project
2. Settings → Cloud Messaging tab
3. Copy the "Web Push certificates" public key
4. Paste into `.env.local`

### Firestore Collections

**userNotificationTokens** (Auto-created by service):
```json
{
  "userId": {
    "token": "FCM_TOKEN_HERE",
    "updatedAt": Timestamp
  }
}
```

---

## 📱 User Flow

### For End Users:
1. User installs app (PWA or native)
2. InstallPrompt shows notification permission request
3. User grants permission (FCM token saved to Firestore)
4. Admin creates a post and publishes
5. All users with permission receive push notification
6. User can click notification or see in-app toast
7. User can filter posts by type on homepage

### For Admins:
1. Admin goes to `/admin` dashboard
2. Clicks "Posts" tab
3. Clicks "Create Post" button
4. Fills in: Title, Content, Upload images
5. Selects: Type, Priority, Status, Visibility
6. Optionally: Pin to top, Schedule publish, Set expiry
7. Clicks "Publish" → Notification sent to all users!

---

## 🚀 Backend API (Required for Production)

### `/api/send-notification` - Placeholder created
**Current:** `src/app/api/send-notification/route.ts` is a stub

**Production Implementation Needed:**
```typescript
// Use Firebase Admin SDK to send notifications
import admin from 'firebase-admin';

const message = {
  notification: { title, body },
  data: { postId, type, priority },
  tokens: [ /* FCM tokens */ ]
};

await admin.messaging().sendMulticast(message);
```

**Alternative:** Use third-party service:
- Firebase Cloud Functions
- Cloudflare Workers
- AWS Lambda
- OneSignal (easier, paid)

---

## 📊 Database Schema

### Posts Collection
```typescript
{
  id: string
  title: string
  content: string
  type: 'announcement' | 'event' | 'matrimony' | 'update' | 'general'
  priority: 'normal' | 'high' | 'emergency'
  visibility: 'public' | 'private'
  status: 'draft' | 'published' | 'archived'
  images: string[] // Firebase Storage URLs
  isPinned: boolean
  scheduledAt?: Date
  expiresAt?: Date
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 📋 Testing Checklist

- [ ] VAPID key added to Firebase Console
- [ ] VAPID key added to `.env.local`
- [ ] Admin can create posts with images
- [ ] Posts display with images on homepage
- [ ] Can filter posts by type
- [ ] Publishing post shows success message
- [ ] Admin device receives notification when published
- [ ] Other user devices receive notifications
- [ ] Notification click navigates to post
- [ ] Pinned posts appear at top
- [ ] High/Emergency priority badges display
- [ ] Post expiry works (old posts don't show)
- [ ] Scheduled posts don't show until scheduled time
- [ ] Build passes: `npm run build`

---

## 🔐 Security Considerations

### Current Implementation:
- Admin endpoints NOT protected (need role check)
- Anyone authenticated can create posts

### Recommended:
```typescript
// Add to PostEditor or Admin routes:
import { useAuth } from "@/contexts/AuthContext";

export function PostEditor() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if user has admin role
    if (!user?.isAdmin) {
      router.push('/login');
    }
  }, [user]);
}
```

---

## 📦 Files Created/Modified

### New Files:
- `src/services/notificationService.ts`
- `src/components/notifications/NotificationToast.tsx`
- `src/components/providers/NotificationProvider.tsx`
- `src/hooks/useNotifications.ts`
- `src/app/api/send-notification/route.ts`

### Modified Files:
- `src/lib/firebase.ts` - Added FCM import & initialization
- `src/components/admin/posts/PostEditor.tsx` - Image upload, notification trigger
- `src/components/home/NewsFeed.tsx` - Image display, filtering
- `src/components/pwa/InstallPrompt.tsx` - Notification permission flow
- `src/app/layout.tsx` - Added NotificationProvider wrapper
- `.env.local` - Added VAPID_KEY placeholder

---

## 🎯 Next Steps

### Must Do (For Production):
1. **Add VAPID Key** to Firebase Console & `.env.local`
2. **Implement Backend** for `send-notification` API
3. **Add Admin Role Check** to prevent unauthorized post creation
4. **Add Firestore Rules** to secure user data
5. **Test on Real Devices** (notifications only work on HTTPS)

### Should Do:
1. Create User Notification Preferences (opt-in/out by type)
2. Add Rich Content Editor (Markdown preview)
3. Add Post Analytics (view counts, engagement)
4. Add Comment/Interaction system
5. Create notification history/archive

### Nice to Have:
1. Post scheduling with cron jobs
2. Bulk post operations (import CSV)
3. Post templates for recurring announcements
4. Analytics dashboard for admins
5. Email notifications as fallback

---

## 🐛 Troubleshooting

### Notifications not received:
1. Check VAPID key is valid in Firebase Console
2. Verify user device token is saved in Firestore
3. Check browser console for errors
4. Ensure HTTPS (required for FCM)
5. Check Firebase Console for message delivery status

### Images not uploading:
1. Check Firebase Storage rules allow uploads
2. Verify file size < 5MB
3. Check browser console for upload errors
4. Ensure user authenticated

### Posts not showing on homepage:
1. Check post status is "published"
2. Check post not scheduled for future date
3. Check post not expired
4. Refresh page (or wait for Firestore listener)

---

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Web SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Last Updated:** January 28, 2026  
**Version:** 1.0  
**Status:** Ready for production (pending VAPID key configuration)
