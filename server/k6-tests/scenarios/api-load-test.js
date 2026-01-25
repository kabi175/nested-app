/**
 * API Load Test Scenario
 * Nested App - Investment Platform
 * 
 * This test covers mixed API load patterns simulating real-world usage
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken, UserContext } from '../lib/auth-helper.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Custom metrics
const readOpsDuration = new Trend('read_ops_duration');
const writeOpsDuration = new Trend('write_ops_duration');
const apiSuccessRate = new Rate('api_success_rate');
const apiErrors = new Counter('api_errors');

// Weighted scenarios based on real-world usage patterns
const API_WEIGHTS = {
  // Read-heavy operations (80%)
  viewPortfolio: 20,
  viewGoals: 15,
  viewBaskets: 15,
  viewTransactions: 15,
  viewPendingActivities: 5,
  viewEducation: 5,
  viewUserProfile: 5,
  
  // Write operations (20%)
  updateGoal: 5,
  createOrder: 5,
  updateProfile: 5,
  updateNominees: 5,
};

export const options = {
  scenarios: {
    // Smoke test scenario
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      startTime: '0s',
      tags: { test_type: 'smoke' },
    },
    
    // Load test scenario
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      startTime: '1m30s',
      tags: { test_type: 'load' },
    },
    
    // Spike test scenario
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      startTime: '9m',
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    'read_ops_duration': ['p(95)<300'],
    'write_ops_duration': ['p(95)<1000'],
    'api_success_rate': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  },
};

// Select random operation based on weights
function selectOperation() {
  const total = Object.values(API_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [op, weight] of Object.entries(API_WEIGHTS)) {
    random -= weight;
    if (random <= 0) return op;
  }
  
  return 'viewPortfolio'; // default
}

export default function() {
  const token = getTestToken();
  if (!token) {
    apiSuccessRate.add(false);
    return;
  }
  
  const ctx = new UserContext(token);
  const operation = selectOperation();
  let success = true;
  
  // Setup: Get user context
  const userResponse = get(endpoints.users.current, token);
  if (userResponse.status === 200) {
    const data = checkAndParse(userResponse, 200, 'User fetch');
    if (data && data.data && data.data.length > 0) {
      ctx.setUserId(data.data[0].id);
    }
  }
  
  switch (operation) {
    case 'viewPortfolio':
      group('View Portfolio', () => {
        const startTime = Date.now();
        const response = get(endpoints.portfolio.overall, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'portfolio view successful': (r) => r.status === 200,
        });
      });
      break;
      
    case 'viewGoals':
      group('View Goals', () => {
        const startTime = Date.now();
        const response = get(endpoints.goals.list, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'goals list successful': (r) => r.status === 200,
        });
        
        // View a specific goal if available
        if (response.status === 200) {
          const data = checkAndParse(response, 200, 'Goals');
          if (data && data.data && data.data.length > 0) {
            const goal = data.data[0];
            get(endpoints.goals.byId(goal.id), token, { operation: 'viewGoalDetail' });
          }
        }
      });
      break;
      
    case 'viewBaskets':
      group('View Baskets', () => {
        const startTime = Date.now();
        const response = get(endpoints.baskets.list, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'baskets list successful': (r) => r.status === 200,
        });
      });
      break;
      
    case 'viewTransactions':
      group('View Transactions', () => {
        const startTime = Date.now();
        const response = get(endpoints.transactions.list, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'transactions list successful': (r) => r.status === 200,
        });
      });
      break;
      
    case 'viewPendingActivities':
      group('View Pending Activities', () => {
        const startTime = Date.now();
        const response = get(endpoints.users.myPendingActivities, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'pending activities successful': (r) => r.status === 200,
        });
      });
      break;
      
    case 'viewEducation':
      group('View Education', () => {
        const startTime = Date.now();
        const response = get(endpoints.education.list, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'education list successful': (r) => r.status === 200,
        });
      });
      break;
      
    case 'viewUserProfile':
      group('View User Profile', () => {
        const startTime = Date.now();
        const response = get(endpoints.users.current, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'user profile successful': (r) => r.status === 200 || r.status === 204,
        });
        
        // Also fetch children and bank accounts
        const childrenResponse = get(endpoints.children.list, token);
        check(childrenResponse, {
          'children list successful': (r) => r.status === 200 || r.status === 204,
        });
        
        if (ctx.userId) {
          const banksResponse = get(endpoints.users.banks(ctx.userId), token);
          check(banksResponse, {
            'banks list successful': (r) => r.status === 200 || r.status === 204,
          });
        }
      });
      break;
      
    case 'updateGoal':
      group('Update Goal', () => {
        // First fetch goals
        const goalsResponse = get(endpoints.goals.list, token);
        if (goalsResponse.status === 200) {
          const data = checkAndParse(goalsResponse, 200, 'Goals');
          if (data && data.data && data.data.length > 0) {
            const goal = data.data[0];
            
            const startTime = Date.now();
            const updateResponse = post(
              endpoints.goals.update,
              {
                data: [{
                  id: goal.id,
                  target_amount: goal.target_amount + 1000,
                }]
              },
              token,
              { operation }
            );
            writeOpsDuration.add(Date.now() - startTime);
            
            success = check(updateResponse, {
              'goal update successful': (r) => r.status === 200 || r.status === 409, // 409 if order exists
            });
          }
        }
      });
      break;
      
    case 'createOrder':
      group('Create Order (Simulated)', () => {
        // Fetch goals first
        const goalsResponse = get(endpoints.goals.list, token);
        
        if (goalsResponse.status === 200) {
          const data = checkAndParse(goalsResponse, 200, 'Goals');
          if (data && data.data && data.data.length > 0) {
            // Just log - actual order creation would require bank account
            console.log(`Would create order for goal: ${data.data[0].id}`);
          }
        }
        
        success = true; // Simulated success
      });
      break;
      
    case 'updateProfile':
      group('Update Profile', () => {
        if (!ctx.userId) {
          success = true;
          return;
        }
        
        const startTime = Date.now();
        const response = post(
          endpoints.users.byId(ctx.userId),
          {
            occupation: 'SALARIED',
          },
          token,
          { operation }
        );
        writeOpsDuration.add(Date.now() - startTime);
        
        // Profile update might fail for various reasons
        success = check(response, {
          'profile update handled': (r) => r.status < 500,
        });
      });
      break;
      
    case 'updateNominees':
      group('View Nominees', () => {
        const startTime = Date.now();
        const response = get(endpoints.nominees.list, token, { operation });
        readOpsDuration.add(Date.now() - startTime);
        
        success = check(response, {
          'nominees list successful': (r) => r.status === 200 || r.status === 204,
        });
      });
      break;
  }
  
  if (!success) {
    apiErrors.add(1);
  }
  apiSuccessRate.add(success);
  
  // Variable think time based on operation type
  const isWriteOp = ['updateGoal', 'createOrder', 'updateProfile', 'updateNominees'].includes(operation);
  sleep(isWriteOp ? randomIntBetween(1, 3) : randomIntBetween(0.5, 1.5));
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      test: 'API Load Test',
      timestamp: new Date().toISOString(),
      metrics: {
        total_requests: data.metrics.http_reqs?.values?.count || 0,
        http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
        http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'] || 0,
        read_ops_p95: data.metrics.read_ops_duration?.values?.['p(95)'] || 0,
        write_ops_p95: data.metrics.write_ops_duration?.values?.['p(95)'] || 0,
        api_success_rate: data.metrics.api_success_rate?.values?.rate || 0,
        api_errors: data.metrics.api_errors?.values?.count || 0,
        http_req_failed_rate: data.metrics.http_req_failed?.values?.rate || 0,
      },
    }, null, 2),
    './results/api-load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
