/**
 * Comprehensive Test Runner
 * Nested App - Investment Platform
 * 
 * This file runs all test scenarios in sequence
 * Usage: k6 run run-all-tests.js
 */

import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { get, post, checkAndParse } from './lib/http-client.js';
import { endpoints } from './config/environments.js';
import { getTestToken, getAdminToken } from './lib/auth-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Metrics for overall test
const overallSuccessRate = new Rate('overall_success_rate');
const overallDuration = new Trend('overall_duration');
const scenarioErrors = new Counter('scenario_errors');

export const options = {
  scenarios: {
    // Health check scenario
    health_check: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      startTime: '0s',
      exec: 'healthCheck',
      tags: { scenario: 'health_check' },
    },
    
    // User operations
    user_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      startTime: '15s',
      exec: 'userOperations',
      tags: { scenario: 'user_operations' },
    },
    
    // Investment operations
    investment_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
      ],
      startTime: '2m30s',
      exec: 'investmentOperations',
      tags: { scenario: 'investment_operations' },
    },
    
    // Portfolio viewing
    portfolio_viewing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 40 },
        { duration: '30s', target: 0 },
      ],
      startTime: '4m45s',
      exec: 'portfolioViewing',
      tags: { scenario: 'portfolio_viewing' },
    },
    
    // Admin operations (smaller scale)
    admin_operations: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      startTime: '7m',
      exec: 'adminOperations',
      tags: { scenario: 'admin_operations' },
    },
    
    // Mixed load test
    mixed_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      startTime: '8m30s',
      exec: 'mixedLoad',
      tags: { scenario: 'mixed_load' },
    },
  },
  thresholds: {
    'overall_success_rate': ['rate>0.95'],
    'overall_duration': ['p(95)<1000'],
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.05'],
  },
};

// Health Check
export function healthCheck() {
  group('Health Check', () => {
    const response = get(endpoints.health.actuator, null, { check: 'health' });
    
    const success = check(response, {
      'health check status is 200': (r) => r.status === 200,
    });
    
    overallSuccessRate.add(success);
    
    if (!success) {
      scenarioErrors.add(1);
      console.error('Health check failed - API might be down');
    }
  });
  
  sleep(1);
}

// User Operations
export function userOperations() {
  const token = getTestToken();
  if (!token) {
    overallSuccessRate.add(false);
    return;
  }
  
  const operations = [
    () => get(endpoints.users.current, token),
    () => get(endpoints.children.list, token),
    () => get(endpoints.nominees.list, token),
    () => get(endpoints.users.myPendingActivities, token),
  ];
  
  const operation = operations[randomIntBetween(0, operations.length - 1)];
  
  const startTime = Date.now();
  const response = operation();
  overallDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'user operation successful': (r) => r.status === 200 || r.status === 204,
  });
  
  overallSuccessRate.add(success);
  
  if (!success) {
    scenarioErrors.add(1);
  }
  
  sleep(randomIntBetween(0.5, 1.5));
}

// Investment Operations
export function investmentOperations() {
  const token = getTestToken();
  if (!token) {
    overallSuccessRate.add(false);
    return;
  }
  
  const operations = [
    () => get(endpoints.goals.list, token),
    () => get(endpoints.baskets.list, token),
    () => get(endpoints.education.list, token),
    () => get(endpoints.funds.active, token),
  ];
  
  const operation = operations[randomIntBetween(0, operations.length - 1)];
  
  const startTime = Date.now();
  const response = operation();
  overallDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'investment operation successful': (r) => r.status === 200,
  });
  
  overallSuccessRate.add(success);
  
  if (!success) {
    scenarioErrors.add(1);
  }
  
  sleep(randomIntBetween(0.5, 1));
}

// Portfolio Viewing
export function portfolioViewing() {
  const token = getTestToken();
  if (!token) {
    overallSuccessRate.add(false);
    return;
  }
  
  const operations = [
    () => get(endpoints.portfolio.overall, token),
    () => get(endpoints.transactions.list, token),
    () => get(endpoints.goals.list, token),
  ];
  
  const operation = operations[randomIntBetween(0, operations.length - 1)];
  
  const startTime = Date.now();
  const response = operation();
  overallDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'portfolio operation successful': (r) => r.status === 200,
  });
  
  overallSuccessRate.add(success);
  
  if (!success) {
    scenarioErrors.add(1);
  }
  
  sleep(randomIntBetween(0.3, 0.8));
}

// Admin Operations
export function adminOperations() {
  const token = getAdminToken();
  if (!token) {
    overallSuccessRate.add(false);
    return;
  }
  
  const operations = [
    () => get(endpoints.users.all, token),
    () => get(endpoints.funds.list, token),
    () => get(endpoints.baskets.list, token),
    () => get(endpoints.education.list, token),
  ];
  
  const operation = operations[randomIntBetween(0, operations.length - 1)];
  
  const startTime = Date.now();
  const response = operation();
  overallDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'admin operation successful': (r) => r.status === 200,
  });
  
  overallSuccessRate.add(success);
  
  if (!success) {
    scenarioErrors.add(1);
  }
  
  sleep(randomIntBetween(0.5, 1));
}

// Mixed Load
export function mixedLoad() {
  const token = getTestToken();
  if (!token) {
    overallSuccessRate.add(false);
    return;
  }
  
  const allOperations = [
    { weight: 25, fn: () => get(endpoints.portfolio.overall, token) },
    { weight: 20, fn: () => get(endpoints.goals.list, token) },
    { weight: 15, fn: () => get(endpoints.baskets.list, token) },
    { weight: 15, fn: () => get(endpoints.transactions.list, token) },
    { weight: 10, fn: () => get(endpoints.education.list, token) },
    { weight: 8, fn: () => get(endpoints.children.list, token) },
    { weight: 4, fn: () => get(endpoints.users.current, token) },
    { weight: 3, fn: () => get(endpoints.users.myPendingActivities, token) },
  ];
  
  const total = allOperations.reduce((sum, op) => sum + op.weight, 0);
  let random = Math.random() * total;
  let selectedOp = allOperations[0].fn;
  
  for (const op of allOperations) {
    random -= op.weight;
    if (random <= 0) {
      selectedOp = op.fn;
      break;
    }
  }
  
  const startTime = Date.now();
  const response = selectedOp();
  overallDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'mixed load operation successful': (r) => r.status === 200 || r.status === 204,
  });
  
  overallSuccessRate.add(success);
  
  if (!success) {
    scenarioErrors.add(1);
  }
  
  sleep(randomIntBetween(0.2, 0.6));
}

export function handleSummary(data) {
  const summary = {
    test: 'Comprehensive Load Test Suite',
    timestamp: new Date().toISOString(),
    duration_seconds: (data.state?.testRunDurationMs || 0) / 1000,
    
    overall_metrics: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      requests_per_second: data.metrics.http_reqs?.values?.rate || 0,
      http_req_duration_avg: data.metrics.http_req_duration?.values?.avg || 0,
      http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
      http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
      overall_success_rate: data.metrics.overall_success_rate?.values?.rate || 0,
      scenario_errors: data.metrics.scenario_errors?.values?.count || 0,
      failed_request_rate: data.metrics.http_req_failed?.values?.rate || 0,
    },
    
    scenarios: {
      health_check: 'Completed',
      user_operations: 'Completed',
      investment_operations: 'Completed',
      portfolio_viewing: 'Completed',
      admin_operations: 'Completed',
      mixed_load: 'Completed',
    },
    
    verdict: '',
  };
  
  // Determine overall verdict
  if (summary.overall_metrics.overall_success_rate >= 0.99 && 
      summary.overall_metrics.http_req_duration_p95 < 300) {
    summary.verdict = 'EXCELLENT - All tests passed with outstanding performance';
  } else if (summary.overall_metrics.overall_success_rate >= 0.95 && 
             summary.overall_metrics.http_req_duration_p95 < 500) {
    summary.verdict = 'PASSED - All tests passed within acceptable thresholds';
  } else if (summary.overall_metrics.overall_success_rate >= 0.90) {
    summary.verdict = 'WARNING - Some performance issues detected';
  } else {
    summary.verdict = 'FAILED - Performance does not meet requirements';
  }
  
  console.log('\n========================================');
  console.log('  NESTED APP - LOAD TEST RESULTS');
  console.log('========================================\n');
  console.log(JSON.stringify(summary, null, 2));
  console.log('\n========================================\n');
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    './results/comprehensive-test-summary.json': JSON.stringify(data, null, 2),
  };
}
