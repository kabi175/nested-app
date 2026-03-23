/**
 * Stress Test Scenario
 * Nested App - Investment Platform
 * 
 * This test pushes the system beyond normal capacity to find breaking points
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken } from '../lib/auth-helper.js';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const stressOpsDuration = new Trend('stress_ops_duration');
const stressSuccessRate = new Rate('stress_success_rate');
const stressErrors = new Counter('stress_errors');
const recoveryTime = new Trend('recovery_time');

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Warm up
        { duration: '2m', target: 50 },
        
        // Push to normal load
        { duration: '3m', target: 100 },
        
        // Push beyond normal
        { duration: '3m', target: 200 },
        
        // Push to stress level
        { duration: '3m', target: 300 },
        
        // Maximum stress
        { duration: '3m', target: 400 },
        
        // Recovery phase
        { duration: '2m', target: 100 },
        
        // Cool down
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // Relaxed thresholds for stress testing
    'stress_ops_duration': ['p(95)<2000', 'p(99)<5000'],
    'stress_success_rate': ['rate>0.80'], // Allow up to 20% failure under stress
    'http_req_failed': ['rate<0.20'],
    'http_req_duration': ['p(95)<3000'],
  },
};

// Critical endpoints to test under stress
const STRESS_ENDPOINTS = [
  { name: 'portfolio', endpoint: endpoints.portfolio.overall, weight: 25 },
  { name: 'goals', endpoint: endpoints.goals.list, weight: 20 },
  { name: 'baskets', endpoint: endpoints.baskets.list, weight: 15 },
  { name: 'transactions', endpoint: endpoints.transactions.list, weight: 15 },
  { name: 'education', endpoint: endpoints.education.list, weight: 10 },
  { name: 'children', endpoint: endpoints.children.list, weight: 10 },
  { name: 'user', endpoint: endpoints.users.current, weight: 5 },
];

function selectEndpoint() {
  const total = STRESS_ENDPOINTS.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * total;
  
  for (const ep of STRESS_ENDPOINTS) {
    random -= ep.weight;
    if (random <= 0) return ep;
  }
  
  return STRESS_ENDPOINTS[0];
}

export default function() {
  const token = getTestToken();
  if (!token) {
    stressSuccessRate.add(false);
    return;
  }
  
  const selectedEndpoint = selectEndpoint();
  
  group(`Stress: ${selectedEndpoint.name}`, () => {
    const startTime = Date.now();
    const response = get(selectedEndpoint.endpoint, token, { 
      stress_endpoint: selectedEndpoint.name 
    });
    const duration = Date.now() - startTime;
    stressOpsDuration.add(duration);
    
    const success = check(response, {
      'response status acceptable': (r) => r.status < 500,
      'response time acceptable': (r) => r.timings.duration < 5000,
    });
    
    if (!success) {
      stressErrors.add(1);
      console.error(`Stress failure: ${selectedEndpoint.name} - ${response.status} - ${duration}ms`);
    }
    
    stressSuccessRate.add(success);
    
    // Track slow responses for recovery analysis
    if (duration > 2000) {
      console.warn(`Slow response: ${selectedEndpoint.name} - ${duration}ms`);
      recoveryTime.add(duration);
    }
  });
  
  // Minimal think time during stress
  sleep(Math.random() * 0.5);
}

export function handleSummary(data) {
  const summary = {
    test: 'Stress Test',
    timestamp: new Date().toISOString(),
    duration: data.state?.testRunDurationMs || 0,
    metrics: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      requests_per_second: data.metrics.http_reqs?.values?.rate || 0,
      http_req_duration_p50: data.metrics.http_req_duration?.values?.['p(50)'] || 0,
      http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
      http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
      stress_success_rate: data.metrics.stress_success_rate?.values?.rate || 0,
      stress_errors: data.metrics.stress_errors?.values?.count || 0,
      failed_request_rate: data.metrics.http_req_failed?.values?.rate || 0,
      max_vus: data.metrics.vus_max?.values?.value || 0,
    },
    analysis: {
      breaking_point_reached: (data.metrics.http_req_failed?.values?.rate || 0) > 0.10,
      recovery_needed: (data.metrics.recovery_time?.values?.count || 0) > 0,
      avg_recovery_time: data.metrics.recovery_time?.values?.avg || 0,
    },
  };
  
  // Determine system capacity
  if (summary.metrics.stress_success_rate >= 0.95) {
    summary.analysis.capacity = 'Excellent - System handles high load well';
  } else if (summary.metrics.stress_success_rate >= 0.90) {
    summary.analysis.capacity = 'Good - System handles load with minor issues';
  } else if (summary.metrics.stress_success_rate >= 0.80) {
    summary.analysis.capacity = 'Fair - System shows strain under heavy load';
  } else {
    summary.analysis.capacity = 'Poor - System struggles under load';
  }
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    './results/stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}
