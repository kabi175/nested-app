#!/bin/bash

# ==============================================
# Get Auth0 Token for K6 Load Testing
# Using Resource Owner Password Grant
# ==============================================

# Set your Auth0 credentials
AUTH0_DOMAIN="${AUTH0_DOMAIN:-}"
AUTH0_CLIENT_ID="${AUTH0_CLIENT_ID:-}"
AUTH0_CLIENT_SECRET="${AUTH0_CLIENT_SECRET:-}"
AUTH0_AUDIENCE="${AUTH0_AUDIENCE:-}"

# Test user credentials
TEST_EMAIL="${TEST_EMAIL:-}"
TEST_PASSWORD="${TEST_PASSWORD:-}"

# Check if credentials are set
if [ -z "$AUTH0_DOMAIN" ] || [ -z "$AUTH0_CLIENT_ID" ] || [ -z "$TEST_EMAIL" ] || [ -z "$TEST_PASSWORD" ]; then
  echo "❌ Missing required environment variables"
  echo ""
  echo "Usage:"
  echo "  export AUTH0_DOMAIN='your-domain.auth0.com'"
  echo "  export AUTH0_CLIENT_ID='your-client-id'"
  echo "  export AUTH0_CLIENT_SECRET='your-client-secret'"
  echo "  export AUTH0_AUDIENCE='https://api.nested.money'"
  echo "  export TEST_EMAIL='test@example.com'"
  echo "  export TEST_PASSWORD='your-password'"
  echo ""
  echo "  ./scripts/get-token.sh"
  exit 1
fi

echo "🔑 Getting Auth0 token for: $TEST_EMAIL"

# Get token using Resource Owner Password Grant (password-realm)
# This is the same method used by the admin client
RESPONSE=$(curl --silent --request POST \
  --url "https://${AUTH0_DOMAIN}/oauth/token" \
  --header 'content-type: application/json' \
  --data "{
    \"grant_type\": \"http://auth0.com/oauth/grant-type/password-realm\",
    \"username\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"client_id\": \"${AUTH0_CLIENT_ID}\",
    \"client_secret\": \"${AUTH0_CLIENT_SECRET}\",
    \"audience\": \"${AUTH0_AUDIENCE}\",
    \"realm\": \"Username-Password-Authentication\",
    \"scope\": \"openid profile email offline_access\"
  }")

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  echo "Response: $RESPONSE"
  echo ""
  echo "Common issues:"
  echo "  1. Password grant not enabled - Enable in Auth0 Dashboard > Applications > Settings > Advanced > Grant Types"
  echo "  2. Wrong credentials - Check email/password"
  echo "  3. Wrong realm - Should be 'Username-Password-Authentication'"
  exit 1
fi

echo ""
echo "✅ Token obtained successfully!"
echo ""
echo "──────────────────────────────────────────"
echo "export K6_AUTH_TOKEN='$TOKEN'"
echo "──────────────────────────────────────────"
echo ""
echo "Run tests with:"
echo "  k6 run journeys/payment-flow-journey.js"
