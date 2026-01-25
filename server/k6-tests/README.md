# Nested App - K6 Load Testing Suite

Comprehensive load testing suite for the Nested App investment platform. This suite tests all critical user journeys, API endpoints, and system performance under various load conditions.

---

## 📑 Table of Contents

- [Directory Structure](#-directory-structure)
- [Prerequisites](#-prerequisites)
- [Authentication Setup](#-authentication-setup)
- [Quick Start](#-quick-start)
- [Test Categories](#-test-categories)
- [Journey Tests (Detailed)](#-journey-tests-detailed)
- [Scenario Tests (Detailed)](#-scenario-tests-detailed)
- [API Endpoints Covered](#-api-endpoints-covered)
- [Running Tests](#-running-tests)
- [Performance Thresholds](#-performance-thresholds)
- [Configuration](#-configuration)
- [Results & Analysis](#-results--analysis)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

---

## 📁 Directory Structure

```
k6-tests/
├── config/
│   ├── environments.js       # Environment configs (local/staging/prod) & API endpoints
│   └── options.js            # Test configuration options (smoke, load, stress, spike, soak)
├── lib/
│   ├── auth-helper.js        # Authentication utilities (token management)
│   ├── data-generators.js    # Test data generation (users, children, banks, etc.)
│   └── http-client.js        # HTTP request utilities (GET, POST, PUT, PATCH, DELETE)
├── journeys/
│   ├── user-registration-journey.js   # Complete user onboarding flow
│   ├── investment-journey.js          # Investment creation and payment flow
│   ├── payment-flow-journey.js        # Payment-only flow (create → verify → redirect)
│   └── portfolio-journey.js           # Portfolio viewing and transactions
├── scenarios/
│   ├── admin-operations.js   # Admin-only API operations
│   ├── api-load-test.js      # Mixed API load with weighted operations
│   ├── stress-test.js        # Beyond-capacity stress testing (up to 400 VUs)
│   ├── spike-test.js         # Sudden traffic spike simulation
│   └── soak-test.js          # Extended 2-hour endurance testing
├── scripts/
│   └── get-token.sh          # Auth0 token generation script
├── results/                  # Test result JSON files (auto-generated)
├── run-all-tests.js          # Comprehensive test runner (all scenarios)
└── README.md                 # This file
```

---

## 🔧 Prerequisites

### 1. Install k6

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

### 2. Verify Installation

```bash
k6 version
# Expected: k6 v0.47.0 (or higher)
```

### 3. Create Results Directory

```bash
cd server/k6-tests
mkdir -p results
```

---

## 🔐 Authentication Setup

The load tests use **Auth0 Resource Owner Password Grant** - the same authentication method as the admin portal.

### Option 1: Using the Token Script (Recommended)

```bash
# Set Auth0 credentials
export AUTH0_DOMAIN="your-tenant.auth0.com"
export AUTH0_CLIENT_ID="your-client-id"
export AUTH0_CLIENT_SECRET="your-client-secret"
export AUTH0_AUDIENCE="https://api.nested.money"

# Set test user credentials
export TEST_EMAIL="testuser@example.com"
export TEST_PASSWORD="your-test-password"

# Generate token
./scripts/get-token.sh

# Output will show:
# ✅ Token obtained successfully!
# export K6_AUTH_TOKEN='eyJ...'

# Copy and run the export command
export K6_AUTH_TOKEN='eyJ...'
```

### Option 2: Manual Token Export

If you already have JWT tokens:

```bash
# User token (for regular user operations)
export K6_AUTH_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6..."

# Admin token (for admin operations)
export K6_ADMIN_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6..."
```

### Option 3: Auth0 M2M (For CI/CD)

For machine-to-machine authentication in CI/CD pipelines:

```bash
export AUTH0_DOMAIN="your-tenant.auth0.com"
export AUTH0_CLIENT_ID="m2m-client-id"
export AUTH0_CLIENT_SECRET="m2m-client-secret"
export AUTH0_AUDIENCE="https://api.nested.money"
```

### Authentication Flow Details

The `get-token.sh` script uses the exact same Auth0 flow as the admin portal:

```
POST https://{AUTH0_DOMAIN}/oauth/token
Content-Type: application/json

{
  "grant_type": "http://auth0.com/oauth/grant-type/password-realm",
  "username": "{TEST_EMAIL}",
  "password": "{TEST_PASSWORD}",
  "client_id": "{AUTH0_CLIENT_ID}",
  "client_secret": "{AUTH0_CLIENT_SECRET}",
  "audience": "{AUTH0_AUDIENCE}",
  "realm": "Username-Password-Authentication",
  "scope": "openid profile email offline_access"
}
```

---

## 🚀 Quick Start

### 1. Run a Quick Smoke Test

```bash
# Against local server (default)
k6 run journeys/user-registration-journey.js

# Against staging
k6 run --env K6_ENV=staging journeys/user-registration-journey.js

# Against production (use with caution!)
k6 run --env K6_ENV=production journeys/user-registration-journey.js
```

### 2. Run the Complete Test Suite

```bash
k6 run run-all-tests.js
```

### 3. Run with Custom VUs and Duration

```bash
k6 run --vus 10 --duration 2m journeys/portfolio-journey.js
```

---

## 📊 Test Categories

| Category | Purpose | Tests Included |
|----------|---------|----------------|
| **Journey Tests** | Simulate complete user flows end-to-end | User Registration, Investment, Payment, Portfolio |
| **Scenario Tests** | API-level load testing with specific patterns | API Load, Stress, Spike, Soak, Admin |

### Test Types Explained

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Smoke** | Quick sanity check | After deployments, before other tests |
| **Load** | Normal expected traffic | Regular performance validation |
| **Stress** | Find breaking points | Capacity planning, before major launches |
| **Spike** | Sudden traffic surges | Test auto-scaling, flash sale scenarios |
| **Soak** | Extended duration | Detect memory leaks, connection pool issues |

---

## 🧭 Journey Tests (Detailed)

Journey tests simulate complete user flows as real users would experience them.

### 1. User Registration Journey

**File:** `journeys/user-registration-journey.js`

**What it tests:** Complete new user onboarding flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION JOURNEY                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Fetch User Profile                                     │
│  └─► GET /api/v1/users?type=CURRENT_USER                       │
│                                                                 │
│  Step 2: Update User Profile                                    │
│  └─► PATCH /api/v1/users/{userId}                              │
│      Body: { address, occupation, income_slab }                │
│                                                                 │
│  Step 3: Manage Children                                        │
│  ├─► GET /api/v1/children (fetch existing)                     │
│  └─► POST /api/v1/children (create if < 2 children)            │
│      Body: { data: [{ name, date_of_birth, gender }] }         │
│                                                                 │
│  Step 4: Manage Bank Accounts                                   │
│  ├─► GET /api/v1/users/{userId}/banks                          │
│  └─► POST /api/v1/users/{userId}/banks (if none exist)         │
│      Body: { account_number, ifsc_code, bank_name, ... }       │
│                                                                 │
│  Step 5: Initiate KYC                                           │
│  └─► POST /api/v1/users/{userId}/actions/init_kyc              │
│                                                                 │
│  Step 6: Check Pending Activities                               │
│  └─► GET /api/v1/users/me/pending-activities                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Run command:**
```bash
k6 run journeys/user-registration-journey.js
```

**VU Pattern:** 0 → 10 → 20 → 0 (ramping)  
**Duration:** ~2 minutes  
**Thresholds:**
- User fetch: p95 < 500ms
- Child create: p95 < 500ms
- Bank add: p95 < 1000ms
- KYC init: p95 < 2000ms
- Journey success rate: > 95%

---

### 2. Investment Journey

**File:** `journeys/investment-journey.js`

**What it tests:** Complete investment flow from browsing to payment

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVESTMENT JOURNEY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SETUP PHASE - runs once]                                      │
│  ├─► GET /api/v1/users?type=CURRENT_USER                       │
│  ├─► GET /api/v1/goals (fetch existing goals)                  │
│  └─► GET /api/v1/users/{userId}/banks (fetch bank account)     │
│                                                                 │
│  Step 1: Browse Investment Baskets                              │
│  └─► GET /api/v1/bucket                                        │
│                                                                 │
│  Step 2: View Goals                                             │
│  └─► GET /api/v1/goals                                         │
│                                                                 │
│  Step 3: Create Payment (with orders)                           │
│  └─► POST /api/v1/payments                                     │
│      Body: {                                                    │
│        orders: [{ goal_id, amount }],                          │
│        payment_method: "net_banking",                          │
│        bank_id: "{bankId}"                                     │
│      }                                                          │
│      Returns: payment_id                                        │
│                                                                 │
│  Step 4: Verify Payment                                         │
│  └─► POST /api/v1/payments/{paymentId}/actions/verify          │
│      Note: May return 403 if MFA required                      │
│                                                                 │
│  Step 5: Get Payment URL                                        │
│  └─► POST /api/v1/payments/{paymentId}/buy/actions/fetch_redirect_url │
│      Returns: redirect_url (to payment gateway)                │
│                                                                 │
│  Step 6: View Goal Details                                      │
│  ├─► GET /api/v1/goals/{goalId}/holdings                       │
│  └─► GET /api/v1/goals/{goalId}/orders                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Run command:**
```bash
k6 run journeys/investment-journey.js
```

**VU Pattern:** 0 → 5 → 15 → 20 → 0 (ramping)  
**Duration:** ~3.5 minutes  
**Thresholds:**
- Basket fetch: p95 < 500ms
- Payment create: p95 < 2000ms
- Payment verify: p95 < 1500ms
- Payment URL: p95 < 1000ms
- Journey success rate: > 85%

---

### 3. Payment Flow Journey

**File:** `journeys/payment-flow-journey.js`

**What it tests:** Isolated payment flow (the most critical transaction path)

```
┌─────────────────────────────────────────────────────────────────┐
│                       PAYMENT FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SETUP PHASE]                                                  │
│  ├─► Fetch existing goal ID                                    │
│  └─► Fetch existing bank ID                                    │
│                                                                 │
│  Step 1: Create Payment                                         │
│  └─► POST /api/v1/payments                                     │
│      Request: {                                                 │
│        orders: [{ goal_id: "{goalId}", amount: 1000-25000 }],  │
│        payment_method: "net_banking",                          │
│        bank_id: "{bankId}"                                     │
│      }                                                          │
│      Response: { id: "payment_123" }                           │
│                                                                 │
│  Step 2: Verify Payment                                         │
│  └─► POST /api/v1/payments/{paymentId}/actions/verify          │
│      Request: { id: "{paymentId}" }                            │
│      Expected responses:                                        │
│        - 200: Verification successful                          │
│        - 403: MFA required (expected in load tests)            │
│        - 400: Validation error                                 │
│                                                                 │
│  Step 3: Get Payment Redirect URL                               │
│  └─► POST /api/v1/payments/{paymentId}/buy/actions/fetch_redirect_url │
│      Response: { redirect_url: "https://gateway.com/pay/..." } │
│                                                                 │
│  Step 4: Payment Gateway (Simulated)                            │
│  └─► Log redirect URL availability                             │
│      (Actual gateway redirect not performed in load tests)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Run command:**
```bash
k6 run journeys/payment-flow-journey.js
```

**VU Pattern:** 0 → 5 → 10 → 15 → 0 (ramping)  
**Duration:** ~3.5 minutes  
**Thresholds:**
- Payment create: p95 < 2000ms
- Payment verify: p95 < 1500ms
- Payment URL: p95 < 1000ms
- Flow success rate: > 85%

---

### 4. Portfolio Journey

**File:** `journeys/portfolio-journey.js`

**What it tests:** Complete portfolio viewing experience (high-traffic read operations)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PORTFOLIO JOURNEY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: View Overall Portfolio                                 │
│  └─► GET /api/v1/portfolio/overall                             │
│                                                                 │
│  Step 2: Fetch Goals List                                       │
│  └─► GET /api/v1/goals                                         │
│                                                                 │
│  Step 3: View Individual Goal Portfolios (up to 3)             │
│  └─► GET /api/v1/portfolio/goals/{goalId}                      │
│      (repeated for each goal)                                  │
│                                                                 │
│  Step 4: View Goal Holdings                                     │
│  └─► GET /api/v1/portfolio/goals/{goalId}/holdings             │
│                                                                 │
│  Step 5: View Goal Transactions                                 │
│  └─► GET /api/v1/portfolio/goals/{goalId}/transactions         │
│                                                                 │
│  Step 6: View All Transactions                                  │
│  └─► GET /api/v1/transactions                                  │
│                                                                 │
│  Step 7: View Filtered Transactions (last 30 days)             │
│  └─► GET /api/v1/transactions?from_date={date}&to_date={date}  │
│                                                                 │
│  Step 8: Check Pending Activities                               │
│  └─► GET /api/v1/users/me/pending-activities                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Run command:**
```bash
k6 run journeys/portfolio-journey.js
```

**VU Pattern:** 0 → 20 → 50 → 0 (ramping)  
**Duration:** ~4 minutes  
**Thresholds:**
- Portfolio overall: p95 < 500ms
- Portfolio goal: p95 < 500ms
- Transactions: p95 < 500ms
- Holdings: p95 < 500ms
- Journey success rate: > 95%

---

## 🎯 Scenario Tests (Detailed)

Scenario tests apply specific load patterns to test system behavior under various conditions.

### 1. API Load Test

**File:** `scenarios/api-load-test.js`

**What it tests:** Mixed realistic API load simulating actual usage patterns

**Load Pattern:**
```
VUs
100│                    ┌──────────┐
   │                   ╱│  SPIKE   │
 50│     ┌────────────┼─┤  100 VUs │
   │    ╱             │ │          │
 20│───┼─────────────┼──┴──────────┴───
   │  ╱  SMOKE       │    LOAD
  5│─┼───────────────┼─────────────────
   │ │               │
  0└─┴───────────────┴─────────────────► Time
     0    1m30s      9m    10m     12m
```

**Weighted Operations (simulating real traffic):**

| Operation | Weight | Category |
|-----------|--------|----------|
| View Portfolio | 20% | Read |
| View Goals | 15% | Read |
| View Baskets | 15% | Read |
| View Transactions | 15% | Read |
| View Pending Activities | 5% | Read |
| View Education | 5% | Read |
| View User Profile | 5% | Read |
| Update Goal | 5% | Write |
| Create Order | 5% | Write |
| Update Profile | 5% | Write |
| Update Nominees | 5% | Write |

**Run command:**
```bash
k6 run scenarios/api-load-test.js
```

**Scenarios included:**
1. **Smoke** (0-1m30s): 5 VUs constant
2. **Load** (1m30s-9m): Ramps 0 → 20 → 50 → 50 → 0
3. **Spike** (9m-12m): Spikes to 100 VUs

**Thresholds:**
- Read operations: p95 < 300ms
- Write operations: p95 < 1000ms
- Overall success rate: > 95%

---

### 2. Admin Operations

**File:** `scenarios/admin-operations.js`

**What it tests:** Admin-only API endpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN OPERATIONS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Test 1: List All Users                                         │
│  └─► GET /api/v1/users?type=ALL                                │
│                                                                 │
│  Test 2: List Active Users                                      │
│  └─► GET /api/v1/users?type=ACTIVE                             │
│                                                                 │
│  Test 3: List All Funds                                         │
│  └─► GET /api/v1/funds                                         │
│                                                                 │
│  Test 4: Update Fund Label                                      │
│  └─► PATCH /api/v1/funds/{fundId}/label                        │
│      Body: { label: "Load Test Label {timestamp}" }            │
│                                                                 │
│  Test 5: List Active Funds                                      │
│  └─► GET /api/v1/funds?activeOnly=true                         │
│                                                                 │
│  Test 6: List All Baskets                                       │
│  └─► GET /api/v1/bucket                                        │
│                                                                 │
│  Test 7: View Basket Details                                    │
│  └─► GET /api/v1/bucket/{basketId}                             │
│                                                                 │
│  Test 8: List Education Records                                 │
│  └─► GET /api/v1/education                                     │
│                                                                 │
│  Test 9: Filter Education by Type                               │
│  └─► GET /api/v1/education?type=INSTITUTION                    │
│                                                                 │
│  Test 10: Search Education                                      │
│  └─► GET /api/v1/education?search=MIT                          │
│                                                                 │
│  Test 11: View Education Details                                │
│  └─► GET /api/v1/education/{educationId}                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Run command:**
```bash
# Requires K6_ADMIN_TOKEN
export K6_ADMIN_TOKEN="eyJ..."
k6 run scenarios/admin-operations.js
```

**VU Pattern:** 5 VUs constant  
**Duration:** 2 minutes  
**Thresholds:**
- Admin operations: p95 < 1000ms
- Success rate: > 95%

---

### 3. Stress Test

**File:** `scenarios/stress-test.js`

**What it tests:** System behavior beyond normal capacity (find breaking point)

**Load Pattern:**
```
VUs
400│                              ┌─────┐
   │                             ╱      │
300│                       ┌────┼───────┤
   │                      ╱     │       │
200│                ┌────┼──────┤       │
   │               ╱     │      │       │
100│         ┌────┼──────┤      │       ├────┐
   │        ╱     │      │      │       │    │
 50│   ┌───┼──────┤      │      │       │    └───┐
   │  ╱    │      │      │      │       │        │
  0└──┴────┴──────┴──────┴──────┴───────┴────────┴──► Time
     0    2m     5m     8m    11m    14m   16m  18m

     ├─warmup─┤ normal │beyond │stress │ max  │recovery
```

**Stress Endpoints Tested:**
- Portfolio (25% weight)
- Goals (20% weight)
- Baskets (15% weight)
- Transactions (15% weight)
- Education (10% weight)
- Children (10% weight)
- User Profile (5% weight)

**Run command:**
```bash
k6 run scenarios/stress-test.js
```

**Stages:**
| Stage | Duration | Target VUs | Purpose |
|-------|----------|------------|---------|
| Warm up | 2m | 50 | System warmup |
| Normal | 3m | 100 | Baseline performance |
| Beyond normal | 3m | 200 | Moderate stress |
| Stress | 3m | 300 | High stress |
| Maximum | 3m | 400 | Find breaking point |
| Recovery | 2m | 100 | Test recovery |
| Cool down | 2m | 0 | Graceful shutdown |

**Duration:** ~18 minutes  
**Thresholds (relaxed for stress):**
- Response time: p95 < 2000ms, p99 < 5000ms
- Success rate: > 80% (allows 20% failure under stress)

---

### 4. Spike Test

**File:** `scenarios/spike-test.js`

**What it tests:** System resilience to sudden traffic spikes

**Load Pattern:**
```
VUs
400│                                    ┌────┐
   │                                   ╱│    │
200│              ┌────┐              ╱ │    │
   │             ╱│    │             ╱  │    │
 50│────────────┼─┴────┴────────────┼───┴────┴────────────
   │            │       │           │          │
  0└────────────┴───────┴───────────┴──────────┴─────────► Time
     0    1m   3m      4m    6m    7m        8m   10m

     │baseline│spike-1 │recovery│ spike-2  │ recovery
```

**Run command:**
```bash
k6 run scenarios/spike-test.js
```

**Stages:**
| Stage | Duration | Target VUs | Purpose |
|-------|----------|------------|---------|
| Baseline | 1m | 50 | Normal load baseline |
| Maintain | 2m | 50 | Steady state |
| Spike 1 | 10s | 200 | First spike (4x) |
| Hold spike | 1m | 200 | Sustain spike |
| Recovery 1 | 10s | 50 | Return to normal |
| Maintain | 2m | 50 | Verify recovery |
| Spike 2 | 10s | 400 | Larger spike (8x) |
| Hold spike | 1m | 400 | Sustain spike |
| Recovery 2 | 10s | 50 | Return to normal |
| Maintain | 2m | 50 | Verify recovery |
| Cool down | 30s | 0 | Shutdown |

**Duration:** ~10 minutes  
**Metrics Tracked:**
- Pre-spike response times
- During-spike response times
- Post-spike response times (recovery)
- Spike degradation percentage
- Recovery overhead percentage

**Thresholds:**
- Spike success rate: > 85%
- Pre-spike: p95 < 500ms
- Post-spike (recovery): p95 < 1000ms

---

### 5. Soak Test

**File:** `scenarios/soak-test.js`

**What it tests:** System stability over extended duration (memory leaks, degradation)

**Load Pattern:**
```
VUs
 50│     ┌─────────────────────────────────────────────────────┐
   │    ╱│                        2 HOURS                      │╲
   │   ╱ │                                                     │ ╲
  0│──┴──┴─────────────────────────────────────────────────────┴──┴──► Time
      5m                                                        5m
    ramp                         sustained                     ramp
     up                            load                        down
```

**Time Windows for Analysis:**
| Window | Time Range | Purpose |
|--------|------------|---------|
| W1 | 0-35 min | Baseline (includes ramp) |
| W2 | 35-65 min | First hour |
| W3 | 65-95 min | Second hour start |
| W4 | 95-125 min | Final window |

**Run command:**
```bash
# Warning: This test runs for ~2 hours!
k6 run scenarios/soak-test.js
```

**Duration:** ~2 hours 10 minutes  
**User Actions Simulated:**

| Action | Weight |
|--------|--------|
| View Portfolio | 25% |
| View Goals | 20% |
| View Transactions | 15% |
| View Baskets | 15% |
| View Education | 10% |
| View Children | 8% |
| View Pending | 4% |
| View Nominees | 3% |

**Thresholds:**
- Overall success rate: > 99%
- Window 1: p95 < 500ms (baseline)
- Window 2-4: p95 < 600ms (allow 20% degradation)

**Analysis Output:**
- Degradation percentage over time
- Memory leak likelihood
- Performance trend (monotonic increase = potential leak)

---

### 6. Comprehensive Test Runner

**File:** `run-all-tests.js`

**What it tests:** All scenarios in sequence for complete system validation

**Execution Timeline:**
```
Timeline
────────────────────────────────────────────────────────────────────────
  0s        │ health_check        │ 1 VU × 10s
 15s        │ user_operations     │ 0→10→20→0 VUs × 2m
2m30s       │ investment_ops      │ 0→10→30→0 VUs × 2m
4m45s       │ portfolio_viewing   │ 0→20→40→0 VUs × 2m
  7m        │ admin_operations    │ 5 VUs × 1m
8m30s       │ mixed_load          │ 0→50→50→0 VUs × 4m
 12m        │ END
────────────────────────────────────────────────────────────────────────
```

**Run command:**
```bash
k6 run run-all-tests.js
```

**Duration:** ~12 minutes  
**Output Verdict:**
- **EXCELLENT**: > 99% success, p95 < 300ms
- **PASSED**: > 95% success, p95 < 500ms
- **WARNING**: > 90% success
- **FAILED**: < 90% success

---

## 📡 API Endpoints Covered

### User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users?type=CURRENT_USER` | GET | Get current user |
| `/api/v1/users?type=ALL` | GET | List all users (admin) |
| `/api/v1/users?type=ACTIVE` | GET | List active users (admin) |
| `/api/v1/users/{id}` | GET/PATCH | Get/Update user |
| `/api/v1/users/{id}/actions/create_investor` | POST | Create investor profile |
| `/api/v1/users/{id}/actions/init_kyc` | POST | Initiate KYC |
| `/api/v1/users/{id}/banks` | GET/POST | Manage bank accounts |
| `/api/v1/users/{id}/banks/{bankId}` | GET/DELETE | Bank account details |
| `/api/v1/users/me/pending-activities` | GET | User pending activities |

### Children
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/children` | GET/POST | List/Create children |

### Goals
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/goals` | GET/POST | List/Create goals |
| `/api/v1/goals/{id}` | GET/PATCH | Get/Update goal |
| `/api/v1/goals/{id}/holdings` | GET | Goal holdings |
| `/api/v1/goals/{id}/orders` | GET | Goal orders |
| `/api/v1/goals/{id}/orders/pending` | GET | Pending orders |

### Funds & Baskets
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/funds` | GET | List funds |
| `/api/v1/funds?activeOnly=true` | GET | Active funds |
| `/api/v1/funds/{id}/label` | PATCH | Update fund label |
| `/api/v1/bucket` | GET/POST | List/Create baskets |
| `/api/v1/bucket/{id}` | GET | Basket details |

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payments` | POST | Create payment |
| `/api/v1/payments/{id}` | GET | Payment details |
| `/api/v1/payments/{id}/actions/verify` | POST | Verify payment |
| `/api/v1/payments/{id}/buy/actions/fetch_redirect_url` | POST | Get payment gateway URL |

### Portfolio
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/portfolio/overall` | GET | Overall portfolio |
| `/api/v1/portfolio/goals/{id}` | GET | Goal portfolio |
| `/api/v1/portfolio/goals/{id}/transactions` | GET | Goal transactions |
| `/api/v1/portfolio/goals/{id}/holdings` | GET | Goal holdings |

### Transactions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/transactions` | GET | All transactions |
| `/api/v1/transactions?from_date=X&to_date=Y` | GET | Filtered transactions |

### Education
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/education` | GET/POST | List/Create education |
| `/api/v1/education?type=X` | GET | Filter by type |
| `/api/v1/education?search=X` | GET | Search education |
| `/api/v1/education/{id}` | GET | Education details |

### Nominees
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users/nominees` | GET/POST | List/Create nominees |
| `/api/v1/users/nominees/{id}` | GET | Nominee details |

### Health
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/actuator/health` | GET | Health check |

---

## 🏃 Running Tests

### Individual Tests

```bash
# Journey Tests
k6 run journeys/user-registration-journey.js
k6 run journeys/investment-journey.js
k6 run journeys/payment-flow-journey.js
k6 run journeys/portfolio-journey.js

# Scenario Tests
k6 run scenarios/admin-operations.js
k6 run scenarios/api-load-test.js
k6 run scenarios/stress-test.js
k6 run scenarios/spike-test.js
k6 run scenarios/soak-test.js

# Complete Suite
k6 run run-all-tests.js
```

### With Environment Selection

```bash
# Local (default)
k6 run journeys/investment-journey.js

# Staging
k6 run --env K6_ENV=staging journeys/investment-journey.js

# Production
k6 run --env K6_ENV=production journeys/investment-journey.js
```

### With Custom VUs and Duration

```bash
# Override VUs and duration
k6 run --vus 100 --duration 5m scenarios/api-load-test.js

# Quick smoke test
k6 run --vus 1 --duration 30s journeys/portfolio-journey.js
```

### With Real-time Output

```bash
# Output to InfluxDB (for Grafana visualization)
k6 run --out influxdb=http://localhost:8086/k6 run-all-tests.js

# Output to Prometheus
k6 run --out experimental-prometheus-rw run-all-tests.js

# Output to JSON file
k6 run --out json=results/output.json run-all-tests.js
```

### Docker Execution

```bash
docker run -i \
  -e K6_ENV=staging \
  -e K6_AUTH_TOKEN=$K6_AUTH_TOKEN \
  -v $(pwd):/scripts \
  grafana/k6 run /scripts/run-all-tests.js
```

---

## 🎯 Performance Thresholds

### Default Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_duration{p(95)}` | < 500ms | 95th percentile response time |
| `http_req_duration{p(99)}` | < 1000ms | 99th percentile response time |
| `http_req_failed` | < 1% | Error rate |
| `journey_success_rate` | > 95% | End-to-end journey success |

### Test-Specific Thresholds

| Test | Metric | Threshold |
|------|--------|-----------|
| **Stress Test** | Success rate | > 80% |
| **Stress Test** | Response time p95 | < 2000ms |
| **Spike Test** | Success rate | > 85% |
| **Spike Test** | Pre-spike p95 | < 500ms |
| **Soak Test** | Success rate | > 99% |
| **Soak Test** | Per-window p95 | < 600ms |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `K6_ENV` | Target environment (`local`, `staging`, `production`) | `local` |
| `K6_AUTH_TOKEN` | JWT token for user authentication | Required |
| `K6_ADMIN_TOKEN` | JWT token for admin operations | Required for admin tests |
| `AUTH0_DOMAIN` | Auth0 domain (for token script) | - |
| `AUTH0_CLIENT_ID` | Auth0 client ID | - |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | - |
| `AUTH0_AUDIENCE` | Auth0 API audience | - |
| `TEST_EMAIL` | Test user email (for token script) | - |
| `TEST_PASSWORD` | Test user password | - |

### Environment URLs

Configured in `config/environments.js`:

```javascript
environments = {
  local: {
    baseUrl: 'http://localhost:8080',
  },
  staging: {
    baseUrl: 'https://staging-api.nested.money',
  },
  production: {
    baseUrl: 'https://api.nested.money',
  },
}
```

### Customizing Test Options

Edit `config/options.js` to modify:
- VU counts
- Stage durations
- Threshold values

---

## 📈 Results & Analysis

### Console Output

All tests print JSON summaries to stdout:

```json
{
  "test": "Investment Journey",
  "timestamp": "2025-01-25T10:30:00.000Z",
  "metrics": {
    "iterations": 150,
    "basket_fetch_p95": 245,
    "payment_create_p95": 1230,
    "journey_success_rate": 0.96
  }
}
```

### Result Files

Tests automatically save detailed results to `./results/`:

| File | Source Test |
|------|-------------|
| `user-registration-summary.json` | User Registration Journey |
| `investment-journey-summary.json` | Investment Journey |
| `payment-flow-summary.json` | Payment Flow Journey |
| `portfolio-journey-summary.json` | Portfolio Journey |
| `admin-operations-summary.json` | Admin Operations |
| `api-load-test-summary.json` | API Load Test |
| `stress-test-summary.json` | Stress Test |
| `spike-test-summary.json` | Spike Test |
| `soak-test-summary.json` | Soak Test |
| `comprehensive-test-summary.json` | Complete Suite |

### Key Metrics to Monitor

1. **Response Time (p95, p99)** - Should be < 500ms / 1000ms
2. **Error Rate** - Should be < 1%
3. **Throughput (req/s)** - Baseline capacity
4. **Degradation Over Time** - For soak tests

### Warning Signs

| Issue | Indication |
|-------|------------|
| Memory leak | Response times increasing monotonically over time |
| Connection pool exhaustion | Errors during sustained load |
| Database bottleneck | p99 much higher than p95 |
| Auto-scaling issues | Errors during spike, but recovery is quick |

---

## 🏭 CI/CD Integration

### GitHub Actions

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Test to run'
        required: true
        default: 'run-all-tests.js'
        type: choice
        options:
          - run-all-tests.js
          - journeys/user-registration-journey.js
          - journeys/investment-journey.js
          - scenarios/stress-test.js

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
          sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
      
      - name: Create results directory
        run: mkdir -p server/k6-tests/results
      
      - name: Run Load Tests
        env:
          K6_ENV: staging
          K6_AUTH_TOKEN: ${{ secrets.K6_AUTH_TOKEN }}
          K6_ADMIN_TOKEN: ${{ secrets.K6_ADMIN_TOKEN }}
        run: |
          cd server/k6-tests
          k6 run ${{ github.event.inputs.test_type || 'run-all-tests.js' }}
      
      - name: Upload Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: load-test-results-${{ github.run_id }}
          path: server/k6-tests/results/
          retention-days: 30
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('server/k6-tests/results/comprehensive-test-summary.json', 'utf8');
            const data = JSON.parse(results);
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## Load Test Results\n\`\`\`json\n${JSON.stringify(data.overall_metrics, null, 2)}\n\`\`\``
            });
```

### GitLab CI

```yaml
load-test:
  stage: test
  image: grafana/k6:latest
  variables:
    K6_ENV: staging
  script:
    - cd server/k6-tests
    - mkdir -p results
    - k6 run run-all-tests.js
  artifacts:
    paths:
      - server/k6-tests/results/
    expire_in: 1 week
  only:
    - schedules
    - web
```

---

## 🛠 Troubleshooting

### Common Issues

#### 1. "No auth token available"

```bash
# Solution: Set the token environment variable
export K6_AUTH_TOKEN="eyJ..."

# Or generate using the script
./scripts/get-token.sh
```

#### 2. "Connection refused"

```bash
# Check if server is running
curl http://localhost:8080/actuator/health

# Verify environment setting
echo $K6_ENV  # Should be 'local', 'staging', or 'production'
```

#### 3. Token generation fails

```bash
# Common causes:
# 1. Password grant not enabled in Auth0
#    → Enable in Auth0 Dashboard > Applications > Settings > Advanced > Grant Types

# 2. Wrong credentials
#    → Verify TEST_EMAIL and TEST_PASSWORD

# 3. Wrong realm
#    → Should be "Username-Password-Authentication"
```

#### 4. High failure rate

```bash
# Check server logs
tail -f /var/log/nested-app/application.log

# Verify endpoints are correct
curl -H "Authorization: Bearer $K6_AUTH_TOKEN" \
  http://localhost:8080/api/v1/users?type=CURRENT_USER
```

#### 5. Tests timeout

```bash
# Increase timeout in options
export K6_OPTIONS='{"httpTimeout":"60s"}'

# Or reduce VU count
k6 run --vus 5 scenarios/stress-test.js
```

### Debug Mode

```bash
# Run with verbose output
k6 run --verbose journeys/investment-journey.js

# Run with HTTP debug
k6 run --http-debug journeys/payment-flow-journey.js
```

---

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/api-load-testing/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)
- [k6 GitHub](https://github.com/grafana/k6)
- [Auth0 Resource Owner Password Grant](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-25 | Initial comprehensive documentation |

---

## 🤝 Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add custom metrics for key operations
3. Include proper thresholds
4. Update this README with test details
5. Add the test to `run-all-tests.js` if appropriate
