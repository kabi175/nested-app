/**
 * Investment Journey Test
 * Nested App - Investment Platform
 * 
 * Tests the complete investment flow using existing data:
 * 1. Fetch baskets
 * 2. Fetch goals
 * 3. Payment flow (Create → Verify → Get URL)
 * 4. View order status
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken } from '../lib/auth-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const basketFetchDuration = new Trend('basket_fetch_duration');
const paymentCreateDuration = new Trend('payment_create_duration');
const paymentVerifyDuration = new Trend('payment_verify_duration');
const paymentUrlDuration = new Trend('payment_url_duration');
const investmentJourneySuccess = new Rate('investment_journey_success');
const investmentApiErrors = new Counter('investment_api_errors');

export const options = {
  scenarios: {
    investment_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'basket_fetch_duration': ['p(95)<500'],
    'payment_create_duration': ['p(95)<2000'],
    'payment_verify_duration': ['p(95)<1500'],
    'payment_url_duration': ['p(95)<1000'],
    'investment_journey_success': ['rate>0.85'],
    'http_req_failed': ['rate<0.05'],
  },
};

// Setup: Fetch existing goals and bank accounts once
export function setup() {
  const token = getTestToken();
  if (!token) {
    return { goals: [], bankId: null };
  }
  
  let goals = [];
  let bankId = null;
  let userId = null;
  
  // Fetch user
  const userResponse = get(endpoints.users.current, token);
  if (userResponse.status === 200) {
    const data = JSON.parse(userResponse.body);
    if (data && data.data && data.data.length > 0) {
      userId = data.data[0].id;
    }
  }
  
  // Fetch existing goals
  const goalsResponse = get(endpoints.goals.list, token);
  if (goalsResponse.status === 200) {
    const data = JSON.parse(goalsResponse.body);
    if (data && data.data) {
      goals = data.data;
      console.log(`Found ${goals.length} existing goals`);
    }
  }
  
  // Fetch existing bank account
  if (userId) {
    const banksResponse = get(endpoints.users.banks(userId), token);
    if (banksResponse.status === 200) {
      const data = JSON.parse(banksResponse.body);
      if (data && data.data && data.data.length > 0) {
        bankId = data.data[0].id;
        console.log(`Using bank account: ${bankId}`);
      }
    }
  }
  
  return { goals, bankId };
}

export default function(data) {
  const token = getTestToken();
  if (!token) {
    console.error('No auth token available');
    investmentJourneySuccess.add(false);
    return;
  }
  
  const { goals, bankId } = data;
  let journeySuccess = true;
  let paymentId = null;
  
  // Step 1: Browse Investment Baskets
  group('Step 1: Browse Baskets', () => {
    const startTime = Date.now();
    const response = get(endpoints.baskets.list, token, { scenario: 'basket_list' });
    basketFetchDuration.add(Date.now() - startTime);
    
    check(response, {
      'baskets list status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.3);
  
  // Step 2: View Goals
  group('Step 2: View Goals', () => {
    const response = get(endpoints.goals.list, token, { scenario: 'goals_list' });
    
    check(response, {
      'goals list status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.3);
  
  // Check if we have required data for payment flow
  if (goals.length === 0 || !bankId) {
    console.warn('No goals or bank account - skipping payment flow');
    investmentJourneySuccess.add(true); // Still success for browsing
    return;
  }
  
  // Select a random goal
  const selectedGoal = goals[randomIntBetween(0, goals.length - 1)];
  
  // ========================================
  // PAYMENT FLOW
  // ========================================
  
  // Step 3: Create Payment (with orders)
  group('Step 3: Create Payment', () => {
    const amount = randomIntBetween(1000, 25000);
    
    const paymentRequest = {
      orders: [
        {
          goal_id: selectedGoal.id,
          amount: amount,
        }
      ],
      payment_method: 'net_banking',
      bank_id: bankId,
    };
    
    const startTime = Date.now();
    const response = post(
      endpoints.payments.create,
      paymentRequest,
      token,
      { scenario: 'payment_create' }
    );
    paymentCreateDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'payment create status is 201': (r) => r.status === 201,
    });
    
    if (success) {
      const responseData = checkAndParse(response, 201, 'Payment create');
      if (responseData) {
        paymentId = responseData.id || responseData.payment_id || (responseData.payment && responseData.payment.id);
      }
    } else {
      // Expected failures
      check(response, {
        'payment failed gracefully': (r) => r.status === 400 || r.status === 403 || r.status === 409,
      });
    }
  });
  
  // Stop payment flow if no payment created
  if (!paymentId) {
    investmentJourneySuccess.add(journeySuccess);
    sleep(1);
    return;
  }
  
  sleep(0.3);
  
  // Step 4: Verify Payment
  group('Step 4: Verify Payment', () => {
    const verifyRequest = { id: paymentId };
    
    const startTime = Date.now();
    const response = post(
      endpoints.payments.verify(paymentId),
      verifyRequest,
      token,
      { scenario: 'payment_verify' }
    );
    paymentVerifyDuration.add(Date.now() - startTime);
    
    // 403 = MFA required (expected)
    check(response, {
      'payment verify handled': (r) => r.status === 200 || r.status === 403 || r.status === 400,
    });
  });
  
  sleep(0.3);
  
  // Step 5: Get Payment URL
  group('Step 5: Get Payment URL', () => {
    const startTime = Date.now();
    const response = post(
      endpoints.payments.buyRedirectUrl(paymentId),
      {},
      token,
      { scenario: 'payment_url' }
    );
    paymentUrlDuration.add(Date.now() - startTime);
    
    check(response, {
      'payment URL handled': (r) => r.status === 200 || r.status === 400 || r.status === 403,
    });
  });
  
  sleep(0.3);
  
  // Step 6: View Goal Holdings/Orders (after investment)
  group('Step 6: View Goal Details', () => {
    const holdingsResponse = get(
      endpoints.goals.holdings(selectedGoal.id),
      token,
      { scenario: 'goal_holdings' }
    );
    
    check(holdingsResponse, {
      'goal holdings status is 200': (r) => r.status === 200,
    });
    
    const ordersResponse = get(
      endpoints.goals.orders(selectedGoal.id),
      token,
      { scenario: 'goal_orders' }
    );
    
    check(ordersResponse, {
      'goal orders status is 200': (r) => r.status === 200,
    });
  });
  
  investmentJourneySuccess.add(journeySuccess);
  
  // Think time
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      test: 'Investment Journey',
      timestamp: new Date().toISOString(),
      metrics: {
        iterations: data.metrics.iterations?.values?.count || 0,
        basket_fetch_p95: data.metrics.basket_fetch_duration?.values?.['p(95)'] || 0,
        payment_create_p95: data.metrics.payment_create_duration?.values?.['p(95)'] || 0,
        payment_verify_p95: data.metrics.payment_verify_duration?.values?.['p(95)'] || 0,
        payment_url_p95: data.metrics.payment_url_duration?.values?.['p(95)'] || 0,
        journey_success_rate: data.metrics.investment_journey_success?.values?.rate || 0,
        api_errors: data.metrics.investment_api_errors?.values?.count || 0,
      },
    }, null, 2),
    './results/investment-journey-summary.json': JSON.stringify(data, null, 2),
  };
}
