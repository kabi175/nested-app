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
