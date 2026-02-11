# KYC Flow Script Guide

Complete guide for initiating and verifying KYC (Know Your Customer) process.

## 🔐 KYC Flow Overview

The KYC process has the following stages:

```
1. UNKNOWN/PENDING
   ↓
2. AADHAAR_PENDING (after init_kyc)
   ↓
3. E_SIGN_PENDING (after Aadhaar verification)
   ↓
4. SUBMITTED (after e-sign)
   ↓
5. COMPLETED (after review/approval)
```

## 🚀 Quick Start

```bash
# 1. Get authentication token
./scripts/get-mobile-token.sh
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)

# 2. Run KYC flow script
./scripts/kyc-flow.sh
```

## 📋 What the Script Does

### Step 1: Get Current User
- Fetches authenticated user profile
- Checks current KYC status

### Step 2: Initiate KYC
- Calls `POST /api/v1/users/{id}/actions/init_kyc`
- Creates KYC request in external service
- Sets status to `AADHAAR_PENDING`

### Step 3: Aadhaar Upload
- Calls `POST /api/v1/users/{id}/actions/aadhaar_upload`
- Gets redirect URL to external Aadhaar verification service
- **If HTTP 202**: Aadhaar already completed (status may update)
- **If HTTP 201/200**: Returns redirect URL for Aadhaar verification

### Step 4: E-Sign Upload
- Calls `POST /api/v1/users/{id}/actions/esign_upload`
- Gets redirect URL to external e-sign service
- **If HTTP 202**: E-sign already completed
- **If HTTP 201/200**: Returns redirect URL for e-sign

### Step 5: Check Final Status
- Verifies current KYC status
- Shows next steps based on status

## 🔍 Understanding Responses

### Aadhaar Upload Response

**Success (201 Created):**
```json
{
  "id": "user_123",
  "type": "aadhaar_upload",
  "redirectUrl": "https://kyc-service.com/aadhaar/verify/..."
}
```

**Already Completed (202 Accepted):**
- Empty response body
- Means Aadhaar document already exists
- Status should update to `E_SIGN_PENDING` shortly

**Error (400/500):**
- Error message in response
- Check error details for resolution

### E-Sign Upload Response

**Success (201 Created):**
```json
{
  "id": "user_123",
  "type": "esign_upload",
  "redirectUrl": "https://esign-service.com/verify/..."
}
```

**Already Completed (202 Accepted):**
- Empty response body
- E-sign already done
- Status should update to `SUBMITTED` shortly

## ⚙️ Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | API base URL | `http://localhost:8080` |
| `K6_AUTH_TOKEN` | Authentication token | **Required** |

## 📝 Manual KYC Steps

If the script doesn't get redirect URLs, you can complete KYC manually:

### Option 1: Use Mobile App
1. Open mobile app
2. Navigate to KYC section
3. Complete Aadhaar verification
4. Complete e-signature
5. Wait for approval

### Option 2: Use Admin Portal
1. Login to admin portal
2. Navigate to user management
3. Complete KYC for the user
4. Verify status updates

### Option 3: Direct API Calls

```bash
# Get Aadhaar URL
curl -X POST "${BASE_URL}/api/v1/users/${USER_ID}/actions/aadhaar_upload" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

# Get E-sign URL
curl -X POST "${BASE_URL}/api/v1/users/${USER_ID}/actions/esign_upload" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"
```

## 🔄 KYC Status Flow

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `unknown` | KYC not started | Run `init_kyc` |
| `pending` | KYC initiated but not started | Run `init_kyc` |
| `aadhaar_pending` | Waiting for Aadhaar | Get Aadhaar redirect URL |
| `esign_pending` | Waiting for e-sign | Get e-sign redirect URL |
| `submitted` | KYC submitted for review | Wait for approval |
| `completed` | KYC approved | Can create investor |
| `failed` | KYC rejected | Retry KYC |

## ⚠️ Common Issues

### Issue: No Redirect URL (HTTP 202)

**Cause:** Aadhaar/e-sign already completed in external service

**Solution:**
1. Wait a few seconds for status to update
2. Run script again to check updated status
3. If status doesn't update, check KYC service logs

### Issue: HTTP 500 Error

**Possible causes:**
- KYC service unavailable
- Missing KYC request reference
- External service error

**Solution:**
1. Check if `init_kyc` was successful
2. Verify user has `kycRequestRef` in investor profile
3. Check server logs for detailed error

### Issue: Status Stuck at `aadhaar_pending`

**Possible causes:**
- Aadhaar verification not completed on external service
- Callback not received
- Status update failed

**Solution:**
1. Manually trigger Aadhaar upload again
2. Check callback URL is accessible
3. Verify external KYC service status

## 🧪 Testing KYC in Development

In development environment, there's a KYC emulator that:
- Auto-completes KYC after 10 seconds when status is `SUBMITTED`
- Useful for testing without external services

## 📊 Checking KYC Status

```bash
# Get current user and KYC status
curl -X GET "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  | jq '.data[0] | {id, kycStatus, is_ready_to_invest}'
```

## 🔗 Related Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/users/{id}/actions/init_kyc` | POST | Initiate KYC |
| `/api/v1/users/{id}/actions/aadhaar_upload` | POST | Get Aadhaar redirect URL |
| `/api/v1/users/{id}/actions/esign_upload` | POST | Get e-sign redirect URL |
| `/api/v1/users/{id}/actions/create_investor` | POST | Create investor (requires KYC completed) |

## 📚 Next Steps After KYC Completion

Once KYC status is `COMPLETED`:

1. **Create Investor Profile:**
   ```bash
   curl -X POST "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
     -H "Authorization: Bearer ${AUTH_TOKEN}"
   ```

2. **Add Bank Account:**
   ```bash
   ./scripts/setup-test-user.sh
   ```

3. **Start Investing:**
   - Create goals
   - Place orders
   - Make payments

## 🐛 Debugging

Enable verbose output:
```bash
# Add -v flag to curl commands in script
curl -v -X POST ...
```

Check server logs:
```bash
tail -f server/logs/nested-api.log | grep -i kyc
```

## 📝 Notes

- **Redirect URLs expire** - Use them immediately
- **Status updates are async** - May take a few seconds
- **External services required** - Aadhaar and e-sign use third-party services
- **Development mode** - May have auto-completion emulator
