/**
 * Script to List All Firebase Users
 * 
 * Usage:
 *   node scripts/listUsers.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../bin/main/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listUsers() {
  try {
    console.log('\n📋 Fetching Firebase users...\n');
    
    const listUsersResult = await admin.auth().listUsers(100);
    
    if (listUsersResult.users.length === 0) {
      console.log('No users found in Firebase.\n');
      return;
    }
    
    console.log(`Found ${listUsersResult.users.length} users:\n`);
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Email                           │ UID              │ Admin  │ Created        │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    
    for (const user of listUsersResult.users) {
      const email = (user.email || 'N/A').padEnd(30);
      const uid = user.uid.substring(0, 16).padEnd(16);
      const isAdmin = user.customClaims?.admin === true ? '✅ Yes' : '❌ No ';
      const created = new Date(user.metadata.creationTime).toLocaleDateString();
      
      console.log(`│ ${email} │ ${uid} │ ${isAdmin} │ ${created.padEnd(14)} │`);
    }
    
    console.log('└─────────────────────────────────────────────────────────────────────────────┘\n');
    
    // Show admin users
    const adminUsers = listUsersResult.users.filter(u => u.customClaims?.admin === true);
    if (adminUsers.length > 0) {
      console.log(`\n👑 Admin Users (${adminUsers.length}):`);
      adminUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.uid})`);
      });
    } else {
      console.log('\n⚠️  No admin users found! Use setAdminClaims.js to create one.');
    }
    
    console.log('\n💡 To set admin claims: node scripts/setAdminClaims.js <email>\n');
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

listUsers();

