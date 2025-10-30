/**
 * Script to Set Admin Custom Claims
 * 
 * Usage:
 *   node scripts/setAdminClaims.js <email>
 *   node scripts/setAdminClaims.js admin@example.com
 * 
 * Or with UID:
 *   node scripts/setAdminClaims.js --uid <uid>
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Get service account path from env or use default
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                           path.join(__dirname, '../serviceAccountKey.json');

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaims(identifier) {
  try {
    let user;
    
    // Check if identifier is a UID or email
    if (identifier.startsWith('--uid')) {
      const uid = process.argv[3];
      if (!uid) {
        throw new Error('Please provide a UID: node scripts/setAdminClaims.js --uid <uid>');
      }
      user = await admin.auth().getUser(uid);
    } else {
      // Assume it's an email
      user = await admin.auth().getUserByEmail(identifier);
    }
    
    console.log(`\n📧 Found user: ${user.email}`);
    console.log(`🆔 UID: ${user.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'ADMIN'
    });
    
    console.log(`\n✅ SUCCESS! Admin claims set for ${user.email}`);
    console.log(`\n📋 Custom Claims:`);
    console.log(`   - admin: true`);
    console.log(`   - role: ADMIN`);
    console.log(`\n⚠️  NOTE: User needs to log out and log back in for changes to take effect\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

// Get identifier from command line
const identifier = process.argv[2];

if (!identifier) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            Set Admin Custom Claims - Firebase              ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node scripts/setAdminClaims.js <email>
  node scripts/setAdminClaims.js admin@example.com

Or with UID:
  node scripts/setAdminClaims.js --uid <user-uid>

This script will:
  1. Find the user by email or UID
  2. Set custom claims: { admin: true, role: 'ADMIN' }
  3. Allow them to access the admin dashboard
`);
  process.exit(1);
}

setAdminClaims(identifier);

