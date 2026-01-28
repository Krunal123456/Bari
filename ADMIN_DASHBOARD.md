# Admin Dashboard - Comprehensive Guide

## Overview

The Bari Samaj PWA now includes a production-ready Admin Dashboard with complete CRUD operations, role-based access control, and audit logging. This dashboard enables administrators to manage the entire community platform efficiently.

## Architecture

### File Structure

```
src/
├── app/admin/
│   ├── layout.tsx                 # Main admin layout with sidebar
│   ├── page.tsx                   # Dashboard overview
│   ├── posts/
│   │   └── page.tsx              # Posts management
│   ├── matrimony/
│   │   └── page.tsx              # Matrimony approvals
│   ├── directory/
│   │   └── page.tsx              # User directory management
│   ├── content/
│   │   └── page.tsx              # CMS content management
│   ├── export/
│   │   └── page.tsx              # Data export (JSON/CSV)
│   └── settings/
│       └── page.tsx              # Admin settings
├── services/
│   └── adminService.ts           # Firebase Firestore operations
└── lib/
    └── admin-types.ts            # TypeScript interfaces
```

## Features

### 1. Dashboard Overview (`/admin`)
- **Real-time Statistics**
  - Total community members
  - Matrimony profiles (approved)
  - Pending approvals
  - Active posts
  - Directory entries

- **Quick Actions**
  - Create new post
  - Review matrimony profiles
  - Manage directory
  - Export data

- **Recent Activity Feed**
  - Shows last 10 admin activities
  - Displays admin name, action type, and timestamp
  - Auto-updated when actions occur

### 2. Posts & Announcements (`/admin/posts`)
- **CRUD Operations**
  - View all posts with filters
  - Create new posts with rich metadata
  - Edit existing posts
  - Archive posts (soft delete)
  - Preview posts before publishing

- **Post Types**
  - Announcement
  - Event
  - Matrimony Notice
  - Important Update
  - General Post

- **Post Status**
  - Draft
  - Published
  - Scheduled
  - Archived

- **Post Priority**
  - Normal
  - High Priority
  - Emergency

### 3. Matrimony Profile Approvals (`/admin/matrimony`)
- **Maker-Checker Pattern**
  - Review pending profiles
  - Approve profiles for public visibility
  - Reject with feedback
  - Request changes from users

- **Actions**
  - Approve: Profile becomes visible on matrimony page
  - Reject: Profile is marked as rejected with reason
  - Request Changes: User must resubmit with corrections

- **Profile Information Displayed**
  - Name, age, gender, location
  - Education and occupation
  - Height and marital status
  - Personal description

### 4. User Directory Management (`/admin/directory`)
- **Directory Operations**
  - View all community members
  - Search by name, profession, or location
  - Filter by approval status
  - Approve pending entries
  - Delete inappropriate entries

- **Features**
  - Real-time search filtering
  - Two-way toggle filters (Approved / Pending)
  - Contact information display (phone numbers)
  - Soft delete (preserves data in Firestore)

### 5. CMS Content Management (`/admin/content`)
- **Content Management**
  - Edit website content sections
  - Version tracking (auto-incremented)
  - Track changes with editor name and timestamp
  - Rich text editing capabilities

- **Content Types Supported**
  - Page content
  - Help documentation
  - Community guidelines
  - Terms and conditions
  - Custom content sections

### 6. Data Export (`/admin/export`)
- **Export Formats**
  - JSON: Complete data with all fields
  - CSV: Spreadsheet-compatible format for Excel/Sheets

- **Exportable Data**
  - Matrimony profiles
  - Community directory
  - (Extensible for other data types)

- **Features**
  - On-demand generation (not stored on server)
  - Date-stamped filenames
  - Only active/approved records exported
  - No sensitive data (passwords) exported

### 7. Admin Settings (`/admin/settings`)
- **Account Management**
  - View account information
  - Display user name, email, ID
  - Secure logout
  - Role and permissions display

- **Security Information**
  - Explanation of authentication method
  - Role-based access control info
  - Audit logging details

## Database Schema

### Collections

#### `posts`
```typescript
interface AdminPost {
  id: string;
  title: string;
  content: string;
  type: PostType;  // "Announcement" | "Event" | etc.
  priority: PostPriority;  // "Normal" | "High Priority" | "Emergency"
  status: PostStatus;  // "Draft" | "Published" | "Scheduled" | "Archived"
  visibility: PostVisibility;  // "All Users" | "Logged-in Only"
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;  // User ID
  attachments?: string[];
}
```

#### `matrimony_profiles`
```typescript
interface MatrimonyProfile {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  fullName: string;
  age: number;
  gender: string;
  height: string;
  education: string;
  occupation: string;
  location: string;
  about: string;
  lookingFor: string;
  approvedBy?: string;  // Admin ID
  approvalDate?: string;
  rejectionReason?: string;
  changeRequests?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `directory`
```typescript
interface DirectoryEntry {
  id: string;
  name: string;
  phone: string;
  profession?: string;
  location?: string;
  email?: string;
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### `cms_content`
```typescript
interface CMSContent {
  id: string;
  title: string;
  type: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedByName: string;
}
```

#### `admin_logs`
```typescript
interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  timestamp: string;
}
```

## Service Layer (`adminService.ts`)

### Posts Operations
```typescript
// Create, read, update, delete posts
createPost(post: Omit<AdminPost, "id" | "createdAt" | "updatedAt">) 
updatePost(id: string, updates: Partial<AdminPost>)
deletePost(id: string)  // Soft delete - sets status to "Archived"
getPosts(filters?: PostFilters, pageSize?: number)
getPost(id: string)
```

### Matrimony Operations
```typescript
getMatrimonyProfiles(filters?: MatrimonyFilters, pageSize?: number)
getMatrimonyProfile(id: string)
approveMatrimonyProfile(id: string, adminId: string, adminName: string)
rejectMatrimonyProfile(id: string, reason: string, adminId: string, adminName: string)
requestChanges(id: string, changes: string, adminId: string, adminName: string)
```

### Directory Operations
```typescript
getDirectoryEntries(filters?: DirectoryFilters, pageSize?: number)
approveDirectoryEntry(id: string, adminId: string, adminName: string)
deleteDirectoryEntry(id: string, adminId: string, adminName: string)  // Soft delete
```

### CMS Operations
```typescript
getCMSContent(type?: string)
updateCMSContent(id: string, updates: Partial<CMSContent>, adminId: string, adminName: string)
```

### Utility Operations
```typescript
logActivity(adminId, adminName, action, entityType, entityId, changes?)
getActivityLogs(limit?: number)
getDashboardStats(): Promise<DashboardStats>
uploadFile(file: File, path: string): Promise<string>
deleteFile(url: string)
exportMatrimonyProfiles(filters?: MatrimonyFilters)
exportDirectoryEntries(filters?: DirectoryFilters)
```

## Authentication & Authorization

### Current Implementation
- Uses Firebase Authentication with email/password and Google SSO
- Admin access is checked on the admin layout level
- Users are redirected to login if not authenticated

### Recommended Firebase Security Rules
```typescript
// For /admin routes - Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own data
    match /users/{document=**} {
      allow read, write: if request.auth.uid == document;
    }
    
    // Posts - admins can write, all authenticated users can read
    match /posts/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Admin logs - only for auditing
    match /admin_logs/{document=**} {
      allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
  }
}
```

### Setting Admin Role with Firebase Custom Claims
```typescript
// Use Firebase Admin SDK (backend only)
admin.auth().setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log("Admin claim set");
  });
```

## UI Components & Design

### Color Scheme
- **Primary**: Maroon (#800000)
- **Secondary**: Gold (#FFD700)
- **Background**: Ivory (#F5F5DC)
- **Accent**: Complementary colors for different sections

### Layout Features
- **Responsive Design**: Works on desktop and mobile
- **Sidebar Navigation**: 7 main menu items with icons
- **Smooth Animations**: Framer Motion for transitions
- **Dark Mode Ready**: Uses Tailwind color utilities
- **Loading States**: Spinner icons during data fetch
- **Error Handling**: User-friendly error messages

### Sidebar Menu Items
1. Dashboard - Overview & Analytics
2. Posts & Notifications - Manage announcements
3. Matrimony Approvals - Review profiles
4. User Directory - Manage members
5. Samaj Content - CMS Management
6. Data Export - Export reports
7. Settings - Admin settings

## Error Handling & Loading States

All admin pages include:
- **Loading Indicators**: Loader2 spinner during data fetch
- **Error Messages**: Alert boxes with actionable feedback
- **Empty States**: User-friendly "no data" messages
- **Fallback UI**: Graceful degradation on errors
- **Retry Mechanisms**: Users can refresh to retry

## Performance Considerations

- **Pagination**: 20-50 items per page (configurable)
- **Real-time Listeners**: Not currently used (can be added with Firestore real-time listeners)
- **Lazy Loading**: Admin pages load on demand
- **Static Generation**: Dashboard pre-rendered at build time
- **Image Optimization**: Firebase Storage for large files

## Deployment

### Environment Variables Required
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Deployment Checklist
- [ ] Set Firebase custom claims for admin users
- [ ] Configure Firestore security rules
- [ ] Enable Firebase Cloud Storage (for file uploads)
- [ ] Set up Firebase Cloud Messaging (for notifications)
- [ ] Configure Vercel environment variables
- [ ] Test admin functionality on staging domain
- [ ] Set up monitoring/logging for admin actions
- [ ] Create backup strategy for admin operations

## Future Enhancements

### Planned Features
1. **Real-time Dashboard Updates** - Firestore listeners for live stat updates
2. **Advanced Search** - Full-text search across content
3. **Bulk Operations** - Multi-select for batch approve/reject
4. **Rich Text Editor** - Integrate TipTap or similar for posts
5. **Admin Analytics** - Detailed charts and graphs
6. **Email Notifications** - Alert admins of pending approvals
7. **User Activity Tracking** - Track user engagement metrics
8. **Report Generation** - Advanced PDF/Excel report builder
9. **Backup & Restore** - Data backup functionality
10. **API Documentation** - Self-documenting API endpoints

### Possible Integrations
- SendGrid/Mailgun for email notifications
- Stripe for payment processing (if needed)
- Sentry for error tracking
- Mixpanel for analytics

## Troubleshooting

### Common Issues

**"Admin pages redirect to login"**
- Ensure user is authenticated
- Check Firebase custom claims are set correctly
- Verify session hasn't expired

**"Data not loading"**
- Check Firestore connection
- Verify database rules allow read access
- Check browser console for errors

**"Changes not saving"**
- Verify Firestore write permissions
- Check network connection
- Ensure user ID is correct

**"Export not working"**
- Check browser's download settings
- Verify data exists in Firestore
- Clear cache and retry

## Support & Maintenance

### Regular Maintenance Tasks
- Monitor admin_logs collection growth
- Archive old logs (monthly)
- Update security rules as needed
- Test backup and recovery procedures
- Review and optimize Firestore indexes

### Getting Help
- Check browser console for error messages
- Review Firestore rules in Firebase Console
- Check Firebase Cloud Functions logs
- Review admin activity logs for patterns

## Version History

### v1.0.0 (Current)
- Initial admin dashboard implementation
- 7 main admin sections
- CRUD operations for posts and profiles
- Data export functionality
- Activity logging and audit trails
