/**
 * Soak Test Scenario
 * Nested App - Investment Platform
 * 
 * Extended duration test to find memory leaks and degradation over time
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate, Gauge } from 'k6/metrics';
import { get, post, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken, UserContext } from '../lib/auth-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const soakResponseTime = new Trend('soak_response_time');
const soakSuccessRate = new Rate('soak_success_rate');
const soakErrors = new Counter('soak_errors');

// Time-windowed metrics for degradation analysis
const window1Duration = new Trend('window_1_duration'); // First 30 min
const window2Duration = new Trend('window_2_duration'); // 30-60 min
const window3Duration = new Trend('window_3_duration'); // 60-90 min
const window4Duration = new Trend('window_4_duration'); // 90-120 min

export const options = {
  scenarios: {
    soak_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Ramp up
        { duration: '5m', target: 50 },
        
        // Sustained load for 2 hours
        { duration: '2h', target: 50 },
        
        // Ramp down
        { duration: '5m', target: 0 },
      ],
      gracefulRampDown: '2m',
    },
  },
  thresholds: {
    'soak_success_rate': ['rate>0.99'],
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Ensure no significant degradation over time
    'window_1_duration': ['p(95)<500'],
    'window_2_duration': ['p(95)<600'], // Allow 20% degradation
    'window_3_duration': ['p(95)<600'],
    'window_4_duration': ['p(95)<600'],
  },
};

// Track metrics over time windows
function getTimeWindow(startTime) {
  const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
  
  if (elapsed < 35) return 1; // First 30 min + ramp up
  if (elapsed < 65) return 2; // 30-60 min
  if (elapsed < 95) return 3; // 60-90 min
  if (elapsed < 125) return 4; // 90-120 min
  return 4; // Final window
}

// Realistic user behavior patterns
const USER_ACTIONS = [
  { name: 'view_portfolio', weight: 25, action: (token) => get(endpoints.portfolio.overall, token) },
  { name: 'view_goals', weight: 20, action: (token) => get(endpoints.goals.list, token) },
  { name: 'view_transactions', weight: 15, action: (token) => get(endpoints.transactions.list, token) },
  { name: 'view_baskets', weight: 15, action: (token) => get(endpoints.baskets.list, token) },
  { name: 'view_education', weight: 10, action: (token) => get(endpoints.education.list, token) },
  { name: 'view_children', weight: 8, action: (token) => get(endpoints.children.list, token) },
  { name: 'view_pending', weight: 4, action: (token) => get(endpoints.users.myPendingActivities, token) },
  { name: 'view_nominees', weight: 3, action: (token) => get(endpoints.nominees.list, token) },
];

function selectAction() {
  const total = USER_ACTIONS.reduce((sum, a) => sum + a.weight, 0);
  let random = Math.random() * total;
  
  for (const action of USER_ACTIONS) {
    random -= action.weight;
    if (random <= 0) return action;
  }
  
  return USER_ACTIONS[0];
}

export function setup() {
  console.log('Starting soak test - this will run for approximately 2 hours');
  return { startTime: Date.now() };
}

export default function(data) {
  const token = getTestToken();
  if (!token) {
    soakSuccessRate.add(false);
    return;
  }
  
  const timeWindow = getTimeWindow(data.startTime);
  const action = selectAction();
  
  group(`Soak W${timeWindow}: ${action.name}`, () => {
    const startTime = Date.now();
    const response = action.action(token);
    const duration = Date.now() - startTime;
    
    soakResponseTime.add(duration);
    
    // Track by time window
    switch (timeWindow) {
      case 1:
        window1Duration.add(duration);
        break;
      case 2:
        window2Duration.add(duration);
        break;
      case 3:
        window3Duration.add(duration);
        break;
      case 4:
        window4Duration.add(duration);
        break;
    }
    
    const success = check(response, {
      'response successful': (r) => r.status === 200 || r.status === 204,
      'response time acceptable': (r) => r.timings.duration < 2000,
    });
    
    if (!success) {
      soakErrors.add(1);
      console.error(`Soak test failure at window ${timeWindow}: ${action.name} - ${response.status} - ${duration}ms`);
    }
    
    soakSuccessRate.add(success);
  });
  
  // Realistic think time
  sleep(randomIntBetween(1, 5));
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.log(`Soak test completed after ${duration.toFixed(1)} minutes`);
}

export function handleSummary(data) {
  const summary = {
    test: 'Soak Test',
    timestamp: new Date().toISOString(),
    duration_minutes: (data.state?.testRunDurationMs || 0) / 1000 / 60,
    metrics: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      avg_requests_per_second: data.metrics.http_reqs?.values?.rate || 0,
      
      // Overall response times
      overall_avg: data.metrics.http_req_duration?.values?.avg || 0,
      overall_p50: data.metrics.http_req_duration?.values?.['p(50)'] || 0,
      overall_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
      overall_p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
      
      // Time window response times
      window_1_p95: data.metrics.window_1_duration?.values?.['p(95)'] || 0,
      window_2_p95: data.metrics.window_2_duration?.values?.['p(95)'] || 0,
      window_3_p95: data.metrics.window_3_duration?.values?.['p(95)'] || 0,
      window_4_p95: data.metrics.window_4_duration?.values?.['p(95)'] || 0,
      
      soak_success_rate: data.metrics.soak_success_rate?.values?.rate || 0,
      soak_errors: data.metrics.soak_errors?.values?.count || 0,
      failed_request_rate: data.metrics.http_req_failed?.values?.rate || 0,
    },
    analysis: {},
  };
  
  // Calculate degradation over time
  const w1 = summary.metrics.window_1_p95 || 100;
  const w2 = summary.metrics.window_2_p95 || 100;
  const w3 = summary.metrics.window_3_p95 || 100;
  const w4 = summary.metrics.window_4_p95 || 100;
  
  const maxDegradation = Math.max(
    ((w2 - w1) / w1 * 100),
    ((w3 - w1) / w1 * 100),
    ((w4 - w1) / w1 * 100)
  );
  
  summary.analysis.degradation_percent = maxDegradation.toFixed(1) + '%';
  summary.analysis.degradation_trend = [
    `W1: ${w1.toFixed(0)}ms`,
    `W2: ${w2.toFixed(0)}ms (${((w2 - w1) / w1 * 100).toFixed(1)}%)`,
    `W3: ${w3.toFixed(0)}ms (${((w3 - w1) / w1 * 100).toFixed(1)}%)`,
    `W4: ${w4.toFixed(0)}ms (${((w4 - w1) / w1 * 100).toFixed(1)}%)`,
  ];
  
  // Determine if there's a memory leak or degradation
  if (maxDegradation < 10) {
    summary.analysis.stability = 'Excellent - No degradation detected';
    summary.analysis.memory_leak_likely = false;
  } else if (maxDegradation < 20) {
    summary.analysis.stability = 'Good - Minor degradation acceptable';
    summary.analysis.memory_leak_likely = false;
  } else if (maxDegradation < 50) {
    summary.analysis.stability = 'Fair - Moderate degradation detected';
    summary.analysis.memory_leak_likely = 'Possible';
  } else {
    summary.analysis.stability = 'Poor - Significant degradation detected';
    summary.analysis.memory_leak_likely = true;
  }
  
  // Check if degradation is consistent (potential leak) vs spikes
  const isMonotonic = w1 <= w2 && w2 <= w3 && w3 <= w4;
  if (isMonotonic && maxDegradation > 20) {
    summary.analysis.pattern = 'Monotonic increase - possible resource leak';
  } else if (maxDegradation > 20) {
    summary.analysis.pattern = 'Variable degradation - possible GC or external factors';
  } else {
    summary.analysis.pattern = 'Stable performance';
  }
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    './results/soak-test-summary.json': JSON.stringify(data, null, 2),
  };
}
