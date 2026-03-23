/**
 * Spike Test Scenario
 * Nested App - Investment Platform
 * 
 * This test simulates sudden traffic spikes to test system resilience
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken, UserContext } from '../lib/auth-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const spikeResponseTime = new Trend('spike_response_time');
const spikeSuccessRate = new Rate('spike_success_rate');
const spikeErrors = new Counter('spike_errors');
const preSpikeDuration = new Trend('pre_spike_duration');
const duringSpikeDuration = new Trend('during_spike_duration');
const postSpikeDuration = new Trend('post_spike_duration');

export const options = {
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Normal load baseline
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        
        // First spike
        { duration: '10s', target: 200 },
        { duration: '1m', target: 200 },
        
        // Return to normal
        { duration: '10s', target: 50 },
        { duration: '2m', target: 50 },
        
        // Second larger spike
        { duration: '10s', target: 400 },
        { duration: '1m', target: 400 },
        
        // Return to normal
        { duration: '10s', target: 50 },
        { duration: '2m', target: 50 },
        
        // Cool down
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    'spike_success_rate': ['rate>0.85'],
    'http_req_failed': ['rate<0.15'],
    'http_req_duration': ['p(95)<3000'],
    'pre_spike_duration': ['p(95)<500'],
    'post_spike_duration': ['p(95)<1000'], // Allow slower recovery
  },
};

// Track which phase we're in
let currentPhase = 'pre-spike';
let spikeStartTime = 0;

function determinePhase(startTime) {
  const elapsed = (Date.now() - startTime) / 1000;
  
  if (elapsed < 180) return 'pre-spike'; // 0-3 min
  if (elapsed < 250) return 'spike-1'; // 3-4.1 min
  if (elapsed < 370) return 'recovery-1'; // 4.1-6.1 min
  if (elapsed < 440) return 'spike-2'; // 6.1-7.3 min
  if (elapsed < 560) return 'recovery-2'; // 7.3-9.3 min
  return 'cooldown';
}

export function setup() {
  return { startTime: Date.now() };
}

export default function(data) {
  const token = getTestToken();
  if (!token) {
    spikeSuccessRate.add(false);
    return;
  }
  
  const phase = determinePhase(data.startTime);
  const ctx = new UserContext(token);
  
  // Mixed workload to simulate real traffic
  const operations = [
    { name: 'portfolio', fn: () => get(endpoints.portfolio.overall, token) },
    { name: 'goals', fn: () => get(endpoints.goals.list, token) },
    { name: 'baskets', fn: () => get(endpoints.baskets.list, token) },
    { name: 'education', fn: () => get(endpoints.education.list, token) },
    { name: 'transactions', fn: () => get(endpoints.transactions.list, token) },
  ];
  
  const operation = operations[randomIntBetween(0, operations.length - 1)];
  
  group(`Spike ${phase}: ${operation.name}`, () => {
    const startTime = Date.now();
    const response = operation.fn();
    const duration = Date.now() - startTime;
    
    spikeResponseTime.add(duration);
    
    // Track by phase
    switch (phase) {
      case 'pre-spike':
        preSpikeDuration.add(duration);
        break;
      case 'spike-1':
      case 'spike-2':
        duringSpikeDuration.add(duration);
        break;
      case 'recovery-1':
      case 'recovery-2':
      case 'cooldown':
        postSpikeDuration.add(duration);
        break;
    }
    
    const success = check(response, {
      'response successful': (r) => r.status === 200 || r.status === 204,
      'response time acceptable': (r) => r.timings.duration < 5000,
    });
    
    if (!success) {
      spikeErrors.add(1);
      console.error(`Spike test failure in ${phase}: ${operation.name} - ${response.status} - ${duration}ms`);
    }
    
    spikeSuccessRate.add(success);
  });
  
  // Simulate think time (shorter during spikes)
  const isSpike = phase.startsWith('spike');
  sleep(isSpike ? Math.random() * 0.2 : Math.random() * 0.5 + 0.2);
}

export function handleSummary(data) {
  const summary = {
    test: 'Spike Test',
    timestamp: new Date().toISOString(),
    duration: data.state?.testRunDurationMs || 0,
    metrics: {
      total_requests: data.metrics.http_reqs?.values?.count || 0,
      peak_requests_per_second: data.metrics.http_reqs?.values?.rate || 0,
      
      // Overall response times
      overall_p50: data.metrics.http_req_duration?.values?.['p(50)'] || 0,
      overall_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
      overall_p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
      
      // Phase-specific response times
      pre_spike_p95: data.metrics.pre_spike_duration?.values?.['p(95)'] || 0,
      during_spike_p95: data.metrics.during_spike_duration?.values?.['p(95)'] || 0,
      post_spike_p95: data.metrics.post_spike_duration?.values?.['p(95)'] || 0,
      
      spike_success_rate: data.metrics.spike_success_rate?.values?.rate || 0,
      spike_errors: data.metrics.spike_errors?.values?.count || 0,
      failed_request_rate: data.metrics.http_req_failed?.values?.rate || 0,
    },
    analysis: {},
  };
  
  // Calculate degradation during spike
  const preSpikeP95 = summary.metrics.pre_spike_p95 || 100;
  const duringSpikeP95 = summary.metrics.during_spike_p95 || 100;
  const postSpikeP95 = summary.metrics.post_spike_p95 || 100;
  
  summary.analysis.spike_degradation = ((duringSpikeP95 - preSpikeP95) / preSpikeP95 * 100).toFixed(1) + '%';
  summary.analysis.recovery_overhead = ((postSpikeP95 - preSpikeP95) / preSpikeP95 * 100).toFixed(1) + '%';
  
  // Determine resilience rating
  if (summary.metrics.spike_success_rate >= 0.95 && duringSpikeP95 < preSpikeP95 * 3) {
    summary.analysis.resilience = 'Excellent - System handles spikes gracefully';
  } else if (summary.metrics.spike_success_rate >= 0.90 && duringSpikeP95 < preSpikeP95 * 5) {
    summary.analysis.resilience = 'Good - System handles spikes with some degradation';
  } else if (summary.metrics.spike_success_rate >= 0.80) {
    summary.analysis.resilience = 'Fair - System struggles with spikes but recovers';
  } else {
    summary.analysis.resilience = 'Poor - System needs improvement for spike handling';
  }
  
  // Check recovery
  if (postSpikeP95 <= preSpikeP95 * 1.2) {
    summary.analysis.recovery = 'Excellent - Quick recovery to baseline';
  } else if (postSpikeP95 <= preSpikeP95 * 2) {
    summary.analysis.recovery = 'Good - Reasonable recovery time';
  } else {
    summary.analysis.recovery = 'Slow - System takes time to recover from spikes';
  }
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    './results/spike-test-summary.json': JSON.stringify(data, null, 2),
  };
}
