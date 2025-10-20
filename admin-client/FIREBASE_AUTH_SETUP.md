# Firebase Authentication Setup for Admin Client

This guide explains how to set up and use Firebase authentication for the admin dashboard.

## 📋 Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Firebase Authentication enabled (Email/Password provider)
- Firebase Admin SDK configured in the backend

## 🔧 Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the `admin-client` directory with your Firebase credentials:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Where to find these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. If you haven't added a web app, click "Add app" and select web
6. Copy the config values to your `.env.local`

### 2. Enable Email/Password Authentication in Firebase

1. Go to Firebase Console > Authentication
2. Click "Get Started" (if not already enabled)
3. Click "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save

### 3. Create Your First Admin User

#### Option A: Using Firebase Console (Recommended)

1. Go to Firebase Console > Authentication > Users
2. Click "Add User"
3. Enter admin email and password
4. Click "Add User"
5. Copy the User UID
6. Use the backend API to set admin role (see backend setup below)

#### Option B: Using Backend API

Call the super admin creation endpoint (only works in development or with token):

```bash
curl -X POST http://localhost:8080/api/v1/admin/create-super-admin \
  -d "email=admin@yourcompany.com&password=StrongPassword123!"
```

### 4. Set Admin Custom Claims (Backend)

After creating a user in Firebase, you need to give them admin privileges. You can do this via:

**Backend Script or API:**
```java
// In your backend, create this endpoint or script
FirebaseAuth.getInstance().setCustomUserClaims(uid, Map.of(
    "admin", true,
    "role", "ADMIN"
));
```

**Or via Firebase Admin SDK script:**
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdminRole(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
    role: 'ADMIN'
  });
  console.log(`Admin role set for ${email}`);
}

setAdminRole('admin@yourcompany.com');
```

## 🚀 Usage

### Starting the Admin Dashboard

```bash
cd admin-client
npm run dev
```

The app will open at `http://localhost:3000` and redirect to `/login`.

### Login Flow

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter your admin email and password
4. If credentials are valid and user has admin role, you'll be redirected to the dashboard
5. If user doesn't have admin role, they'll see an "Access Denied" page

### Logout

Click the "Logout" button in the sidebar footer.

## 🔒 Security Features

### Implemented

✅ **Firebase Authentication** - Email/Password login  
✅ **Custom Claims** - Role-based access control (admin/user)  
✅ **Protected Routes** - Automatic redirect to login if not authenticated  
✅ **Authorization Checks** - API requests include Firebase JWT token  
✅ **Admin-Only Access** - Non-admin users are blocked from dashboard  
✅ **Token Auto-Refresh** - Firebase automatically refreshes tokens  
✅ **Secure Token Storage** - Tokens stored in memory, not localStorage  

### Backend Integration

The API client automatically:
- Gets the current user's Firebase token
- Includes it in the `Authorization` header as `Bearer {token}`
- The backend verifies the token and checks admin role
- In development mode, admin checks are bypassed

## 📁 File Structure

```
admin-client/
├── lib/
│   ├── firebase.ts              # Firebase initialization
│   └── api-client.ts            # API client with auth token
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── components/
│   ├── LayoutContent.tsx        # Conditional sidebar rendering
│   └── AppSidebar.tsx           # Sidebar with logout
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── unauthorized/
│       └── page.tsx            # Access denied page
```

## 🧪 Testing

### Test Admin Login

1. Create a test admin user in Firebase Console
2. Set custom claims (admin: true)
3. Login at `http://localhost:3000/login`
4. Verify you can access all dashboard pages

### Test Non-Admin User

1. Create a regular user (without admin claims)
2. Try to login
3. Should see "Access denied: Admin privileges required"

### Test API Authentication

1. Login to dashboard
2. Open browser DevTools > Network tab
3. Navigate to any page (Users, Baskets, etc.)
4. Check API requests - should include `Authorization: Bearer {token}` header

## 🐛 Troubleshooting

### "Access denied: Admin privileges required"

**Cause:** User doesn't have admin custom claims  
**Solution:** Set custom claims using Firebase Admin SDK (see step 4 above)

### "Firebase: Error (auth/invalid-api-key)"

**Cause:** Invalid Firebase configuration  
**Solution:** Double-check `.env.local` values match Firebase Console

### API returns 401 Unauthorized

**Cause:** Token not being sent or is invalid  
**Solution:** 
- Check if user is logged in
- Try logging out and back in (refreshes token)
- Verify backend Firebase Admin SDK is configured correctly

### "Cannot find module '@/components/LayoutContent'"

**Cause:** TypeScript hasn't picked up new files  
**Solution:** Restart the development server or IDE

### Redirect loop between login and dashboard

**Cause:** Auth state not properly initialized  
**Solution:** Check browser console for errors, clear cookies/cache

## 🔐 Production Checklist

Before deploying to production:

- [ ] Update `.env.local` with production Firebase project
- [ ] Enable Firebase App Check for API security
- [ ] Set up proper CORS in backend for production domain
- [ ] Enable Firebase Authentication rate limiting
- [ ] Set up monitoring and alerts for failed login attempts
- [ ] Configure Firebase password policy requirements
- [ ] Set up email verification for new users
- [ ] Enable two-factor authentication option
- [ ] Review and restrict Firebase security rules
- [ ] Set up proper logging for auth events

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the backend logs for authentication failures
3. Verify Firebase project settings and rules
4. Ensure backend is running and accessible

---

**Created:** October 2025  
**Last Updated:** October 2025

