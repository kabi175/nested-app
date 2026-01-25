/**
 * User Registration and Onboarding Journey Test
 * Nested App - Investment Platform
 * 
 * This test simulates the complete user registration flow:
 * 1. User profile fetch/creation
 * 2. Profile updates
 * 3. Child creation
 * 4. Bank account addition
 * 5. KYC initiation
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, patch, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { 
  generateUserData, 
  generateChildData, 
  generateBankAccountData,
  generateAddressData 
} from '../lib/data-generators.js';
import { getTestToken, UserContext } from '../lib/auth-helper.js';

// Custom metrics
const userFetchDuration = new Trend('user_fetch_duration');
const childCreateDuration = new Trend('child_create_duration');
const bankAddDuration = new Trend('bank_add_duration');
const kycInitDuration = new Trend('kyc_init_duration');
const journeySuccessRate = new Rate('journey_success_rate');
const apiErrors = new Counter('api_errors');

export const options = {
  scenarios: {
    user_registration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'user_fetch_duration': ['p(95)<500'],
    'child_create_duration': ['p(95)<500'],
    'bank_add_duration': ['p(95)<1000'],
    'kyc_init_duration': ['p(95)<2000'],
    'journey_success_rate': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function() {
  const token = getTestToken();
  if (!token) {
    console.error('No auth token available');
    journeySuccessRate.add(false);
    return;
  }
  
  const ctx = new UserContext(token);
  let journeySuccess = true;
  
  // Step 1: Fetch current user
  group('Step 1: Fetch User Profile', () => {
    const startTime = Date.now();
    const response = get(endpoints.users.current, token, { scenario: 'user_fetch' });
    userFetchDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'user fetch status is 200 or 204': (r) => r.status === 200 || r.status === 204,
    });
    
    if (!success) {
      apiErrors.add(1);
      journeySuccess = false;
      return;
    }
    
    if (response.status === 200) {
      const data = checkAndParse(response, 200, 'User fetch');
      if (data && data.data && data.data.length > 0) {
        ctx.setUserId(data.data[0].id);
      }
    }
  });
  
  sleep(0.5);
  
  // Step 2: Update user profile (if user exists)
  if (ctx.userId) {
    group('Step 2: Update User Profile', () => {
      const updateData = {
        address: generateAddressData(),
        occupation: 'SALARIED',
        income_slab: 'L5_TO_10L',
      };
      
      const response = patch(endpoints.users.byId(ctx.userId), updateData, token, { scenario: 'user_update' });
      
      const success = check(response, {
        'user update status is 200': (r) => r.status === 200,
      });
      
      if (!success) {
        apiErrors.add(1);
        // Non-critical, continue journey
      }
    });
    
    sleep(0.5);
  }
  
  // Step 3: Fetch/Create Children
  group('Step 3: Manage Children', () => {
    // First fetch existing children
    const fetchResponse = get(endpoints.children.list, token, { scenario: 'children_fetch' });
    
    if (fetchResponse.status === 200) {
      const data = checkAndParse(fetchResponse, 200, 'Children fetch');
      if (data && data.data) {
        data.data.forEach(child => ctx.addChild(child));
      }
    }
    
    // Create a new child if needed
    if (ctx.children.length < 2) {
      const startTime = Date.now();
      const childData = generateChildData();
      
      const createResponse = post(endpoints.children.create, { data: [childData] }, token, { scenario: 'child_create' });
      childCreateDuration.add(Date.now() - startTime);
      
      const success = check(createResponse, {
        'child create status is 201': (r) => r.status === 201,
      });
      
      if (success) {
        const data = checkAndParse(createResponse, 201, 'Child create');
        if (data && data.data) {
          data.data.forEach(child => ctx.addChild(child));
        }
      } else {
        apiErrors.add(1);
        // Non-critical if child already exists
      }
    }
  });
  
  sleep(0.5);
  
  // Step 4: Manage Bank Accounts
  if (ctx.userId) {
    group('Step 4: Manage Bank Accounts', () => {
      // Fetch existing bank accounts
      const fetchResponse = get(endpoints.users.banks(ctx.userId), token, { scenario: 'banks_fetch' });
      
      if (fetchResponse.status === 200) {
        const data = checkAndParse(fetchResponse, 200, 'Banks fetch');
        if (data && data.data) {
          data.data.forEach(bank => ctx.addBankAccount(bank));
        }
      }
      
      // Add bank account if none exists
      if (ctx.bankAccounts.length === 0) {
        const startTime = Date.now();
        const bankData = generateBankAccountData();
        
        const createResponse = post(
          endpoints.users.banks(ctx.userId), 
          bankData, 
          token, 
          { scenario: 'bank_create' }
        );
        bankAddDuration.add(Date.now() - startTime);
        
        const success = check(createResponse, {
          'bank create status is 201': (r) => r.status === 201,
        });
        
        if (success) {
          const data = checkAndParse(createResponse, 201, 'Bank create');
          if (data) {
            ctx.addBankAccount(data);
          }
        } else {
          apiErrors.add(1);
          journeySuccess = false;
        }
      }
    });
    
    sleep(0.5);
  }
  
  // Step 5: Initiate KYC (if not already completed)
  if (ctx.userId) {
    group('Step 5: KYC Initiation', () => {
      const startTime = Date.now();
      const response = post(
        endpoints.users.initKyc(ctx.userId), 
        {}, 
        token, 
        { scenario: 'kyc_init' }
      );
      kycInitDuration.add(Date.now() - startTime);
      
      // KYC might already be initiated, so 200 or 400 are acceptable
      const success = check(response, {
        'kyc init status is 200 or already initiated': (r) => r.status === 200 || r.status === 400 || r.status === 409,
      });
      
      if (!success && response.status >= 500) {
        apiErrors.add(1);
        journeySuccess = false;
      }
    });
  }
  
  // Step 6: Fetch pending activities
  if (ctx.userId) {
    group('Step 6: Check Pending Activities', () => {
      const response = get(endpoints.users.myPendingActivities, token, { scenario: 'pending_activities' });
      
      check(response, {
        'pending activities fetch status is 200': (r) => r.status === 200,
      });
    });
  }
  
  journeySuccessRate.add(journeySuccess);
  
  // Think time between iterations
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      test: 'User Registration Journey',
      timestamp: new Date().toISOString(),
      metrics: {
        vus: data.metrics.vus?.values?.value || 0,
        iterations: data.metrics.iterations?.values?.count || 0,
        http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
        journey_success_rate: data.metrics.journey_success_rate?.values?.rate || 0,
        api_errors: data.metrics.api_errors?.values?.count || 0,
      },
    }, null, 2),
    './results/user-registration-summary.json': JSON.stringify(data, null, 2),
  };
}
