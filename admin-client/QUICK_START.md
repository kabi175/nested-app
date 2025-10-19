# Quick Start: Firebase Authentication

## ⚡ 3-Minute Setup

### 1. Create `.env.local` file

```bash
cd admin-client
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
```

Get Firebase credentials from: https://console.firebase.google.com/
- Project Settings → Your apps → Web app → Config

### 2. Create Admin User

**In Firebase Console:**
1. Go to Authentication → Users → Add User
2. Create user with email/password
3. Copy the UID

**Set Admin Role (Backend):**
```bash
# In your backend, run this or call the API
curl -X POST http://localhost:8080/api/v1/admin/set-custom-claims \
  -H "Content-Type: application/json" \
  -d '{"uid": "USER_UID_HERE", "admin": true, "role": "ADMIN"}'
```

### 3. Start the App

```bash
npm run dev
```

Navigate to http://localhost:3000 and login!

## 📋 What's Included

✅ **Login page** at `/login`  
✅ **Unauthorized page** at `/unauthorized`  
✅ **Auto-redirect** to login if not authenticated  
✅ **API token** automatically included in all requests  
✅ **Logout button** in sidebar footer  
✅ **Admin-only access** - checks custom claims  

## 🔑 Environment Variables Needed

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🎯 Testing

1. **Login:** Navigate to http://localhost:3000
2. **Verify:** Check Network tab for `Authorization: Bearer {token}` header
3. **Logout:** Click logout button in sidebar

## 📝 Files Created

- `lib/firebase.ts` - Firebase config
- `contexts/AuthContext.tsx` - Auth state management
- `components/LayoutContent.tsx` - Conditional layout
- `app/login/page.tsx` - Login UI
- `app/unauthorized/page.tsx` - Access denied UI
- Updated `lib/api-client.ts` - Auto token injection
- Updated `components/AppSidebar.tsx` - Logout button
- Updated `app/layout.tsx` - Auth provider wrapper

See `FIREBASE_AUTH_SETUP.md` for detailed documentation.

