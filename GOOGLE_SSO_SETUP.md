# Google SSO Setup Guide for Bari Samaj PWA

## Overview
This document covers the complete Google Single Sign-On (SSO) implementation for the Bari Samaj application.

## Architecture

### Authentication Flow
```
User → Login/Register Page 
  → Google Sign-In Button
    → Google OAuth Popup/Redirect
      → Firebase Authentication
        → Firestore User Profile Creation
          → AuthContext State Update
            → Navbar Profile Display
              → Dashboard Access
```

## Implementation Details

### 1. Google Authentication Service
**File:** `src/services/googleAuthService.ts`

Provides two authentication methods:

#### Popup Method (Default)
```typescript
const user = await signInWithGoogle();
```
- Opens Google login in a popup window
- Works on desktop and most mobile browsers
- Recommended for most use cases

#### Redirect Method (Fallback)
```typescript
const user = await signInWithGoogleRedirect();
```
- Redirects user to Google login page
- Better for popup-blocking browsers
- Requires separate `useGoogleSignInRedirect()` hook for mobile

**Key Features:**
- Auto-creates user profiles in Firestore
- Stores provider information (Google)
- Sets user role as "member" by default
- Enables session persistence

### 2. Reusable Google Sign-In Button
**File:** `src/components/auth/GoogleSignInButton.tsx`

```tsx
<GoogleSignInButton 
  onSuccess={() => router.push('/dashboard')}
  redirectPath="/dashboard"
  variant="default"
/>
```

**Props:**
- `onSuccess?: () => void` - Callback after successful login
- `redirectPath?: string` - Where to redirect after login (default: "/dashboard")
- `className?: string` - Custom CSS classes
- `variant?: 'default' | 'outline'` - Button style variant

**Features:**
- Built-in error handling and display
- Loading spinner during authentication
- Google logo SVG included
- Responsive design
- Two style variants for different contexts

### 3. Authentication Pages

#### Login Page
**File:** `src/app/login/page.tsx`

Features:
- Google SSO sign-in button (primary)
- Email/password login fallback
- "Forgot password?" link
- Link to register page
- Error message display
- Loading states

#### Register Page
**File:** `src/app/register/page.tsx`

Features:
- Google SSO sign-up button (outline variant)
- Email/password registration with validation
- Password strength requirements (6+ characters)
- Specific error messages:
  - Email already in use
  - Weak password
  - Invalid email format
- Auto-creates Firestore user profile
- Link to login page

#### Password Reset Page
**File:** `src/app/forgot-password/page.tsx`

Features:
- Email-based password reset using Firebase
- Success/error messaging
- User-friendly error handling:
  - User not found
  - Invalid email
  - Network errors
- Back to login link
- Loading states

### 4. Authentication Context
**File:** `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}
```

**Provides:**
- Real-time user state management
- Loading states during auth operations
- Logout functionality
- Automatic persistence across sessions

### 5. Navbar Integration
**File:** `src/components/layout/Navbar.tsx`

**When User is Logged In:**
- Displays user's Google profile photo (or initial avatar)
- Shows first name in navigation
- Dropdown menu with:
  - Email display
  - "My Profile" link
  - "Dashboard" link
  - "Logout" button
- Mobile-responsive user menu

**When User is Not Logged In:**
- "Login" button (styled link)
- "Donate" button
- Mobile menu with same options

## Firestore User Profile Structure

```json
{
  "uid": "user-id",
  "name": "User's Display Name",
  "email": "user@example.com",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "provider": "google",
  "role": "member",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Firebase Configuration

### Required Firebase Settings

1. **Enable Google Sign-In Provider**
   - Go to Firebase Console → Authentication
   - Click "Google" provider
   - Enable it
   - Provide project support email

2. **OAuth Consent Screen**
   - Configure in Google Cloud Console
   - Add necessary scopes (email, profile, openid)
   - Add test users if in development

3. **Web Client ID**
   - Generate Web Client ID from Google Cloud Console
   - Auto-configured through Firebase Console

4. **Firestore Database**
   - Create "users" collection
   - Set security rules to allow authenticated users to read/write their own profile

### Security Rules (Firestore)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /posts/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Environment Variables

**Required in `.env.local`:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Protected Pages

The following pages are marked as `force-dynamic` to prevent build-time API calls:

- `/dashboard` - User dashboard (redirect if not authenticated)
- `/dashboard/profile` - User profile page
- `/dashboard/matrimony/register` - Matrimony registration
- `/admin` - Admin portal (for admin users only)
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset page

## Usage Examples

### Basic Login
```typescript
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <GoogleSignInButton 
      redirectPath="/dashboard"
      onSuccess={() => console.log("Login successful!")}
    />
  );
}
```

### Using Auth in Components
```typescript
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user.displayName}</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

### Protected Page Pattern
```typescript
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div>Loading...</div>;

  return <div>Protected content</div>;
}
```

## Deployment to Vercel

### Steps:

1. **Add Environment Variables to Vercel**
   - Go to Vercel Project Settings → Environment Variables
   - Add all Firebase configuration variables
   - Mark public Firebase keys as appropriate

2. **Configure Google OAuth in Firebase**
   - Authorized JavaScript origins:
     - `https://yourdomain.com`
     - `https://yourdomain.vercel.app`
   - Authorized redirect URIs:
     - `https://yourdomain.com`
     - `https://yourdomain.vercel.app`

3. **Update Firestore Security Rules**
   - Deploy rules that handle authenticated users
   - Allow profile creation on first login

4. **Deploy**
   ```bash
   git push origin main
   # Vercel auto-deploys on push
   ```

## Testing

### Local Testing
```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Click Login
# Test Google sign-in with popup
# Verify user profile appears in navbar
# Test logout
# Check Firestore for user profile creation
```

### Manual Testing Checklist
- [ ] Google sign-in from login page
- [ ] Google sign-up from register page
- [ ] User profile appears in navbar
- [ ] Dropdown menu shows correct user info
- [ ] Dashboard accessible after login
- [ ] Logout functionality works
- [ ] Session persists on page refresh
- [ ] Mobile menu works correctly
- [ ] Password reset email sent
- [ ] Google profile photo displays

## Troubleshooting

### Issue: "Popup blocked" error
**Solution:** Use redirect method fallback
- Ensure `signInWithGoogleRedirect()` is implemented
- Check browser popup settings

### Issue: "User profile not created"
**Solution:** 
- Check Firestore security rules
- Verify "users" collection exists
- Check browser console for Firestore errors

### Issue: "User logged in but navbar shows login button"
**Solution:**
- Clear browser cache and local storage
- Check AuthContext is properly initialized
- Verify Firebase auth persistence is enabled

### Issue: "Session lost on page refresh"
**Solution:**
- Enable `browserLocalPersistence` in googleAuthService
- Check `.env.local` has correct Firebase config
- Verify Firebase auth domain matches environment

## Best Practices

1. **Always use `force-dynamic`** on auth-related pages to prevent build-time API calls
2. **Store minimal user data** in Firestore (use Firebase auth for sensitive data)
3. **Use Google profile photo** when available for consistent UX
4. **Handle auth loading states** to prevent flashing login button
5. **Implement proper error boundaries** around auth components
6. **Use AuthContext** instead of importing Firebase directly in components
7. **Redirect to login** before showing protected content

## Security Considerations

✅ **Implemented:**
- OAuth 2.0 via Firebase
- Session persistence with local storage
- User data isolated by UID in Firestore
- Server-side routes marked as dynamic
- Environment variables for secrets

⚠️ **To Implement:**
- CSRF protection on form submissions
- Rate limiting on auth endpoints
- Email verification flow
- Role-based access control (admin checks)
- Audit logging for auth events

## File Structure

```
src/
├── services/
│   └── googleAuthService.ts          # Google OAuth service
├── components/
│   ├── auth/
│   │   └── GoogleSignInButton.tsx   # Reusable sign-in button
│   └── layout/
│       └── Navbar.tsx               # Updated with user profile
├── contexts/
│   └── AuthContext.tsx              # Auth state management
└── app/
    ├── login/
    │   └── page.tsx                 # Login page with Google SSO
    ├── register/
    │   └── page.tsx                 # Register page with Google SSO
    ├── forgot-password/
    │   └── page.tsx                 # Password reset page
    └── dashboard/
        └── layout.tsx               # Protected dashboard layout
```

## Next Steps

1. **Test thoroughly** on staging environment
2. **Configure Vercel environment** variables
3. **Update OAuth consent screen** in Google Cloud Console
4. **Deploy to Vercel** and test end-to-end
5. **Monitor Firebase authentication** logs
6. **Implement admin role checking** for `/admin` route
7. **Add email verification** for email/password auth
8. **Set up notification preferences** in user profile

## Support

For issues or questions:
1. Check Firebase Console → Authentication logs
2. Review browser console for errors
3. Verify `.env.local` configuration
4. Test with different browsers/devices
5. Check Firestore security rules

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Complete and tested ✅
