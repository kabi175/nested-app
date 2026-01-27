/**
 * Authentication helper for k6 load tests
 * Nested App - Investment Platform
 * 
 * Note: For load testing, you need to either:
 * 1. Use pre-generated tokens from a test user pool
 * 2. Use a mock authentication for load testing
 * 3. Generate tokens via Auth0 machine-to-machine flow
 */

import http from 'k6/http';
import { config } from '../config/environments.js';

// Test user pool - pre-generated tokens for load testing
// These should be generated before running load tests
const testUserPool = [
  // Add your test tokens here
  // { userId: '1', token: 'eyJ...', role: 'USER' },
  // { userId: '2', token: 'eyJ...', role: 'ADMIN' },
];

// Shared data between VUs
let currentUserIndex = 0;

/**
 * Get a test token for authenticated requests
 * In production load tests, you'd use a proper Auth0 M2M flow
 */
export function getTestToken() {
  // For development, use environment variable
  if (__ENV.K6_AUTH_TOKEN) {
    return __ENV.K6_AUTH_TOKEN;
  }
  
  // For load testing with user pool
  if (testUserPool.length > 0) {
    const user = testUserPool[currentUserIndex % testUserPool.length];
    currentUserIndex++;
    return user.token;
  }
  
  console.warn('No authentication token available. Set K6_AUTH_TOKEN env variable.');
  return null;
}

/**
 * Get admin token for admin operations
 */
export function getAdminToken() {
  if (__ENV.K6_ADMIN_TOKEN) {
    return __ENV.K6_ADMIN_TOKEN;
  }
  
  const adminUser = testUserPool.find(u => u.role === 'ADMIN');
  if (adminUser) {
    return adminUser.token;
  }
  
  console.warn('No admin token available. Set K6_ADMIN_TOKEN env variable.');
  return null;
}

/**
 * Get a unique user token (for scenarios requiring different users)
 */
export function getUniqueUserToken(vuId) {
  if (testUserPool.length > 0) {
    return testUserPool[vuId % testUserPool.length].token;
  }
  return getTestToken();
}

/**
 * Auth0 Machine-to-Machine token generation
 * Use this for programmatic token generation in CI/CD
 */
export function getM2MToken() {
  const auth0Domain = __ENV.AUTH0_DOMAIN;
  const clientId = __ENV.AUTH0_CLIENT_ID;
  const clientSecret = __ENV.AUTH0_CLIENT_SECRET;
  const audience = __ENV.AUTH0_AUDIENCE;
  
  if (!auth0Domain || !clientId || !clientSecret || !audience) {
    console.warn('Auth0 M2M credentials not configured');
    return null;
  }
  
  const response = http.post(
    `https://${auth0Domain}/oauth/token`,
    JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  
  if (response.status === 200) {
    const body = JSON.parse(response.body);
    return body.access_token;
  }
  
  console.error(`Failed to get M2M token: ${response.status} - ${response.body}`);
  return null;
}

/**
 * Get Mobile App Token via SMS OTP (Auth0 Passwordless)
 * 
 * Note: This requires either:
 * 1. Pre-generated tokens (recommended for load tests)
 * 2. Test OTP that works in test environment
 * 3. Manual OTP entry (not suitable for automated load tests)
 * 
 * For load testing, generate tokens beforehand using:
 *   ./scripts/get-mobile-token.sh
 * 
 * @param {string} phoneNumber - Full phone number with country code (e.g., +919999999999)
 * @param {string} testOtp - Test OTP code (if backend supports test mode)
 * @returns {string|null} Access token or null if failed
 */
export function getMobileToken(phoneNumber = null, testOtp = null) {
  // First, try to use pre-generated token from environment
  if (__ENV.K6_MOBILE_TOKEN) {
    return __ENV.K6_MOBILE_TOKEN;
  }
  
  // Use regular token if mobile token not specified
  if (__ENV.K6_AUTH_TOKEN) {
    return __ENV.K6_AUTH_TOKEN;
  }
  
  // If phone number and test OTP provided, try to get token
  if (phoneNumber && testOtp) {
    const auth0Domain = __ENV.AUTH0_DOMAIN || 'dev-yscagulfy0qamarm.us.auth0.com';
    const clientId = __ENV.AUTH0_CLIENT_ID;
    const audience = __ENV.AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;
    
    if (!clientId) {
      console.warn('AUTH0_CLIENT_ID not configured for mobile token generation');
      return null;
    }
    
    // Step 1: Request OTP (passwordless start)
    const startResponse = http.post(
      `https://${auth0Domain}/passwordless/start`,
      JSON.stringify({
        client_id: clientId,
        connection: 'sms',
        phone_number: phoneNumber,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    if (startResponse.status !== 200) {
      console.error(`Failed to request OTP: ${startResponse.status} - ${startResponse.body}`);
      return null;
    }
    
    // Step 2: Verify OTP and get token
    const tokenResponse = http.post(
      `https://${auth0Domain}/oauth/token`,
      JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: clientId,
        otp: testOtp,
        realm: 'sms',
        username: phoneNumber,
        audience: audience,
        scope: 'openid profile email phone offline_access',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    if (tokenResponse.status === 200) {
      const body = JSON.parse(tokenResponse.body);
      return body.access_token;
    }
    
    console.error(`Failed to verify OTP: ${tokenResponse.status} - ${tokenResponse.body}`);
    return null;
  }
  
  console.warn('No mobile token available. Generate tokens using: ./scripts/get-mobile-token.sh');
  return null;
}

/**
 * Create test user pool from file
 * Format: one token per line
 */
export function loadTestUserPool(filePath) {
  // In k6, you'd use SharedArray for this
  // import { SharedArray } from 'k6/data';
  // const users = new SharedArray('users', function() {
  //   return JSON.parse(open(filePath));
  // });
  console.log(`Loading test users from ${filePath}`);
}

/**
 * User context for tracking state across a VU's lifecycle
 */
export class UserContext {
  constructor(token) {
    this.token = token;
    this.userId = null;
    this.children = [];
    this.goals = [];
    this.bankAccounts = [];
  }
  
  setUserId(id) {
    this.userId = id;
  }
  
  addChild(child) {
    this.children.push(child);
  }
  
  addGoal(goal) {
    this.goals.push(goal);
  }
  
  addBankAccount(account) {
    this.bankAccounts.push(account);
  }
  
  getRandomChild() {
    if (this.children.length === 0) return null;
    return this.children[Math.floor(Math.random() * this.children.length)];
  }
  
  getRandomGoal() {
    if (this.goals.length === 0) return null;
    return this.goals[Math.floor(Math.random() * this.goals.length)];
  }
  
  getPrimaryBank() {
    return this.bankAccounts.find(b => b.is_primary) || this.bankAccounts[0];
  }
}
