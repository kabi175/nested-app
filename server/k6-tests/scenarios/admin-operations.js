/**
 * Admin Operations Scenario Test
 * Nested App - Investment Platform
 * 
 * This test covers admin-only operations:
 * 1. User management
 * 2. Funds management
 * 3. Baskets management
 * 4. Education records management
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, post, patch, del, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { 
  generateBasketData,
  generateEducationData 
} from '../lib/data-generators.js';
import { getAdminToken } from '../lib/auth-helper.js';

// Custom metrics
const adminOpsDuration = new Trend('admin_ops_duration');
const adminOpsSuccess = new Rate('admin_ops_success');
const adminOpsErrors = new Counter('admin_ops_errors');

export const options = {
  scenarios: {
    admin_operations: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
    },
  },
  thresholds: {
    'admin_ops_duration': ['p(95)<1000'],
    'admin_ops_success': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function() {
  const token = getAdminToken();
  if (!token) {
    console.error('No admin token available');
    adminOpsSuccess.add(false);
    return;
  }
  
  let opsSuccess = true;
  
  // Test 1: List all users (admin only)
  group('Admin: List All Users', () => {
    const startTime = Date.now();
    const response = get(endpoints.users.all, token, { scenario: 'admin_users_list' });
    adminOpsDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'admin users list status is 200': (r) => r.status === 200,
    });
    
    if (!success) {
      adminOpsErrors.add(1);
      opsSuccess = false;
    }
  });
  
  sleep(0.5);
  
  // Test 2: List active users
  group('Admin: List Active Users', () => {
    const response = get(endpoints.users.active, token, { scenario: 'admin_active_users' });
    
    check(response, {
      'active users list status is 200 or 204': (r) => r.status === 200 || r.status === 204,
    });
  });
  
  sleep(0.5);
  
  // Test 3: List all funds
  group('Admin: List All Funds', () => {
    const startTime = Date.now();
    const response = get(endpoints.funds.list, token, { scenario: 'admin_funds_list' });
    adminOpsDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'funds list status is 200': (r) => r.status === 200,
    });
    
    if (success) {
      const data = checkAndParse(response, 200, 'Funds list');
      if (data && data.data && data.data.length > 0) {
        // Test fund label update
        const fund = data.data[0];
        const updateResponse = patch(
          endpoints.funds.updateLabel(fund.id),
          { label: `Load Test Label ${Date.now()}` },
          token,
          { scenario: 'admin_fund_update' }
        );
        
        check(updateResponse, {
          'fund label update status is 200': (r) => r.status === 200,
        });
      }
    }
  });
  
  sleep(0.5);
  
  // Test 4: List active funds
  group('Admin: List Active Funds', () => {
    const response = get(endpoints.funds.active, token, { scenario: 'admin_active_funds' });
    
    check(response, {
      'active funds list status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.5);
  
  // Test 5: List all baskets
  let existingBaskets = [];
  group('Admin: List All Baskets', () => {
    const startTime = Date.now();
    const response = get(endpoints.baskets.list, token, { scenario: 'admin_baskets_list' });
    adminOpsDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'baskets list status is 200': (r) => r.status === 200,
    });
    
    if (success) {
      const data = checkAndParse(response, 200, 'Baskets list');
      if (data && data.data) {
        existingBaskets = data.data;
      }
    }
  });
  
  sleep(0.5);
  
  // Test 6: View basket details
  if (existingBaskets.length > 0) {
    group('Admin: View Basket Details', () => {
      const basket = existingBaskets[0];
      const response = get(endpoints.baskets.byId(basket.id), token, { scenario: 'admin_basket_detail' });
      
      check(response, {
        'basket detail status is 200': (r) => r.status === 200,
      });
    });
  }
  
  sleep(0.5);
  
  // Test 7: List education records
  let existingEducation = [];
  group('Admin: List Education Records', () => {
    const startTime = Date.now();
    const response = get(endpoints.education.list, token, { scenario: 'admin_education_list' });
    adminOpsDuration.add(Date.now() - startTime);
    
    check(response, {
      'education list status is 200': (r) => r.status === 200,
    });
    
    if (response.status === 200) {
      const data = checkAndParse(response, 200, 'Education list');
      if (data && data.data) {
        existingEducation = data.data;
      }
    }
  });
  
  sleep(0.5);
  
  // Test 8: Filter education by type
  group('Admin: Filter Education by Type', () => {
    const response = get(endpoints.education.byType('INSTITUTION'), token, { scenario: 'admin_education_filter' });
    
    check(response, {
      'education filter status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.5);
  
  // Test 9: Search education
  group('Admin: Search Education', () => {
    const response = get(endpoints.education.search('MIT'), token, { scenario: 'admin_education_search' });
    
    check(response, {
      'education search status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.5);
  
  // Test 10: View education details
  if (existingEducation.length > 0) {
    group('Admin: View Education Details', () => {
      const education = existingEducation[0];
      const response = get(endpoints.education.byId(education.id), token, { scenario: 'admin_education_detail' });
      
      check(response, {
        'education detail status is 200': (r) => r.status === 200,
      });
    });
  }
  
  adminOpsSuccess.add(opsSuccess);
  
  // Think time between iterations
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      test: 'Admin Operations',
      timestamp: new Date().toISOString(),
      metrics: {
        vus: data.metrics.vus?.values?.value || 0,
        iterations: data.metrics.iterations?.values?.count || 0,
        http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
        admin_ops_success: data.metrics.admin_ops_success?.values?.rate || 0,
        admin_ops_errors: data.metrics.admin_ops_errors?.values?.count || 0,
      },
    }, null, 2),
    './results/admin-operations-summary.json': JSON.stringify(data, null, 2),
  };
}
