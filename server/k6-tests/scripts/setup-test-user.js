#!/usr/bin/env node

/**
 * Setup Complete Test User
 * Creates user profile, initiates KYC, adds child and nominee
 * 
 * Usage:
 *   node scripts/setup-test-user.js
 * 
 * Environment variables:
 *   BASE_URL - API base URL (default: http://localhost:8080)
 *   K6_AUTH_TOKEN - Authentication token (required)
 *   FIRST_NAME, LAST_NAME, EMAIL, etc. - Test data (optional)
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const AUTH_TOKEN = process.env.K6_AUTH_TOKEN;
const TEST_MODE = process.env.TEST_MODE === 'true';
const TEST_OTP = process.env.TEST_OTP || '000000';

// Test data with defaults
const testData = {
  firstName: process.env.FIRST_NAME || 'Rahul',
  lastName: process.env.LAST_NAME || 'Kumar',
  email: process.env.EMAIL || `testuser${Date.now()}@test.nested.money`,
  phoneNumber: process.env.PHONE_NUMBER || '9999999999',
  dateOfBirth: process.env.DATE_OF_BIRTH || '1990-01-15',
  gender: process.env.GENDER || 'MALE',
  panNumber: process.env.PAN_NUMBER || 'ABCDE1234F',
  occupation: process.env.OCCUPATION || 'SALARIED',
  incomeSlab: process.env.INCOME_SLAB || 'L5_TO_10L',
  maritalStatus: process.env.MARITAL_STATUS || 'MARRIED',
  address: {
    line1: process.env.ADDRESS_LINE1 || '123, Test Street',
    line2: process.env.ADDRESS_LINE2 || 'Block A',
    city: process.env.CITY || 'Mumbai',
    state: process.env.STATE || 'Maharashtra',
    pincode: process.env.PINCODE || '400001',
    country: process.env.COUNTRY || 'India',
  },
  child: {
    name: process.env.CHILD_NAME || 'Aarav',
    dateOfBirth: process.env.CHILD_DOB || '2015-06-20',
    gender: process.env.CHILD_GENDER || 'MALE',
  },
  nominee: {
    name: process.env.NOMINEE_NAME || 'Priya Kumar',
    relationship: process.env.NOMINEE_RELATIONSHIP || 'SPOUSE',
    dateOfBirth: process.env.NOMINEE_DOB || '1992-03-10',
    allocation: parseInt(process.env.NOMINEE_ALLOCATION || '100', 10),
  },
};

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsed,
            body: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            body: body,
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function getCurrentUser() {
  log('\n📱 Step 1: Fetching current user...', 'yellow');
  
  const response = await makeRequest(`${BASE_URL}/api/v1/users?type=CURRENT_USER`);
  
  if (response.status !== 200) {
    throw new Error(`Failed to get user: ${response.status} - ${response.body}`);
  }

  const userId = response.data?.data?.[0]?.id;
  if (!userId) {
    throw new Error('User ID not found in response');
  }

  log(`✅ User ID: ${userId}`, 'green');
  return userId;
}

async function updateUserProfile(userId) {
  log('\n📝 Step 2: Updating user profile with test data...', 'yellow');

  const payload = {
    first_name: testData.firstName,
    last_name: testData.lastName,
    email: testData.email,
    phone_number: `+91${testData.phoneNumber}`,
    date_of_birth: testData.dateOfBirth,
    gender: testData.gender,
    pan_number: testData.panNumber,
    occupation: testData.occupation,
    income_slab: testData.incomeSlab,
    marital_status: testData.maritalStatus,
    address: testData.address,
  };

  const response = await makeRequest(`${BASE_URL}/api/v1/users/${userId}`, 'PATCH', payload);

  if (response.status === 200 || response.status === 204) {
    log('✅ Profile updated', 'green');
  } else {
    log(`⚠️  Profile update may have failed (non-critical): ${response.status}`, 'yellow');
  }
}

async function initiateKYC(userId) {
  log('\n🔐 Step 3: Initiating KYC...', 'yellow');

  const response = await makeRequest(
    `${BASE_URL}/api/v1/users/${userId}/actions/init_kyc`,
    'POST'
  );

  if (response.status === 200 || response.status === 204) {
    log('✅ KYC initiated', 'green');
  } else {
    const errorMsg = response.data?.error || response.data?.message || 'Unknown error';
    if (response.status === 400 || response.status === 409) {
      log(`⚠️  KYC may already be initiated: ${errorMsg}`, 'yellow');
    } else {
      log(`⚠️  KYC initiation response: ${response.status} - ${errorMsg}`, 'yellow');
    }
  }
}

async function createInvestor(userId) {
  log('\n💼 Step 4: Creating investor profile...', 'yellow');

  const response = await makeRequest(
    `${BASE_URL}/api/v1/users/${userId}/actions/create_investor`,
    'POST'
  );

  if (response.status === 200 || response.status === 201 || response.status === 204) {
    log('✅ Investor created', 'green');
    return true;
  } else {
    const errorMsg = response.data?.error || response.data?.message || 'Unknown error';
    if (errorMsg.toLowerCase().includes('kyc') || errorMsg.toLowerCase().includes('not completed')) {
      log('⚠️  Investor creation skipped - KYC not completed yet', 'yellow');
      log('   Note: Complete KYC first, then run this script again', 'yellow');
    } else if (response.status === 409 || errorMsg.toLowerCase().includes('already')) {
      log('⚠️  Investor may already exist', 'yellow');
    } else {
      log(`⚠️  Investor creation failed: ${response.status} - ${errorMsg}`, 'yellow');
    }
    return false;
  }
}

async function addChild() {
  log('\n👶 Step 5: Adding child...', 'yellow');

  const payload = {
    data: [{
      name: testData.child.name,
      date_of_birth: testData.child.dateOfBirth,
      gender: testData.child.gender,
      relationship: 'CHILD',
    }],
  };

  const response = await makeRequest(`${BASE_URL}/api/v1/children`, 'POST', payload);

  if (response.status === 201 || response.status === 200) {
    const childId = response.data?.data?.[0]?.id;
    if (childId) {
      log(`✅ Child created: ${childId}`, 'green');
      return childId;
    }
  }

  const errorMsg = response.data?.error || response.data?.message || '';
  if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('duplicate')) {
    log('⚠️  Child may already exist', 'yellow');
  } else {
    log(`⚠️  Failed to create child: ${response.status} - ${errorMsg}`, 'yellow');
  }
  return null;
}

async function startMfaSession(action = 'NOMINEE_UPDATE') {
  log('  → Starting MFA session...', 'yellow');

  const payload = {
    action: action,
    channel: 'SMS',
  };

  const response = await makeRequest(`${BASE_URL}/api/v1/auth/mfa/start`, 'POST', payload);

  if (response.status === 200 || response.status === 201) {
    const sessionId = response.data?.mfaSessionId || response.data?.data?.mfaSessionId;
    if (sessionId) {
      log('  ✅ MFA session started', 'green');
      return sessionId;
    }
  }

  log(`  ❌ Failed to start MFA session: ${response.status}`, 'red');
  return null;
}

async function verifyMfaOtp(sessionId, otpCode) {
  log('  → Verifying OTP...', 'yellow');

  const payload = {
    mfaSessionId: sessionId,
    otp: otpCode,
  };

  const response = await makeRequest(`${BASE_URL}/api/v1/auth/mfa/verify`, 'POST', payload);

  if (response.status === 200 || response.status === 201) {
    const mfaToken = response.data?.mfaToken || response.data?.data?.mfaToken;
    if (mfaToken) {
      log('  ✅ MFA token obtained', 'green');
      return mfaToken;
    }
  }

  const errorMsg = response.data?.error || response.data?.message || 'Unknown error';
  log(`  ❌ Failed to verify OTP: ${errorMsg}`, 'red');
  return null;
}

async function addNominee() {
  log('\n👤 Step 6: Adding nominee (requires MFA)...', 'yellow');

  // Step 1: Start MFA session
  const sessionId = await startMfaSession('NOMINEE_UPDATE');
  if (!sessionId) {
    log('⚠️  Skipping nominee creation (MFA session failed)', 'yellow');
    return null;
  }

  // Step 2: Get OTP
  let otpCode;
  if (TEST_MODE) {
    otpCode = TEST_OTP;
    log(`  → Using test OTP: ${otpCode}`, 'yellow');
  } else {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    otpCode = await new Promise((resolve) => {
      rl.question('  → Enter the 6-digit OTP sent to your phone: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    if (!/^[0-9]{6}$/.test(otpCode)) {
      log('❌ Invalid OTP. Must be 6 digits.', 'red');
      return null;
    }
  }

  // Step 3: Verify OTP and get MFA token
  const mfaToken = await verifyMfaOtp(sessionId, otpCode);
  if (!mfaToken) {
    log('⚠️  Skipping nominee creation (MFA verification failed)', 'yellow');
    return null;
  }

  // Step 4: Add nominee with MFA token
  log('  → Creating nominee...', 'yellow');

  const payload = {
    data: [{
      name: testData.nominee.name,
      relationship: testData.nominee.relationship,
      date_of_birth: testData.nominee.dateOfBirth,
      allocation: testData.nominee.allocation,
      address: {
        address_line: testData.address.line1,
        city: testData.address.city,
        state: testData.address.state,
        pin_code: testData.address.pincode,
        country: 'in',
      },
    }],
  };

  // Make request with MFA token in header
  const urlObj = new URL(`${BASE_URL}/api/v1/users/nominees`);
  const isHttps = urlObj.protocol === 'https:';
  const client = require(isHttps ? 'https' : 'http');

  const response = await new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'X-MFA-Token': mfaToken,
        'Content-Type': 'application/json',
      },
    };

    const postData = JSON.stringify(payload);
    options.headers['Content-Length'] = Buffer.byteLength(postData);

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            body: body,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, body: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  if (response.status === 200 || response.status === 201) {
    const nomineeId = response.data?.data?.[0]?.id;
    if (nomineeId) {
      log(`✅ Nominee created: ${nomineeId}`, 'green');
      return nomineeId;
    }
  }

  const errorMsg = response.data?.error || response.data?.message || '';
  if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('duplicate')) {
    log('⚠️  Nominee may already exist', 'yellow');
  } else {
    log(`⚠️  Failed to create nominee: ${response.status} - ${errorMsg}`, 'yellow');
  }
  return null;
}

async function main() {
  // Validate token
  if (!AUTH_TOKEN) {
    log('❌ Missing K6_AUTH_TOKEN environment variable', 'red');
    log('\nUsage:', 'yellow');
    log('  export K6_AUTH_TOKEN="your-token-here"');
    log('  node scripts/setup-test-user.js');
    log('\nOr get token first:', 'yellow');
    log('  ./scripts/get-mobile-token.sh');
    log('  export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)');
    log('  node scripts/setup-test-user.js');
    process.exit(1);
  }

  log('🚀 Setting up test user...', 'blue');
  log(`Base URL: ${BASE_URL}`, 'blue');

  try {
    // Step 1: Get current user
    const userId = await getCurrentUser();

    // Step 2: Update profile
    await updateUserProfile(userId);

    // Step 3: Initiate KYC
    await initiateKYC(userId);

    // Step 4: Create investor (may fail if KYC not complete)
    await createInvestor(userId);

    // Step 5: Add child
    const childId = await addChild();

    // Step 6: Add nominee
    const nomineeId = await addNominee();

    // Summary
    log('\n════════════════════════════════════════════════', 'cyan');
    log('           Setup Summary', 'cyan');
    log('════════════════════════════════════════════════', 'cyan');
    log(`User ID: ${userId}`, 'blue');
    log(`Name: ${testData.firstName} ${testData.lastName}`, 'blue');
    log(`Email: ${testData.email}`, 'blue');
    log(`Phone: +91${testData.phoneNumber}`, 'blue');
    if (childId) {
      log(`Child: ${testData.child.name} (ID: ${childId})`, 'blue');
    }
    if (nomineeId) {
      log(`Nominee: ${testData.nominee.name} (ID: ${nomineeId})`, 'blue');
    }
    log('════════════════════════════════════════════════', 'cyan');

    // Save to file
    const fs = require('fs');
    if (!fs.existsSync('results')) {
      fs.mkdirSync('results', { recursive: true });
    }

    const userInfo = {
      user_id: userId,
      first_name: testData.firstName,
      last_name: testData.lastName,
      email: testData.email,
      phone_number: `+91${testData.phoneNumber}`,
      child_id: childId,
      nominee_id: nomineeId,
      setup_date: new Date().toISOString(),
    };

    fs.writeFileSync('results/test-user-info.json', JSON.stringify(userInfo, null, 2));
    log('\n💾 User info saved to: results/test-user-info.json', 'green');

    log('\n✅ Test user setup complete!', 'green');

    if (!nomineeId) {
      log('\nNote: Nominee creation requires MFA verification.', 'yellow');
      log('To add nominee, run with TEST_MODE=true and TEST_OTP if backend supports it:', 'yellow');
      log('  export TEST_MODE=true', 'cyan');
      log('  export TEST_OTP=000000', 'cyan');
      log('  node scripts/setup-test-user.js', 'cyan');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { getCurrentUser, updateUserProfile, initiateKYC, createInvestor, addChild, addNominee };
