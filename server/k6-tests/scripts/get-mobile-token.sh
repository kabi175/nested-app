#!/bin/bash

# ==============================================
# Get Mobile App Token via SMS OTP (Auth0 Passwordless)
# Reproduces the exact mobile app authentication flow
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Auth0 Configuration
AUTH0_DOMAIN="${AUTH0_DOMAIN:}"
AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID:}"
AUTH0_AUDIENCE="${AUTH0_AUDIENCE:-}"

# Phone number (format: +91XXXXXXXXXX)
PHONE_NUMBER="${PHONE_NUMBER:9677923943}"
COUNTRY_CODE="${COUNTRY_CODE:-+91}"

# Test mode - if set, uses test OTP (requires backend support)
TEST_MODE="${TEST_MODE:-false}"
TEST_OTP="${TEST_OTP:-000000}"

# Check if credentials are set
if [ -z "$AUTH0_DOMAIN" ] || [ -z "$AUTH0_CLIENT_ID" ]; then
  echo -e "${RED}❌ Missing required environment variables${NC}"
  echo ""
  echo "Usage:"
  echo "  export AUTH0_DOMAIN='dev-yscagulfy0qamarm.us.auth0.com'"
  echo "  export AUTH0_CLIENT_ID='your-mobile-app-client-id'"
  echo "  export PHONE_NUMBER='9999999999'  # 10-digit number (without country code)"
  echo "  export COUNTRY_CODE='+91'  # Optional, defaults to +91"
  echo ""
  echo "  ./scripts/get-mobile-token.sh"
  echo ""
  echo "Optional (for test mode):"
  echo "  export TEST_MODE='true'"
  echo "  export TEST_OTP='000000'  # Test OTP that always works"
  exit 1
fi

# Check if phone number is provided
if [ -z "$PHONE_NUMBER" ]; then
  echo -e "${YELLOW}📱 Enter phone number (10 digits, without country code):${NC}"
  read -r PHONE_NUMBER
fi

# Validate phone number
if ! [[ "$PHONE_NUMBER" =~ ^[0-9]{10}$ ]]; then
  echo -e "${RED}❌ Invalid phone number. Must be 10 digits.${NC}"
  exit 1
fi

FULL_PHONE_NUMBER="${COUNTRY_CODE}${PHONE_NUMBER}"
echo -e "${BLUE}🔑 Getting Auth0 token for mobile user: ${FULL_PHONE_NUMBER}${NC}"
echo ""

# ==============================================
# Step 1: Request OTP (Passwordless Start)
# ==============================================
echo -e "${YELLOW}Step 1: Requesting OTP via SMS...${NC}"

PASSWORDLESS_START_URL="https://${AUTH0_DOMAIN}/passwordless/start"

PASSWORDLESS_RESPONSE=$(curl --silent --request POST \
  --url "$PASSWORDLESS_START_URL" \
  --header 'content-type: application/json' \
  --data "{
    \"client_id\": \"${AUTH0_CLIENT_ID}\",
    \"connection\": \"sms\",
    \"phone_number\": \"${FULL_PHONE_NUMBER}\"
  }")

# Check if OTP was sent successfully
if echo "$PASSWORDLESS_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Failed to send OTP${NC}"
  echo "Response: $PASSWORDLESS_RESPONSE"
  echo ""
  echo "Common issues:"
  echo "  1. Phone number not registered in Auth0"
  echo "  2. SMS connection not enabled in Auth0 Dashboard"
  echo "  3. Wrong client ID (must be mobile app client ID)"
  echo "  4. Rate limiting - wait a few minutes"
  exit 1
fi

echo -e "${GREEN}✅ OTP sent successfully!${NC}"
echo ""

# ==============================================
# Step 2: Get OTP from user or use test OTP
# ==============================================
if [ "$TEST_MODE" = "true" ]; then
  OTP_CODE="$TEST_OTP"
  echo -e "${YELLOW}🧪 Test mode: Using test OTP: ${OTP_CODE}${NC}"
else
  echo -e "${YELLOW}📱 Enter the 6-digit OTP sent to ${FULL_PHONE_NUMBER}:${NC}"
  read -r OTP_CODE
  
  # Validate OTP
  if ! [[ "$OTP_CODE" =~ ^[0-9]{6}$ ]]; then
    echo -e "${RED}❌ Invalid OTP. Must be 6 digits.${NC}"
    exit 1
  fi
fi

echo ""

# ==============================================
# Step 3: Verify OTP and Get Token
# ==============================================
echo -e "${YELLOW}Step 2: Verifying OTP and getting access token...${NC}"

OAUTH_TOKEN_URL="https://${AUTH0_DOMAIN}/oauth/token"

TOKEN_RESPONSE=$(curl --silent --request POST \
  --url "$OAUTH_TOKEN_URL" \
  --header 'content-type: application/json' \
  --data "{
    \"grant_type\": \"http://auth0.com/oauth/grant-type/passwordless/otp\",
    \"client_id\": \"${AUTH0_CLIENT_ID}\",
    \"otp\": \"${OTP_CODE}\",
    \"realm\": \"sms\",
    \"username\": \"${FULL_PHONE_NUMBER}\",
    \"audience\": \"${AUTH0_AUDIENCE}\",
    \"scope\": \"openid profile email phone offline_access\"
  }")

# Extract token
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  echo "Response: $TOKEN_RESPONSE"
  echo ""
  echo "Common issues:"
  echo "  1. Invalid or expired OTP - request a new one"
  echo "  2. Wrong OTP code"
  echo "  3. Phone number mismatch"
  echo "  4. Client ID doesn't support passwordless flow"
  exit 1
fi

# Extract other token info
ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.id_token // empty')
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token // empty')
EXPIRES_IN=$(echo "$TOKEN_RESPONSE" | jq -r '.expires_in // 86400')

echo ""
echo -e "${GREEN}✅ Token obtained successfully!${NC}"
echo ""
echo "──────────────────────────────────────────"
echo -e "${BLUE}Token Information:${NC}"
echo "──────────────────────────────────────────"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Expires in: ${EXPIRES_IN} seconds"
echo ""
echo "──────────────────────────────────────────"
echo -e "${GREEN}Export for k6 load tests:${NC}"
echo "──────────────────────────────────────────"
echo "export K6_AUTH_TOKEN='$ACCESS_TOKEN'"
echo ""
echo "Or save to file:"
echo "echo '$ACCESS_TOKEN' > .k6-token"
echo ""
echo "──────────────────────────────────────────"
echo -e "${YELLOW}Usage in k6 tests:${NC}"
echo "──────────────────────────────────────────"
echo "k6 run --env K6_AUTH_TOKEN='$ACCESS_TOKEN' journeys/investment-journey.js"
echo ""

# Save token to file for easy access
if [ -d "results" ]; then
  echo "$ACCESS_TOKEN" > results/mobile-token.txt
  echo -e "${GREEN}💾 Token saved to: results/mobile-token.txt${NC}"
fi
