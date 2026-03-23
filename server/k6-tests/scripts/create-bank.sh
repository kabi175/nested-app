#!/bin/bash

# ==============================================
# Create Bank Account Script
# Creates a bank account for testing payment flows
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

# Bank account data (can be overridden via environment variables)
BANK_ACCOUNT_NUMBER="${BANK_ACCOUNT_NUMBER:-$(shuf -i 1000000000-9999999999 -n 1)}"
BANK_IFSC="${BANK_IFSC:-SBIN0001234}"
BANK_ACCOUNT_TYPE="${BANK_ACCOUNT_TYPE:-savings}"
BANK_IS_PRIMARY="${BANK_IS_PRIMARY:-true}"

# Common IFSC codes for testing
declare -A BANK_IFSC_CODES=(
  ["HDFC"]="HDFC0001234"
  ["ICICI"]="ICIC0001234"
  ["SBI"]="SBIN0001234"
  ["AXIS"]="UTIB0001234"
  ["KOTAK"]="KKBK0001234"
  ["PNB"]="PUNB0001234"
)

# Check if token is provided
if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}❌ Missing K6_AUTH_TOKEN${NC}"
  echo ""
  echo "Usage:"
  echo "  export K6_AUTH_TOKEN='your-token-here'"
  echo "  ./scripts/create-bank.sh"
  echo ""
  echo "Optional variables:"
  echo "  BANK_ACCOUNT_NUMBER='123456789012'"
  echo "  BANK_IFSC='SBIN0001234'"
  echo "  BANK_ACCOUNT_TYPE='SAVINGS' or 'CURRENT'"
  echo "  BANK_IS_PRIMARY='true' or 'false'"
  echo "  BANK_NAME='HDFC' (auto-sets IFSC)"
  exit 1
fi

echo -e "${BLUE}🏦 Bank Account Creation Script${NC}"
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

# Check if KYC is completed
if [ "$IS_READY_TO_INVEST" != "true" ] && [ "$KYC_STATUS" != "completed" ]; then
  echo -e "${YELLOW}⚠️  Warning: KYC not completed${NC}"
  echo -e "${YELLOW}Bank account creation requires KYC to be completed${NC}"
  echo ""
  echo -e "${CYAN}To complete KYC:${NC}"
  echo "  ./scripts/kyc-flow.sh"
  echo ""
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# ==============================================
# Step 2: Check Existing Bank Accounts
# ==============================================
echo -e "${YELLOW}Step 2: Checking existing bank accounts...${NC}"

BANKS_RESPONSE=$(curl --silent --request GET \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/banks" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

BANKS_COUNT=$(echo "$BANKS_RESPONSE" | jq -r '.data | length // 0' 2>/dev/null || echo "0")

if [ "$BANKS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Found ${BANKS_COUNT} existing bank account(s)${NC}"
  
  # List existing banks
  echo "$BANKS_RESPONSE" | jq -r '.data[]? | "  - ID: \(.id), Account: \(.account_number), IFSC: \(.ifsc), Type: \(.account_type)"' 2>/dev/null || true
  
  echo ""
  read -p "Create another bank account? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Using existing bank account(s)${NC}"
    exit 0
  fi
  
  # If primary exists, set new one as non-primary
  PRIMARY_EXISTS=$(echo "$BANKS_RESPONSE" | jq -r '.data[]? | select(.is_primary == true) | .id' 2>/dev/null | head -1)
  if [ -n "$PRIMARY_EXISTS" ]; then
    BANK_IS_PRIMARY="false"
    echo -e "${YELLOW}Setting new account as non-primary (primary already exists)${NC}"
  fi
else
  echo -e "${YELLOW}No existing bank accounts found${NC}"
  BANK_IS_PRIMARY="true"
fi
echo ""

# ==============================================
# Step 3: Set IFSC Code
# ==============================================
if [ -n "$BANK_NAME" ] && [ -n "${BANK_IFSC_CODES[$BANK_NAME]}" ]; then
  BANK_IFSC="${BANK_IFSC_CODES[$BANK_NAME]}"
  echo -e "${YELLOW}Step 3: Using IFSC for ${BANK_NAME}: ${BANK_IFSC}${NC}"
else
  echo -e "${YELLOW}Step 3: Using IFSC: ${BANK_IFSC}${NC}"
fi

# Validate IFSC format
if ! [[ "$BANK_IFSC" =~ ^[A-Z]{4}0[A-Z0-9]{6}$ ]]; then
  echo -e "${YELLOW}⚠️  Warning: IFSC format may be invalid (expected: XXXX0XXXXX)${NC}"
  echo -e "${YELLOW}Using: ${BANK_IFSC}${NC}"
fi
echo ""

# ==============================================
# Step 4: Create Bank Account
# ==============================================
echo -e "${YELLOW}Step 4: Creating bank account...${NC}"

# Convert account type to uppercase for enum (backend accepts both but uppercase is safer)
BANK_ACCOUNT_TYPE_UPPER=$(echo "${BANK_ACCOUNT_TYPE}" | tr '[:lower:]' '[:upper:]')

# Build bank account payload
BANK_PAYLOAD=$(cat <<EOF
{
  "account_number": "${BANK_ACCOUNT_NUMBER}",
  "ifsc": "${BANK_IFSC}",
  "account_type": "${BANK_ACCOUNT_TYPE_UPPER}",
  "is_primary": ${BANK_IS_PRIMARY}
}
EOF
)

echo -e "${CYAN}Bank Account Payload:${NC}"
echo "$BANK_PAYLOAD" | jq '.' 2>/dev/null || echo "$BANK_PAYLOAD"
echo ""

# Get response with HTTP status
HTTP_STATUS=$(curl --silent --write-out "%{http_code}" --output /tmp/bank_response.json \
  --request POST \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/banks" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$BANK_PAYLOAD")

BANK_RESPONSE=$(cat /tmp/bank_response.json 2>/dev/null || echo "{}")
BANK_ID=$(echo "$BANK_RESPONSE" | jq -r '.id // .data.id // empty' 2>/dev/null || echo "")

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS" != "201" ]; then
  echo -e "${RED}❌ Failed to create bank account${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $BANK_RESPONSE"
  
  # Check for common errors
  ERROR_MSG=$(echo "$BANK_RESPONSE" | jq -r '.error // .message // empty' 2>/dev/null || echo "")
  if [ -n "$ERROR_MSG" ]; then
    echo ""
    echo -e "${RED}Error: ${ERROR_MSG}${NC}"
  fi
  
  if echo "$BANK_RESPONSE" | grep -qi "kyc\|KYC"; then
    echo ""
    echo -e "${YELLOW}💡 Tip: Complete KYC first:${NC}"
    echo "  ./scripts/kyc-flow.sh"
  fi
  
  if echo "$BANK_RESPONSE" | grep -qi "ifsc\|IFSC"; then
    echo ""
    echo -e "${YELLOW}💡 Tip: Check IFSC code format (should be XXXX0XXXXX)${NC}"
  fi
  
  exit 1
fi

if [ -z "$BANK_ID" ] || [ "$BANK_ID" = "null" ]; then
  echo -e "${RED}❌ Bank account created but ID not found in response${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $BANK_RESPONSE"
  exit 1
fi

BANK_ACCOUNT_NUMBER_RESPONSE=$(echo "$BANK_RESPONSE" | jq -r '.account_number // .data.account_number // empty' 2>/dev/null || echo "")
BANK_IFSC_RESPONSE=$(echo "$BANK_RESPONSE" | jq -r '.ifsc // .data.ifsc // empty' 2>/dev/null || echo "")
BANK_TYPE_RESPONSE=$(echo "$BANK_RESPONSE" | jq -r '.account_type // .data.account_type // empty' 2>/dev/null || echo "")
BANK_IS_PRIMARY_RESPONSE=$(echo "$BANK_RESPONSE" | jq -r '.is_primary // .data.is_primary // false' 2>/dev/null || echo "false")

echo -e "${GREEN}✅ Bank account created successfully!${NC}"
echo ""

# ==============================================
# Summary
# ==============================================
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        Bank Account Creation Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Bank ID:${NC} ${BANK_ID}"
echo -e "${BLUE}Account Number:${NC} ${BANK_ACCOUNT_NUMBER_RESPONSE}"
echo -e "${BLUE}IFSC Code:${NC} ${BANK_IFSC_RESPONSE}"
echo -e "${BLUE}Account Type:${NC} ${BANK_TYPE_RESPONSE}"
echo -e "${BLUE}Is Primary:${NC} ${BANK_IS_PRIMARY_RESPONSE}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# Save bank info to file
mkdir -p results
cat > results/bank-info.json <<EOF
{
  "bank_id": "${BANK_ID}",
  "account_number": "${BANK_ACCOUNT_NUMBER_RESPONSE}",
  "ifsc": "${BANK_IFSC_RESPONSE}",
  "account_type": "${BANK_TYPE_RESPONSE}",
  "is_primary": ${BANK_IS_PRIMARY_RESPONSE},
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 Bank info saved to: results/bank-info.json${NC}"
echo ""

# Show next steps
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "  → Bank account is ready for payment flows"
echo "  → Test investment journey:"
echo "    k6 run --vus 1 --iterations 1 journeys/investment-journey.js"
echo ""

echo -e "${GREEN}✅ Bank account creation complete!${NC}"
