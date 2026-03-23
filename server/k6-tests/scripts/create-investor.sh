#!/bin/bash

# ==============================================
# Create Investor Script
# Creates investor profile (mandatory after KYC completion)
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:8080}"
AUTH_TOKEN="${K6_AUTH_TOKEN:-}"

# Check if token is provided
if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}❌ Missing K6_AUTH_TOKEN${NC}"
  echo ""
  echo "Usage:"
  echo "  export K6_AUTH_TOKEN='your-token-here'"
  echo "  ./scripts/create-investor.sh"
  exit 1
fi

echo -e "${BLUE}💼 Investor Creation Script${NC}"
echo ""

# ==============================================
# Step 1: Get Current User
# ==============================================
echo -e "${YELLOW}Step 1: Fetching current user...${NC}"

USER_RESPONSE=$(curl --silent --request GET \
  --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data[0].id // empty')
IS_READY_TO_INVEST=$(echo "$USER_RESPONSE" | jq -r '.data[0].is_ready_to_invest // .data[0].isReadyToInvest // false')
KYC_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data[0].kycStatus // .data[0].kyc_status // "unknown"')

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to get user ID${NC}"
  echo "Response: $USER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ User ID: ${USER_ID}${NC}"
echo -e "${BLUE}KYC Status: ${KYC_STATUS}${NC}"
echo -e "${BLUE}Ready to Invest: ${IS_READY_TO_INVEST}${NC}"
echo ""

# ==============================================
# Step 2: Check Prerequisites
# ==============================================
if [ "$IS_READY_TO_INVEST" = "true" ]; then
  echo -e "${GREEN}✅ Investor already created (user is ready to invest)${NC}"
  echo ""
  echo -e "${CYAN}No action needed. User can proceed with investments.${NC}"
  exit 0
fi

if [ "$KYC_STATUS" != "completed" ] && [ "$KYC_STATUS" != "COMPLETED" ]; then
  echo -e "${RED}❌ KYC must be completed before creating investor${NC}"
  echo ""
  echo -e "${YELLOW}Current KYC Status: ${KYC_STATUS}${NC}"
  echo ""
  echo -e "${CYAN}To complete KYC:${NC}"
  echo "  ./scripts/kyc-flow.sh"
  echo ""
  exit 1
fi

# ==============================================
# Step 3: Create Investor
# ==============================================
echo -e "${YELLOW}Step 2: Creating investor profile...${NC}"
echo -e "${CYAN}Note: This is mandatory after KYC completion${NC}"
echo ""

INVESTOR_RESPONSE=$(curl --silent --request POST \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

# Get HTTP status
HTTP_STATUS=$(curl --silent --write-out "%{http_code}" --output /dev/null \
  --request POST \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "204" ]; then
  echo -e "${GREEN}✅ Investor created successfully!${NC}"
  echo ""
  
  # Wait a moment for status to update
  sleep 1
  
  # Refresh user status
  USER_RESPONSE=$(curl --silent --request GET \
    --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  IS_READY_TO_INVEST=$(echo "$USER_RESPONSE" | jq -r '.data[0].is_ready_to_invest // .data[0].isReadyToInvest // false')
  
  if [ "$IS_READY_TO_INVEST" = "true" ]; then
    echo -e "${GREEN}✅ User is now ready to invest!${NC}"
  else
    echo -e "${YELLOW}⚠️  User status may take a moment to update${NC}"
  fi
else
  ERROR_MSG=$(echo "$INVESTOR_RESPONSE" | jq -r '.error // .message // empty' 2>/dev/null || echo "")
  
  if echo "$ERROR_MSG" | grep -qi "already\|exists"; then
    echo -e "${YELLOW}⚠️  Investor may already exist${NC}"
    echo ""
    echo -e "${CYAN}Checking current status...${NC}"
    
    # Refresh user status
    USER_RESPONSE=$(curl --silent --request GET \
      --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
      --header "Authorization: Bearer ${AUTH_TOKEN}" \
      --header "Content-Type: application/json")
    
    IS_READY_TO_INVEST=$(echo "$USER_RESPONSE" | jq -r '.data[0].is_ready_to_invest // .data[0].isReadyToInvest // false')
    
    if [ "$IS_READY_TO_INVEST" = "true" ]; then
      echo -e "${GREEN}✅ Investor exists and user is ready to invest!${NC}"
    fi
  else
    echo -e "${RED}❌ Failed to create investor${NC}"
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $INVESTOR_RESPONSE"
    exit 1
  fi
fi

echo ""

# ==============================================
# Summary
# ==============================================
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        Investor Creation Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}User ID:${NC} ${USER_ID}"
echo -e "${BLUE}KYC Status:${NC} ${KYC_STATUS}"
echo -e "${BLUE}Ready to Invest:${NC} ${IS_READY_TO_INVEST}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# Save investor info to file
mkdir -p results
cat > results/investor-info.json <<EOF
{
  "user_id": "${USER_ID}",
  "kyc_status": "${KYC_STATUS}",
  "is_ready_to_invest": ${IS_READY_TO_INVEST},
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 Investor info saved to: results/investor-info.json${NC}"
echo ""

# Show next steps
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "  → Create bank account:"
echo "    ./scripts/create-bank.sh"
echo "  → Create goal:"
echo "    ./scripts/create-goal.sh"
echo "  → Test investment journey:"
echo "    k6 run --vus 1 --iterations 1 journeys/investment-journey.js"
echo ""

echo -e "${GREEN}✅ Investor creation complete!${NC}"
