# Mobile App Token Generation Guide

This guide explains how to get authentication tokens for mobile app users (SMS OTP based) to use in load tests.

## 🔐 Mobile App Authentication Flow

The mobile app uses **Auth0 Passwordless SMS** authentication, which is different from the admin portal:

```
1. User enters phone number
2. Auth0 sends SMS OTP
3. User enters OTP
4. Auth0 returns access token
```

## 📱 Getting Mobile Tokens

### Option 1: Using Bash Script (Recommended)

```bash
# Set environment variables
export AUTH0_DOMAIN="dev-yscagulfy0qamarm.us.auth0.com"
export AUTH0_CLIENT_ID="your-mobile-app-client-id"
export PHONE_NUMBER="9999999999"  # 10-digit number
export COUNTRY_CODE="+91"  # Optional, defaults to +91

# Run the script
./scripts/get-mobile-token.sh
```

The script will:
1. Request OTP via SMS
2. Prompt you to enter the OTP
3. Exchange OTP for access token
4. Display the token and save it to `results/mobile-token.txt`

**Output:**
```
✅ Token obtained successfully!

──────────────────────────────────────────
Export for k6 load tests:
──────────────────────────────────────────
export K6_AUTH_TOKEN='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'

Usage in k6 tests:
──────────────────────────────────────────
k6 run --env K6_AUTH_TOKEN='eyJ...' journeys/investment-journey.js
```

### Option 2: Using Node.js Script

```bash
# Set environment variables
export AUTH0_DOMAIN="dev-yscagulfy0qamarm.us.auth0.com"
export AUTH0_CLIENT_ID="your-mobile-app-client-id"
export PHONE_NUMBER="9999999999"

# Run the script
node scripts/get-mobile-token.js
```

### Option 3: Test Mode (For Automated Testing)

If your backend supports test OTP (e.g., `000000` always works in test environment):

```bash
export AUTH0_DOMAIN="dev-yscagulfy0qamarm.us.auth0.com"
export AUTH0_CLIENT_ID="your-mobile-app-client-id"
export PHONE_NUMBER="9999999999"
export TEST_MODE="true"
export TEST_OTP="000000"

./scripts/get-mobile-token.sh
```

## 🚀 Using Tokens in Load Tests

### Method 1: Environment Variable

```bash
# Get token first
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)

# Run load test
k6 run journeys/investment-journey.js
```

### Method 2: Direct Export

```bash
# Get token and export in one command
export K6_AUTH_TOKEN=$(./scripts/get-mobile-token.sh | grep "export K6_AUTH_TOKEN" | cut -d"'" -f2)

# Run load test
k6 run journeys/investment-journey.js
```

### Method 3: Pre-generate Multiple Tokens

For load tests with multiple users, generate tokens beforehand:

```bash
# Generate tokens for multiple users
for phone in "9999999999" "8888888888" "7777777777"; do
  export PHONE_NUMBER=$phone
  ./scripts/get-mobile-token.sh >> results/tokens.txt
done

# Extract tokens
grep "export K6_AUTH_TOKEN" results/tokens.txt > results/token-list.txt
```

## 📋 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_DOMAIN` | Auth0 tenant domain | `dev-yscagulfy0qamarm.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Mobile app client ID | `abc123xyz` |
| `PHONE_NUMBER` | 10-digit phone number | `9999999999` |
| `COUNTRY_CODE` | Country code (optional) | `+91` |
| `AUTH0_AUDIENCE` | API audience (optional) | `https://domain.auth0.com/api/v2/` |
| `TEST_MODE` | Enable test mode (optional) | `true` |
| `TEST_OTP` | Test OTP code (optional) | `000000` |

## 🔍 Finding Your Auth0 Client ID

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications**
3. Find your **Mobile App** application
4. Copy the **Client ID**

## ⚠️ Important Notes

### 1. Phone Number Must Be Registered

The phone number must be:
- Registered in Auth0 (user exists)
- Verified (if verification is required)
- Associated with the mobile app client

### 2. SMS Rate Limiting

Auth0 has rate limits for SMS:
- Don't request OTPs too frequently
- Wait at least 30 seconds between requests
- Use test mode for automated testing

### 3. OTP Expiration

- OTPs typically expire in 5-10 minutes
- Request new OTP if expired
- Use test mode to avoid expiration issues

### 4. Token Expiration

- Access tokens expire (usually 24 hours)
- Refresh tokens can be used to get new access tokens
- Regenerate tokens before running long load tests

## 🧪 Testing the Token

Verify your token works:

```bash
# Get token
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)

# Test with a simple API call
curl -H "Authorization: Bearer $K6_AUTH_TOKEN" \
  https://api.nested.money/api/v1/users?type=CURRENT_USER
```

## 🔄 Token Refresh

If you have a refresh token, you can refresh the access token:

```bash
# Extract refresh token from results/mobile-token.json
REFRESH_TOKEN=$(jq -r '.refresh_token' results/mobile-token.json)

# Refresh token (if supported)
curl -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
  -H "Content-Type: application/json" \
  -d "{
    \"grant_type\": \"refresh_token\",
    \"client_id\": \"${AUTH0_CLIENT_ID}\",
    \"refresh_token\": \"${REFRESH_TOKEN}\"
  }"
```

## 🐛 Troubleshooting

### Error: "Failed to send OTP"

**Possible causes:**
- Phone number not registered in Auth0
- SMS connection not enabled
- Wrong client ID (must be mobile app client)
- Rate limiting

**Solutions:**
- Verify phone number exists in Auth0
- Check Auth0 Dashboard → Authentication → Passwordless
- Use a different phone number
- Wait a few minutes and try again

### Error: "Invalid OTP"

**Possible causes:**
- OTP expired (5-10 minutes)
- Wrong OTP code
- Phone number mismatch

**Solutions:**
- Request a new OTP
- Double-check the OTP code
- Ensure phone number matches

### Error: "Client ID doesn't support passwordless"

**Solution:**
- Use the mobile app client ID, not admin client ID
- Verify passwordless is enabled for the client

## 📚 Related Documentation

- [Auth0 Passwordless Authentication](https://auth0.com/docs/authenticate/passwordless)
- [Auth0 Passwordless API](https://auth0.com/docs/api/authentication#passwordless)
- [k6 Authentication Guide](../README.md#-authentication-setup)
