/**
 * Portfolio Viewing Journey Test
 * Nested App - Investment Platform
 * 
 * This test simulates users viewing their portfolio:
 * 1. Fetch overall portfolio
 * 2. View individual goal portfolios
 * 3. View transactions
 * 4. View holdings
 */

import { sleep, check, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { get, checkAndParse } from '../lib/http-client.js';
import { endpoints } from '../config/environments.js';
import { getTestToken, UserContext } from '../lib/auth-helper.js';

// Custom metrics
const portfolioOverallDuration = new Trend('portfolio_overall_duration');
const portfolioGoalDuration = new Trend('portfolio_goal_duration');
const transactionsDuration = new Trend('transactions_duration');
const holdingsDuration = new Trend('holdings_duration');
const portfolioJourneySuccess = new Rate('portfolio_journey_success');
const portfolioApiErrors = new Counter('portfolio_api_errors');

export const options = {
  scenarios: {
    portfolio_viewing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    'portfolio_overall_duration': ['p(95)<500'],
    'portfolio_goal_duration': ['p(95)<500'],
    'transactions_duration': ['p(95)<500'],
    'holdings_duration': ['p(95)<500'],
    'portfolio_journey_success': ['rate>0.95'],
    'http_req_failed': ['rate<0.02'],
  },
};

export default function() {
  const token = getTestToken();
  if (!token) {
    console.error('No auth token available');
    portfolioJourneySuccess.add(false);
    return;
  }
  
  const ctx = new UserContext(token);
  let journeySuccess = true;
  
  // Step 1: Fetch overall portfolio
  group('Step 1: View Overall Portfolio', () => {
    const startTime = Date.now();
    const response = get(endpoints.portfolio.overall, token, { scenario: 'portfolio_overall' });
    portfolioOverallDuration.add(Date.now() - startTime);
    
    const success = check(response, {
      'portfolio overall status is 200': (r) => r.status === 200,
    });
    
    if (!success) {
      portfolioApiErrors.add(1);
      // Continue journey even if portfolio is empty
    }
  });
  
  sleep(0.5);
  
  // Step 2: Fetch goals
  group('Step 2: Fetch Goals List', () => {
    const response = get(endpoints.goals.list, token, { scenario: 'goals_list' });
    
    const success = check(response, {
      'goals list status is 200': (r) => r.status === 200,
    });
    
    if (success) {
      const data = checkAndParse(response, 200, 'Goals list');
      if (data && data.data) {
        data.data.forEach(goal => ctx.addGoal(goal));
      }
    }
  });
  
  sleep(0.5);
  
  // Step 3: View individual goal portfolios
  if (ctx.goals.length > 0) {
    group('Step 3: View Goal Portfolios', () => {
      // View up to 3 random goals
      const goalsToView = ctx.goals.slice(0, Math.min(3, ctx.goals.length));
      
      goalsToView.forEach((goal, index) => {
        const startTime = Date.now();
        const response = get(endpoints.portfolio.goalById(goal.id), token, { scenario: 'portfolio_goal' });
        portfolioGoalDuration.add(Date.now() - startTime);
        
        check(response, {
          [`goal ${index + 1} portfolio status is 200 or 404`]: (r) => r.status === 200 || r.status === 404,
        });
        
        sleep(0.2);
      });
    });
    
    sleep(0.5);
    
    // Step 4: View goal holdings
    group('Step 4: View Goal Holdings', () => {
      const goal = ctx.getRandomGoal();
      if (goal) {
        const startTime = Date.now();
        const response = get(endpoints.portfolio.goalHoldings(goal.id), token, { scenario: 'goal_holdings' });
        holdingsDuration.add(Date.now() - startTime);
        
        check(response, {
          'goal holdings status is 200': (r) => r.status === 200,
        });
      }
    });
    
    sleep(0.5);
    
    // Step 5: View goal transactions
    group('Step 5: View Goal Transactions', () => {
      const goal = ctx.getRandomGoal();
      if (goal) {
        const startTime = Date.now();
        const response = get(endpoints.portfolio.goalTransactions(goal.id), token, { scenario: 'goal_transactions' });
        transactionsDuration.add(Date.now() - startTime);
        
        check(response, {
          'goal transactions status is 200': (r) => r.status === 200,
        });
      }
    });
  }
  
  sleep(0.5);
  
  // Step 6: View all transactions
  group('Step 6: View All Transactions', () => {
    const startTime = Date.now();
    const response = get(endpoints.transactions.list, token, { scenario: 'transactions_list' });
    transactionsDuration.add(Date.now() - startTime);
    
    check(response, {
      'transactions list status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.5);
  
  // Step 7: View transactions with date filter
  group('Step 7: View Filtered Transactions', () => {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const fromDate = oneMonthAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    const response = get(
      endpoints.transactions.withDateRange(fromDate, toDate), 
      token, 
      { scenario: 'transactions_filtered' }
    );
    
    check(response, {
      'filtered transactions status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(0.5);
  
  // Step 8: Check pending activities
  group('Step 8: Check Pending Activities', () => {
    const response = get(endpoints.users.myPendingActivities, token, { scenario: 'pending_activities' });
    
    check(response, {
      'pending activities status is 200': (r) => r.status === 200,
    });
  });
  
  portfolioJourneySuccess.add(journeySuccess);
  
  // Think time between iterations
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      test: 'Portfolio Journey',
      timestamp: new Date().toISOString(),
      metrics: {
        vus: data.metrics.vus?.values?.value || 0,
        iterations: data.metrics.iterations?.values?.count || 0,
        http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
        journey_success_rate: data.metrics.portfolio_journey_success?.values?.rate || 0,
        api_errors: data.metrics.portfolio_api_errors?.values?.count || 0,
      },
    }, null, 2),
    './results/portfolio-journey-summary.json': JSON.stringify(data, null, 2),
  };
}
