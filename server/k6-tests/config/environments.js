/**
 * Environment configurations for k6 load tests
 * Nested App - Investment Platform
 */

export const environments = {
  local: {
    baseUrl: 'http://localhost:8080',
    authUrl: 'http://localhost:8080',
  },
  production: {
    baseUrl: 'https://api.nested.money',
    authUrl: 'https://api.nested.money',
  },
};

// Default environment
export const ENV = __ENV.K6_ENV || 'local';
export const config = environments[ENV];

// Test configuration options
export const testConfig = {
  // Timeouts
  requestTimeout: '30s',
  
  // Thresholds for performance metrics
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'], // Less than 1% error rate
    http_reqs: ['rate>10'], // At least 10 requests per second
  },
  
  // Default VU and duration settings
  defaults: {
    vus: 10,
    duration: '30s',
  },
};

// API endpoints grouped by domain
export const endpoints = {
  // User Management
  users: {
    list: '/api/v1/users',
    current: '/api/v1/users?type=CURRENT_USER',
    all: '/api/v1/users?type=ALL',
    active: '/api/v1/users?type=ACTIVE',
    byId: (id) => `/api/v1/users/${id}`,
    createInvestor: (id) => `/api/v1/users/${id}/actions/create_investor`,
    initKyc: (id) => `/api/v1/users/${id}/actions/init_kyc`,
    aadhaarUpload: (id) => `/api/v1/users/${id}/actions/aadhaar_upload`,
    esignUpload: (id) => `/api/v1/users/${id}/actions/esign_upload`,
    banks: (id) => `/api/v1/users/${id}/banks`,
    bankById: (userId, bankId) => `/api/v1/users/${userId}/banks/${bankId}`,
    signature: (id) => `/api/v1/users/${id}/signature`,
    updateEmail: (id) => `/api/v1/users/${id}/actions/update_email`,
    pendingActivities: (id) => `/api/v1/users/${id}/pending-activities`,
    myPendingActivities: '/api/v1/users/me/pending-activities',
  },
  
  // Children
  children: {
    list: '/api/v1/children',
    create: '/api/v1/children',
    update: '/api/v1/children',
  },
  
  // Goals
  goals: {
    list: '/api/v1/goals',
    create: '/api/v1/goals',
    update: '/api/v1/goals',
    byId: (id) => `/api/v1/goals/${id}`,
    holdings: (id) => `/api/v1/goals/${id}/holdings`,
    orders: (id) => `/api/v1/goals/${id}/orders`,
    pendingOrders: (id) => `/api/v1/goals/${id}/orders/pending`,
  },
  
  // Funds
  funds: {
    list: '/api/v1/funds',
    active: '/api/v1/funds?activeOnly=true',
    byId: (id) => `/api/v1/funds/${id}`,
    updateLabel: (id) => `/api/v1/funds/${id}/label`,
  },
  
  // Baskets
  baskets: {
    list: '/api/v1/bucket',
    byId: (id) => `/api/v1/bucket/${id}`,
    byName: (name) => `/api/v1/bucket/name/${name}`,
    create: '/api/v1/bucket',
    update: '/api/v1/bucket',
    delete: '/api/v1/bucket',
  },
  
  // Orders
  orders: {
    create: '/api/v1/orders',
    allocation: '/api/v1/orders/allocation',
  },
  
  // Payments
  payments: {
    create: '/api/v1/payments',
    byId: (id) => `/api/v1/payments/${id}`,
    verify: (id) => `/api/v1/payments/${id}/actions/verify`,
    buyRedirectUrl: (id) => `/api/v1/payments/${id}/buy/actions/fetch_redirect_url`,
    sipRedirectUrl: (id) => `/api/v1/payments/${id}/sip/actions/fetch_redirect_url`,
  },
  
  // Portfolio
  portfolio: {
    overall: '/api/v1/portfolio/overall',
    goalById: (id) => `/api/v1/portfolio/goals/${id}`,
    goalTransactions: (id) => `/api/v1/portfolio/goals/${id}/transactions`,
    goalHoldings: (id) => `/api/v1/portfolio/goals/${id}/holdings`,
  },
  
  // Transactions
  transactions: {
    list: '/api/v1/transactions',
    withDateRange: (from, to) => `/api/v1/transactions?from_date=${from}&to_date=${to}`,
  },
  
  // Education
  education: {
    list: '/api/v1/education',
    byType: (type) => `/api/v1/education?type=${type}`,
    search: (search) => `/api/v1/education?search=${search}`,
    byId: (id) => `/api/v1/education/${id}`,
    create: '/api/v1/education',
    update: '/api/v1/education',
    delete: '/api/v1/education',
  },
  
  // Nominees
  nominees: {
    list: '/api/v1/users/nominees',
    byId: (id) => `/api/v1/users/nominees/${id}`,
    upsert: '/api/v1/users/nominees',
    optOut: '/api/v1/users/actions/nominee-opt-out',
  },
  
  // MFA
  mfa: {
    start: '/api/v1/auth/mfa/start',
    verify: '/api/v1/auth/mfa/verify',
  },
  
  // Admin
  admin: {
    createAdmin: '/api/v1/admin/create-admin',
    promote: (id) => `/api/v1/admin/promote/${id}`,
    demote: (id) => `/api/v1/admin/demote/${id}`,
  },
  
  // Health
  health: {
    actuator: '/actuator/health',
  },
};
