# 🚀 Quick Guide: Create Admin User

## Method 1: Using Scripts (Recommended) ⚡

### **One-Time Setup:**
```bash
cd /Users/mohan/personal/freelance/nested-app/server
npm init -y
npm install firebase-admin
```

### **Create Admin User:**

#### Step 1: Create user in Firebase Console
```bash
# Open Firebase Console
open "https://console.firebase.google.com/project/nexted-9cdd5/authentication/users"

# Click "Add user"
# Email: admin@yourcompany.com
# Password: YourSecurePassword123!
```

#### Step 2: Set admin claims
```bash
cd /Users/mohan/personal/freelance/nested-app/server
node scripts/setAdminClaims.js admin@yourcompany.com
```

#### Step 3: Login to admin dashboard
```bash
# Go to http://localhost:3000/login
# Login with your new admin credentials
```

**That's it!** ✅

---

## Method 2: Using Backend API 🔧

### Create endpoint in your Spring Boot backend:

```java
// AdminController.java
@PostMapping("/api/v1/admin/create-super-admin")
public ResponseEntity<?> createSuperAdmin(
    @RequestParam String email,
    @RequestParam String password
) {
    try {
        // Create user in Firebase
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
            .setEmail(email)
            .setPassword(password)
            .setEmailVerified(true);
        
        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
        
        // Set admin claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("admin", true);
        claims.put("role", "ADMIN");
        FirebaseAuth.getInstance().setCustomUserClaims(userRecord.getUid(), claims);
        
        return ResponseEntity.ok(Map.of(
            "message", "Super admin created successfully",
            "uid", userRecord.getUid(),
            "email", userRecord.getEmail()
        ));
    } catch (FirebaseAuthException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", e.getMessage()));
    }
}
```

Then call it:
```bash
curl -X POST "http://localhost:8080/api/v1/admin/create-super-admin" \
  -d "email=admin@yourcompany.com" \
  -d "password=YourSecurePassword123!"
```

---

## Method 3: Firebase CLI 📱

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Create user (requires additional setup)
# Then set claims via script
```

---

## 📋 Quick Commands Cheat Sheet

```bash
# Setup (one-time)
cd /Users/mohan/personal/freelance/nested-app/server
npm init -y && npm install firebase-admin

# List all users
node scripts/listUsers.js

# Set admin by email
node scripts/setAdminClaims.js admin@example.com

# Set admin by UID
node scripts/setAdminClaims.js --uid abc123xyz789

# Open Firebase Console
open "https://console.firebase.google.com/project/nexted-9cdd5/authentication/users"
```

---

## ✅ Verify Admin Access

After creating admin user:

1. **Check in Firebase Console:**
   - Go to Authentication → Users
   - Click on the user
   - Should see custom claims: `{ "admin": true, "role": "ADMIN" }`

2. **Test Login:**
   - Go to http://localhost:3000/login
   - Login with admin credentials
   - Should be able to access dashboard

3. **Verify in Browser Console:**
   ```javascript
   // After login, check token claims:
   firebase.auth().currentUser.getIdTokenResult()
     .then(token => console.log(token.claims))
   ```
   Should show: `{ admin: true, role: "ADMIN" }`

---

## 🐛 Common Issues

### "User needs to log out and log back in"
- Custom claims are included in the auth token
- Existing tokens don't get updated automatically
- **Solution:** Logout and login again

### "Cannot find module 'firebase-admin'"
- **Solution:** Run `npm install firebase-admin` in server directory

### "Access denied" after setting admin claims
- Token not refreshed yet
- **Solution:** Force logout, clear cookies, login again

---

**Need Help?** Check `server/scripts/README.md` for detailed documentation!
