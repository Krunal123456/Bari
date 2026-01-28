# Admin Posts Integration - Quick Reference

## What Was Changed

### New Components Created
1. **`src/components/home/PostsFeed.tsx`** - Displays admin posts on home page
   - Emergency posts: Full-width red banners
   - High-priority posts: Featured orange cards
   - Normal posts: Compact grid cards
   - All with click-to-expand modal

2. **`src/components/dashboard/PostsNotifications.tsx`** - Notification feed in dashboard
   - Inbox-style notification list
   - Unread/read tracking
   - Expandable inline details
   - Full details in modal

### New Hooks Created
1. **`src/hooks/usePostsListener.ts`** - Real-time post fetching
   ```typescript
   const { posts, loading, error } = usePostsListener('home' | 'dashboard');
   ```

2. **`src/hooks/usePostReadStatus.ts`** - Track which posts user has read
   ```typescript
   const { isRead, markAsRead, unreadCount } = usePostReadStatus();
   ```

### Service Enhancements
**`src/services/postService.ts`** - Added real-time listeners
- `listenToActivePublicPosts(callback)` - Public posts for home page
- `listenToUserNotifications(callback)` - All posts for dashboard

### Page Modifications
1. **`src/app/page.tsx`** (Home Page)
   - Added `import { PostsFeed }`
   - Placed `<PostsFeed />` above NewsFeed

2. **`src/app/dashboard/page.tsx`** (User Dashboard)
   - Added `import { PostsNotifications }`
   - Replaced "Recent Activity" with `<PostsNotifications />`

---

## How to Use

### Admin Creates Post
1. Go to Admin Dashboard (`/admin/posts`)
2. Click "New Post"
3. Fill in:
   - **Title** & **Content** (main message)
   - **Type**: announcement, event, update, etc.
   - **Priority**: normal, high, emergency
   - **Visibility**: public, private, admin
   - **Status**: draft or published
   - **Images/Files**: Optional media
   - **Schedule**: Set publish and expiry dates
4. Click "Publish"

### Posts Appear Automatically
- **Home Page** (`/`): Emergency & high-priority posts appear instantly
- **Dashboard** (`/dashboard`): All posts appear as notification list
- **Real-time**: Changes appear immediately without page refresh

### Users Interact
- **Home Page**: Click post to view full details in modal
- **Dashboard**: Click post to expand inline or "View Full" for modal
- **Mark as Read**: Click button to mark notification as read
- **Unread Count**: Badge at top shows how many unread posts

---

## Visibility Rules

| Visibility | Home Page | Dashboard | Logged-Out Users |
|-----------|-----------|-----------|-----------------|
| `public` | ✅ Yes | ✅ Yes | ✅ Yes |
| `private` | ❌ No | ✅ Yes | ❌ No |
| `admin` | ❌ No | ❌ No | ❌ No |

---

## Real-Time Behavior

**Posts Update Instantly**:
- Admin publishes new post → Home page shows it immediately
- Admin changes priority → Post moves to different section
- Post expires → Automatically removed from view
- User marks as read → Changes persist to database

**No Page Refresh Needed** - Everything works with Firestore listeners

---

## Styling & UX

### Home Page Hierarchy
```
┌─────────────────────────────────────┐
│  EMERGENCY POST                     │  ← Red banner, full width
│  Click to view details              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  HIGH PRIORITY POST        [PINNED] │  ← Orange card, 2-column
│  Click to view details              │
└─────────────────────────────────────┘
┌──────────────────┐  ┌──────────────────┐
│ Normal Post      │  │ Normal Post      │  ← Grid cards
│ Click for more   │  │ Click for more   │
└──────────────────┘  └──────────────────┘
```

### Dashboard Hierarchy
```
📍 Unread Count: 3 new notifications
┌──────────────────────────────────┐
│ 🔴 UNREAD | Emergency | Title    │  ← Unread: blue dot
│ Content preview...               │
│ [Expand ▼]                       │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│ Read | High Priority | Title     │  ← Read: normal style
│ Content preview...               │
│ [Expand ▼]                       │
└──────────────────────────────────┘
```

---

## Firestore Collections

### `posts` Collection
```javascript
{
  id: "post123",
  title: "Important Announcement",
  content: "Post details here...",
  type: "announcement",           // announcement | event | update | matrimony | general
  priority: "high",              // normal | high | emergency
  visibility: "public",          // public | private | admin
  status: "published",           // draft | published | archived
  isPinned: true,
  images: ["url1", "url2"],
  attachments: [{name: "doc.pdf", url: "..."}],
  videoUrl: "https://...",
  scheduledAt: Timestamp(...),   // When to publish
  expiresAt: Timestamp(...),     // When to hide
  createdBy: "user123",
  createdAt: Timestamp(...),
  updatedAt: Timestamp(...)
}
```

### `userPostReadStatus` Collection
```javascript
{
  // Document ID = userId
  readStatus: {
    "post123": true,    // Read
    "post456": false,   // Unread
    "post789": true
  },
  updatedAt: Timestamp(...)
}
```

---

## Testing the Feature

### Test Home Page Display
```bash
1. Go to http://localhost:3000
2. Admin creates "EMERGENCY" post with priority: emergency
3. Verify: Red banner appears immediately at top
4. Click post → Modal shows full details
5. Close modal → Back to home
```

### Test Real-Time Updates
```bash
1. Open home page in two browser tabs
2. In Tab 1: Admin publishes a new post
3. In Tab 2: Post appears instantly (no refresh needed)
4. Update post title in admin
5. Both tabs show updated title automatically
```

### Test Dashboard Notifications
```bash
1. Go to /dashboard (logged in)
2. See "Admin Announcements & Updates" section
3. Unread posts show blue dot
4. Click post to expand inline
5. Click "Mark as Read" → Post status updates immediately
6. Unread count decreases
```

### Test Visibility Rules
```bash
1. Create post with visibility: "private"
2. Verify: NOT visible on home page (/), only on dashboard (/dashboard)
3. Log out → Post disappears
4. Log back in → Post visible again on dashboard
```

---

## Common Issues & Fixes

### Posts Not Showing?
- [ ] Check post `status` = "published" (not "draft")
- [ ] Check `visibility` ≠ "admin"
- [ ] Check `scheduledAt` is in past
- [ ] Check `expiresAt` is in future
- [ ] Restart dev server: `npm run dev`

### Real-Time Updates Not Working?
- [ ] Check browser console for errors
- [ ] Verify Firestore is connected
- [ ] Check network tab for WebSocket connection
- [ ] Refresh page to re-establish listener

### Read Status Not Saving?
- [ ] Verify user is logged in
- [ ] Check Firestore `userPostReadStatus` collection exists
- [ ] Look in console for Firestore errors
- [ ] Verify user has write permission

---

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `src/components/home/PostsFeed.tsx` | Home page posts | NEW ✨ |
| `src/components/dashboard/PostsNotifications.tsx` | Dashboard notifications | NEW ✨ |
| `src/hooks/usePostsListener.ts` | Real-time post fetching | NEW ✨ |
| `src/hooks/usePostReadStatus.ts` | Track read status | NEW ✨ |
| `src/services/postService.ts` | Enhanced with listeners | UPDATED 🔧 |
| `src/app/page.tsx` | Added PostsFeed | UPDATED 🔧 |
| `src/app/dashboard/page.tsx` | Added PostsNotifications | UPDATED 🔧 |

---

## Deployment Notes

### Before Deploying to Production
1. **Create Firestore Indexes**:
   - Collection: `posts`, Fields: `status`, `visibility`, `createdAt`
   - Collection: `posts`, Fields: `status`, `createdAt`

2. **Configure Firestore Rules**:
   ```
   Posts collection: Allow read if status==published && visibility in [public,private]
   Posts collection: Allow write only if request.auth.token.admin==true
   userPostReadStatus: Allow read/write if request.auth.uid == resource.__name__
   ```

3. **Test Real-Time Listeners**: Ensure WebSocket connection works on production

4. **Monitor Firestore Usage**: Posts listeners may increase read count slightly

---

## Questions?

Refer to `POSTS_INTEGRATION_GUIDE.md` for detailed documentation covering:
- Complete architecture overview
- Data flow diagrams
- Scalability recommendations
- Error handling strategies
- Future enhancements
- Full API reference
- Troubleshooting guide
