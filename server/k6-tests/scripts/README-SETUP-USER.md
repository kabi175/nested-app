# Setup Test User Script

This script automates the complete user setup process for load testing:
1. ✅ Fetches current user
2. ✅ Updates user profile with test data
3. ✅ Initiates KYC process
4. ✅ Creates investor profile (after KYC)
5. ✅ Adds a child
6. ✅ Adds a nominee

## 🚀 Quick Start

### Prerequisites

1. **Get authentication token first:**
   ```bash
   ./scripts/get-mobile-token.sh
   export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)
   ```

2. **Run the setup script:**
   ```bash
   ./scripts/setup-test-user.sh
   ```

   Or using Node.js:
   ```bash
   node scripts/setup-test-user.js
   ```

## 📋 What the Script Does

### Step 1: Get Current User
- Fetches the authenticated user's profile
- Extracts user ID for subsequent operations

### Step 2: Update User Profile
Updates user with test data:
- Personal info (name, email, phone, DOB, gender)
- PAN number
- Occupation and income details
- Address information

### Step 3: Initiate KYC
- Starts the KYC (Know Your Customer) process
- Sets user status to `AADHAAR_PENDING`

### Step 4: Create Investor
- Creates investor profile in external system
- **Note:** This step may fail if KYC is not completed yet
- You'll need to complete KYC manually, then re-run this step

### Step 5: Add Child
- Creates a child record with test data:
  - Name: Aarav (default)
  - DOB: 2015-06-20 (default)
  - Gender: MALE (default)

### Step 6: Add Nominee
- Creates a nominee with:
  - Name: Priya Kumar (default)
  - Relationship: SPOUSE (default)
  - Allocation: 100% (default)
  - Address details

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | API base URL | `http://localhost:8080` |
| `K6_AUTH_TOKEN` | Authentication token | **Required** |
| `FIRST_NAME` | User first name | `Rahul` |
| `LAST_NAME` | User last name | `Kumar` |
| `EMAIL` | User email | `testuser{timestamp}@test.nested.money` |
| `PHONE_NUMBER` | Phone number (10 digits) | `9999999999` |
| `DATE_OF_BIRTH` | User DOB (YYYY-MM-DD) | `1990-01-15` |
| `GENDER` | User gender | `MALE` |
| `PAN_NUMBER` | PAN card number | `ABCDE1234F` |
| `OCCUPATION` | Occupation | `SALARIED` |
| `INCOME_SLAB` | Income slab | `L5_TO_10L` |
| `MARITAL_STATUS` | Marital status | `MARRIED` |
| `ADDRESS_LINE1` | Address line 1 | `123, Test Street` |
| `ADDRESS_LINE2` | Address line 2 | `Block A` |
| `CITY` | City | `Mumbai` |
| `STATE` | State | `Maharashtra` |
| `PINCODE` | Pincode | `400001` |
| `COUNTRY` | Country | `India` |
| `CHILD_NAME` | Child name | `Aarav` |
| `CHILD_DOB` | Child DOB | `2015-06-20` |
| `CHILD_GENDER` | Child gender | `MALE` |
| `NOMINEE_NAME` | Nominee name | `Priya Kumar` |
| `NOMINEE_RELATIONSHIP` | Nominee relationship | `SPOUSE` |
| `NOMINEE_DOB` | Nominee DOB | `1992-03-10` |
| `NOMINEE_ALLOCATION` | Nominee allocation % | `100` |

### Custom Test Data Example

```bash
export K6_AUTH_TOKEN="your-token"
export FIRST_NAME="Vikram"
export LAST_NAME="Sharma"
export EMAIL="vikram.sharma@test.com"
export CHILD_NAME="Ishaan"
export NOMINEE_NAME="Neha Sharma"

./scripts/setup-test-user.sh
```

## 📝 Output

The script:
1. **Displays progress** for each step
2. **Shows success/warning messages**
3. **Saves user info** to `results/test-user-info.json`

Example output:
```json
{
  "user_id": "123",
  "first_name": "Rahul",
  "last_name": "Kumar",
  "email": "testuser1234567890@test.nested.money",
  "phone_number": "+919999999999",
  "child_id": "456",
  "nominee_id": "789",
  "setup_date": "2025-01-25T10:30:00.000Z"
}
```

## ⚠️ Important Notes

### KYC Completion

The script **initiates** KYC but doesn't complete it. You need to:
1. Complete KYC manually (upload Aadhaar, e-sign, etc.)
2. Wait for KYC status to become `COMPLETED`
3. Re-run the script or manually call `create_investor` endpoint

### Investor Creation

Investor creation will fail if:
- KYC is not completed
- Investor already exists (non-critical)

The script handles these gracefully and continues with other steps.

### Duplicate Data

The script handles:
- ✅ Already existing children (shows warning)
- ✅ Already existing nominees (shows warning)
- ✅ Already initiated KYC (shows warning)

## 🔄 Complete Workflow

```bash
# 1. Get authentication token
./scripts/get-mobile-token.sh
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)

# 2. Setup test user
./scripts/setup-test-user.sh

# 3. (Manual) Complete KYC in mobile app or admin portal

# 4. Re-run to create investor (or manually call create_investor)
./scripts/setup-test-user.sh

# 5. Use the user for load testing
k6 run --env K6_AUTH_TOKEN=$K6_AUTH_TOKEN journeys/investment-journey.js
```

## 🐛 Troubleshooting

### Error: "Failed to get user ID"

**Cause:** Invalid or expired token

**Solution:**
```bash
# Get a new token
./scripts/get-mobile-token.sh
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)
```

### Error: "KYC not completed"

**Cause:** KYC process not finished

**Solution:**
1. Complete KYC manually
2. Wait for status to be `COMPLETED`
3. Re-run the script

### Error: "Connection refused"

**Cause:** API server not running

**Solution:**
```bash
# Check if server is running
curl http://localhost:8080/actuator/health

# Or set correct BASE_URL
export BASE_URL="https://staging-api.nested.money"
```

## 📚 Related Scripts

- `get-mobile-token.sh` - Get authentication token
- `get-token.sh` - Get admin token (username/password)

## 🎯 Use Cases

1. **Load Testing Setup:** Prepare test users with complete profiles
2. **Integration Testing:** Create users with all required data
3. **Development:** Quickly set up test accounts
4. **QA Testing:** Standardize test user creation
