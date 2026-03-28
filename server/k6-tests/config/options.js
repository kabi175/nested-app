/**
 * K6 test options for different scenarios
 * Nested App - Investment Platform
 */

import { testConfig } from './environments.js';

// Smoke Test - Quick sanity check
export const smokeTestOptions = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.05'],
  },
};

// Load Test - Normal expected load
export const loadTestOptions = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>50'],
  },
};

// Stress Test - Beyond normal capacity
export const stressTestOptions = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 300 },  // Stay at 300 users
    { duration: '5m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

// Spike Test - Sudden traffic spike
export const spikeTestOptions = {
  stages: [
    { duration: '10s', target: 100 },  // Fast spike to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '10s', target: 500 },  // Massive spike to 500 users
    { duration: '3m', target: 500 },   // Stay at 500 users
    { duration: '10s', target: 100 },  // Scale back to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.10'],
  },
};

// Soak Test - Extended duration testing
export const soakTestOptions = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '4h', target: 100 },   // Stay at 100 users for 4 hours
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

// Breakpoint Test - Find the system's breaking point
export const breakpointTestOptions = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 250 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 350 },
    { duration: '2m', target: 400 },
    { duration: '2m', target: 450 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.50'], // Allow up to 50% failure to find breaking point
  },
};

// API-specific test options
export const apiTestOptions = {
  // User API tests
  userApi: {
    vus: 20,
    duration: '2m',
    thresholds: {
      'http_req_duration{scenario:user_list}': ['p(95)<300'],
      'http_req_duration{scenario:user_update}': ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    },
  },
  
  // Goals API tests
  goalsApi: {
    vus: 30,
    duration: '2m',
    thresholds: {
      'http_req_duration{scenario:goals_list}': ['p(95)<300'],
      'http_req_duration{scenario:goals_create}': ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    },
  },
  
  // Payment API tests
  paymentApi: {
    vus: 20,
    duration: '2m',
    thresholds: {
      'http_req_duration{scenario:payment_create}': ['p(95)<1000'],
      http_req_failed: ['rate<0.01'],
    },
  },
  
  // Portfolio API tests
  portfolioApi: {
    vus: 50,
    duration: '2m',
    thresholds: {
      'http_req_duration{scenario:portfolio_overall}': ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    },
  },
};

// Get options based on test type
export function getTestOptions(testType) {
  const optionsMap = {
    smoke: smokeTestOptions,
    load: loadTestOptions,
    stress: stressTestOptions,
    spike: spikeTestOptions,
    soak: soakTestOptions,
    breakpoint: breakpointTestOptions,
  };
  
  return optionsMap[testType] || loadTestOptions;
}
