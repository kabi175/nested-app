# 🔑 Get Your Firebase Credentials

## Step-by-Step Guide

### 1️⃣ Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2️⃣ Select Your Project
Click on your project (or create a new one if you don't have one)

### 3️⃣ Go to Project Settings
- Click the **⚙️ gear icon** next to "Project Overview"
- Select **"Project settings"**

### 4️⃣ Register a Web App (if not done)
- Scroll down to **"Your apps"** section
- If you don't see a web app, click **"</> Web"** button
- Give it a name (e.g., "Admin Client")
- Click **"Register app"**

### 5️⃣ Copy the Configuration
You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 6️⃣ Update Your .env.local File

Open `admin-client/.env.local` and replace the placeholder values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 7️⃣ Enable Email/Password Authentication
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get Started"** (if not enabled)
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** it
6. Click **"Save"**

### 8️⃣ Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd admin-client
npm run dev
```

## ✅ Verification

After updating `.env.local` and restarting:

1. The error should be gone
2. You should see the login page
3. Check browser console - no Firebase errors

## 🐛 Still Getting Errors?

### Error: "Firebase: Error (auth/invalid-api-key)"
- ✅ Double-check the API key is copied correctly (no extra spaces)
- ✅ Make sure the file is named `.env.local` (not `.env.local.txt`)
- ✅ Restart the dev server after changing `.env.local`

### Error: "Firebase: Error (auth/api-key-not-valid-please-pass-a-valid-api-key)"
- ✅ The API key might be restricted. Go to Firebase Console → Project Settings → General
- ✅ Check "API restrictions" and make sure localhost is allowed

### Can't Find the Config?
- Firebase Console → Project Settings (⚙️ gear icon)
- Scroll down to "Your apps"
- If no web app exists, click "</> Add app" → Web
- The config will appear after registration

---

## 📸 Visual Guide

### Where to Find Settings:
```
Firebase Console
└── Your Project
    └── ⚙️ Project Settings (top left, next to Project Overview)
        └── Scroll down to "Your apps"
            └── SDK setup and configuration
                └── Config (copy these values)
```

### Where to Enable Authentication:
```
Firebase Console
└── Your Project
    └── 🔐 Authentication (left sidebar)
        └── Sign-in method
            └── Email/Password → Enable
```

---

**Need Help?** Check the browser console for detailed error messages!

