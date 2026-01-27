# Quick Start: Get Mobile App Token for Load Testing

## 🚀 Fastest Way to Get Token

```bash
# 1. Set your Auth0 credentials
export AUTH0_DOMAIN="dev-yscagulfy0qamarm.us.auth0.com"
export AUTH0_CLIENT_ID="your-mobile-app-client-id"
export PHONE_NUMBER="9999999999"  # Your registered phone number

# 2. Run the script
cd server/k6-tests
./scripts/get-mobile-token.sh

# 3. Enter the OTP when prompted

# 4. Copy the token and use it
export K6_AUTH_TOKEN="eyJ..."  # Copy from script output

# 5. Run your load test
k6 run journeys/investment-journey.js
```

## 📝 One-Liner (After First Setup)

```bash
# Get token and export in one command
export K6_AUTH_TOKEN=$(./scripts/get-mobile-token.sh 2>/dev/null | grep "export K6_AUTH_TOKEN" | cut -d"'" -f2) && \
k6 run journeys/investment-journey.js
```

## 🧪 Test Mode (No Manual OTP Entry)

If your backend supports test OTP:

```bash
export AUTH0_DOMAIN="dev-yscagulfy0qamarm.us.auth0.com"
export AUTH0_CLIENT_ID="your-mobile-app-client-id"
export PHONE_NUMBER="9999999999"
export TEST_MODE="true"
export TEST_OTP="000000"

./scripts/get-mobile-token.sh
```

## 📱 What the Script Does

1. **Sends SMS OTP** to your phone number via Auth0
2. **Waits for you to enter OTP** (or uses test OTP)
3. **Exchanges OTP for access token**
4. **Saves token** to `results/mobile-token.txt`
5. **Displays export command** for easy use

## ✅ Verify Token Works

```bash
# Test the token
curl -H "Authorization: Bearer $K6_AUTH_TOKEN" \
  http://localhost:8080/api/v1/users?type=CURRENT_USER
```

## 📚 Full Documentation

See [README-MOBILE-TOKEN.md](./README-MOBILE-TOKEN.md) for complete details.
