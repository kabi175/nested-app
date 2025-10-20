# Firebase Admin Scripts

These scripts help you manage Firebase users and set admin custom claims.

## 📦 Setup (One-time)

### Install Node.js Firebase Admin SDK

```bash
cd /Users/mohan/personal/freelance/nested-app/server
npm init -y
npm install firebase-admin
```

## 🚀 Usage

### 1. List All Users

See all Firebase users and their admin status:

```bash
cd /Users/mohan/personal/freelance/nested-app/server
node scripts/listUsers.js
```

**Output:**
```
📋 Fetching Firebase users...

Found 3 users:

┌─────────────────────────────────────────────────────────────────────────────┐
│ Email                           │ UID              │ Admin  │ Created        │
├─────────────────────────────────────────────────────────────────────────────┤
│ user@example.com                │ abc123def456     │ ❌ No  │ 10/19/2025     │
│ admin@example.com               │ xyz789abc123     │ ✅ Yes │ 10/19/2025     │
└─────────────────────────────────────────────────────────────────────────────┘

👑 Admin Users (1):
   - admin@example.com (xyz789abc123)
```

### 2. Set Admin Claims

Grant admin privileges to a user:

**By Email:**
```bash
node scripts/setAdminClaims.js admin@example.com
```

**By UID:**
```bash
node scripts/setAdminClaims.js --uid abc123def456
```

**Output:**
```
📧 Found user: admin@example.com
🆔 UID: abc123def456

✅ SUCCESS! Admin claims set for admin@example.com

📋 Custom Claims:
   - admin: true
   - role: ADMIN

⚠️  NOTE: User needs to log out and log back in for changes to take effect
```

## 📋 Step-by-Step: Create Your First Admin User

### **Step 1: Create User in Firebase Console**

1. Go to: https://console.firebase.google.com/project/nexted-9cdd5/authentication/users
2. Click **"Add user"**
3. Email: `admin@yourcompany.com`
4. Password: `YourSecurePassword123!`
5. Click **"Add user"**

### **Step 2: Install Dependencies (if not done)**

```bash
cd /Users/mohan/personal/freelance/nested-app/server
npm init -y
npm install firebase-admin
```

### **Step 3: Set Admin Claims**

```bash
node scripts/setAdminClaims.js admin@yourcompany.com
```

### **Step 4: Test Login**

1. Go to: http://localhost:3000/login
2. Login with: `admin@yourcompany.com` / `YourSecurePassword123!`
3. You should now have access to the admin dashboard!

## 🔧 Troubleshooting

### Error: "Cannot find module 'firebase-admin'"

**Solution:** Install the package
```bash
cd /Users/mohan/personal/freelance/nested-app/server
npm install firebase-admin
```

### Error: "User not found"

**Solution:** Make sure the user exists in Firebase Console first
- Go to: https://console.firebase.google.com/project/nexted-9cdd5/authentication/users
- Verify the email exists

### Error: "Cannot find module '../bin/main/serviceAccountKey.json'"

**Solution:** The serviceAccountKey.json file is missing
- Make sure it exists at: `server/bin/main/serviceAccountKey.json`
- This file should already be there from your backend setup

### User still can't access admin dashboard

**Causes:**
1. User hasn't logged out and back in after setting claims
2. Token hasn't been refreshed

**Solution:**
1. Logout from the admin dashboard
2. Login again
3. The new custom claims will be in the fresh token

## 📝 What These Scripts Do

### **setAdminClaims.js**
- Finds a user by email or UID
- Sets custom claims: `{ admin: true, role: 'ADMIN' }`
- These claims are checked by your backend and frontend
- Required for accessing the admin dashboard

### **listUsers.js**
- Shows all users in your Firebase project
- Displays their admin status
- Helps you see who has admin access

## 🔐 Security Notes

- ⚠️ Only run these scripts from a secure environment
- ⚠️ Never share your serviceAccountKey.json file
- ⚠️ The serviceAccountKey.json should be in .gitignore
- ✅ Custom claims are secure and verified by Firebase

## 📚 Additional Resources

- [Firebase Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)

---

**Created:** October 2025

