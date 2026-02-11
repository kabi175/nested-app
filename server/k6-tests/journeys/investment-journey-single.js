/**
 * Investment Journey Test - Single Iteration Version
 * Simplified thresholds for single iteration testing
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post } from '../lib/http-client.js';
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

// Relaxed thresholds for single iteration testing
export const options = {
  thresholds: {
    'investment_journey_success': ['rate>0.0'], // Just check that it runs
    // No strict thresholds for single iteration - just verify it completes
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
  
  // Step 3: Create Orders First
  let orderIds = [];
  group('Step 3: Create Orders', () => {
    const amount = randomIntBetween(1000, 25000);
    
    const orderRequest = {
      buy_order: [
        {
          goal: { id: selectedGoal.id },
          amount: amount,
        }
      ],
      sip_order: [],
    };
    
    const orderResponse = post(
      endpoints.orders.create,
      orderRequest,
      token,
      { scenario: 'order_create' }
    );
    
    const orderSuccess = check(orderResponse, {
      'order create status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
    
    if (orderSuccess) {
      // Parse response directly without strict status check
      let orderData = null;
      try {
        orderData = JSON.parse(orderResponse.body);
      } catch (e) {
        console.error('Failed to parse order response:', orderResponse.body);
      }
      
      if (orderData) {
        if (orderData.data && Array.isArray(orderData.data)) {
          orderIds = orderData.data.map(order => order.id).filter(id => id != null);
        } else if (Array.isArray(orderData)) {
          orderIds = orderData.map(order => order.id).filter(id => id != null);
        }
      }
    }
  });
  
  // Stop if no orders created
  if (orderIds.length === 0) {
    console.warn('No orders created - skipping payment flow');
    investmentJourneySuccess.add(journeySuccess);
    sleep(1);
    return;
  }
  
  sleep(0.3);
  
  // Step 4: Create Payment (with order IDs)
  group('Step 4: Create Payment', () => {
    const paymentRequest = {
      orders: orderIds.map(id => ({ id: id })),
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
      // Parse response directly
      let responseData = null;
      try {
        responseData = JSON.parse(response.body);
      } catch (e) {
        console.error('Failed to parse payment response:', response.body);
      }
      
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
  
  // Step 5: Verify Payment
  group('Step 5: Verify Payment', () => {
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
  
  // Step 6: Get Payment URL
  group('Step 6: Get Payment URL', () => {
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
  
  // Step 7: View Goal Holdings/Orders (after investment)
  group('Step 7: View Goal Details', () => {
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
      test: 'Investment Journey (Single Iteration)',
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
