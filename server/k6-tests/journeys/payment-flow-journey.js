/**
 * Payment Flow Journey Test
 * Nested App - Investment Platform
 * 
 * Payment Flow (only):
 * 1. Create Payment (POST /payments) → Get Payment ID
 * 2. Verify Payment (POST /payments/{id}/actions/verify)
 * 3. Get Payment URL (POST /payments/{id}/buy/actions/fetch_redirect_url)
 * 4. Hit Payment URL (External gateway redirect)
 */

import { sleep, check, group } from 'k6';
import http from 'k6/http';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, checkAndParse, getMfaHeaders } from '../lib/http-client.js';
import { endpoints, config } from '../config/environments.js';
import { getTestToken } from '../lib/auth-helper.js';
import { getMfaToken } from '../lib/mfa-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const paymentCreateDuration = new Trend('payment_create_duration');
const paymentVerifyDuration = new Trend('payment_verify_duration');
const paymentUrlDuration = new Trend('payment_url_duration');
const paymentFlowSuccess = new Rate('payment_flow_success');
const paymentErrors = new Counter('payment_errors');

export const options = {
  scenarios: {
    payment_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 15 },
        { duration: '1m', target: 15 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'payment_create_duration': ['p(95)<2000'],
    'payment_verify_duration': ['p(95)<1500'],
    'payment_url_duration': ['p(95)<1000'],
    'payment_flow_success': ['rate>0.85'],
    'http_req_failed': ['rate<0.10'],
  },
};

export function setup() {
  const token = getTestToken();
  if (!token) {
    console.error('No auth token available');
    return { goalId: null, bankId: null };
  }
  
  let goalId = null;
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
  
  // Fetch existing goal
  const goalsResponse = get(endpoints.goals.list, token);
  if (goalsResponse.status === 200) {
    const data = JSON.parse(goalsResponse.body);
    if (data && data.data && data.data.length > 0) {
      goalId = data.data[0].id;
      console.log(`Using existing goal: ${goalId}`);
    }
  }
  
  // Fetch existing bank account
  if (userId) {
    const banksResponse = get(endpoints.users.banks(userId), token);
    if (banksResponse.status === 200) {
      const data = JSON.parse(banksResponse.body);
      if (data && data.data && data.data.length > 0) {
        bankId = data.data[0].id;
        console.log(`Using existing bank: ${bankId}`);
      }
    }
  }
  
  return { goalId, bankId };
}

export default function(data) {
  const token = getTestToken();
  if (!token) {
    paymentFlowSuccess.add(false);
    return;
  }
  
  const { goalId, bankId } = data;
  
  if (!goalId || !bankId) {
    console.warn('Missing goalId or bankId - skipping payment flow');
    paymentFlowSuccess.add(false);
    return;
  }
  
  let flowSuccess = true;
  let paymentId = null;
  
  // ========================================
  // Step 1: Create Payment (with orders)
  // POST /api/v1/payments
  // ========================================
  group('Step 1: Create Payment', () => {
    const amount = randomIntBetween(1000, 25000);
    
    const paymentRequest = {
      orders: [
        {
          goal_id: goalId,
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
      { step: 'payment_create' }
    );
    paymentCreateDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'payment create status is 201': (r) => r.status === 201,
    });
    
    if (success) {
      const responseData = checkAndParse(response, 201, 'Payment create');
      if (responseData) {
        paymentId = responseData.id || responseData.payment_id || (responseData.payment && responseData.payment.id);
        console.log(`Payment created: ${paymentId}`);
      }
    } else {
      // Expected failures (KYC not complete, etc.)
      check(response, {
        'payment failed gracefully': (r) => r.status === 400 || r.status === 403 || r.status === 409,
      });
      
      if (response.status >= 500) {
        paymentErrors.add(1);
        flowSuccess = false;
      }
    }
  });
  
  // Stop if no payment created
  if (!paymentId) {
    paymentFlowSuccess.add(flowSuccess);
    sleep(1);
    return;
  }
  
  sleep(0.3);
  
  // ========================================
  // Step 2: Verify Payment (with MFA handling)
  // POST /api/v1/payments/{payment_id}/actions/verify
  // ========================================
  group('Step 2: Verify Payment', () => {
    const verifyRequest = {
      id: paymentId,
    };
    
    const startTime = Date.now();
    let response = post(
      endpoints.payments.verify(paymentId),
      verifyRequest,
      token,
      { step: 'payment_verify' }
    );
    
    // If 403 (MFA required), handle MFA and retry with default test OTP (123456)
    if (response.status === 403) {
      const mfaToken = getMfaToken(token, 'MF_BUY', '123456');
      if (mfaToken) {
        // Retry with MFA token
        const headers = getMfaHeaders(token, mfaToken);
        const url = `${config.baseUrl}${endpoints.payments.verify(paymentId)}`;
        response = http.post(url, JSON.stringify(verifyRequest), {
          headers,
          tags: { name: endpoints.payments.verify(paymentId), step: 'payment_verify', mfa_retry: true },
        });
      }
    }
    
    paymentVerifyDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'payment verify status is 200': (r) => r.status === 200,
    });
    
    if (!success) {
      // Check for graceful failures
      check(response, {
        'payment verify failed gracefully': (r) => 
          r.status === 400 || r.status === 403,
      });
      
      if (response.status >= 500) {
        paymentErrors.add(1);
        flowSuccess = false;
      }
    }
  });
  
  sleep(0.3);
  
  // ========================================
  // Step 3: Get Payment URL
  // POST /api/v1/payments/{payment_id}/buy/actions/fetch_redirect_url
  // ========================================
  let paymentUrl = null;
  group('Step 3: Get Payment URL', () => {
    const startTime = Date.now();
    const response = post(
      endpoints.payments.buyRedirectUrl(paymentId),
      {},
      token,
      { step: 'payment_url' }
    );
    paymentUrlDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'payment URL fetch status is 200': (r) => r.status === 200,
    });
    
    if (success) {
      const responseData = checkAndParse(response, 200, 'Payment URL');
      paymentUrl = responseData?.redirect_url || responseData?.url || responseData?.payment_url;
      console.log(`Payment URL received: ${paymentUrl ? 'Yes' : 'No'}`);
    } else {
      check(response, {
        'payment URL failed gracefully': (r) => r.status === 400 || r.status === 403,
      });
      
      if (response.status >= 500) {
        paymentErrors.add(1);
        flowSuccess = false;
      }
    }
  });
  
  sleep(0.3);
  
  // ========================================
  // Step 4: Hit Payment URL (Simulated)
  // Redirect to external payment gateway
  // ========================================
  group('Step 4: Payment Gateway (Simulated)', () => {
    if (paymentUrl) {
      console.log(`Redirect URL ready: ${paymentUrl.substring(0, 50)}...`);
      check({ hasUrl: true }, {
        'payment redirect URL available': (obj) => obj.hasUrl === true,
      });
    }
  });
  
  paymentFlowSuccess.add(flowSuccess);
  
  // Think time
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  const summary = {
    test: 'Payment Flow',
    timestamp: new Date().toISOString(),
    flow: [
      '1. POST /api/v1/payments → payment_id',
      '2. POST /api/v1/payments/{id}/actions/verify',
      '3. POST /api/v1/payments/{id}/buy/actions/fetch_redirect_url → redirect_url',
      '4. Redirect to payment gateway',
    ],
    metrics: {
      iterations: data.metrics.iterations?.values?.count || 0,
      payment_create_p95: data.metrics.payment_create_duration?.values?.['p(95)'] || 0,
      payment_verify_p95: data.metrics.payment_verify_duration?.values?.['p(95)'] || 0,
      payment_url_p95: data.metrics.payment_url_duration?.values?.['p(95)'] || 0,
      flow_success_rate: data.metrics.payment_flow_success?.values?.rate || 0,
      errors: data.metrics.payment_errors?.values?.count || 0,
    },
  };
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    './results/payment-flow-summary.json': JSON.stringify(data, null, 2),
  };
}
