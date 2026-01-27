#!/bin/bash

# ==============================================
# Setup Complete Test User
# Creates user, initiates KYC, adds child and nominee
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

# Test data
FIRST_NAME="${FIRST_NAME:-MOHANAPRANESWARAN}"
LAST_NAME="${LAST_NAME:-M}"
EMAIL="${EMAIL:-testuser$(date +%s)@test.nested.money}"
PHONE_NUMBER="${PHONE_NUMBER:-9677923943}"
DATE_OF_BIRTH="${DATE_OF_BIRTH:-2002-04-23}"
GENDER="${GENDER:-male}"
PAN_NUMBER="${PAN_NUMBER:-ABCDE1234F}"
OCCUPATION="${OCCUPATION:-SALARIED}"
INCOME_SLAB="${INCOME_SLAB:-L5_TO_10L}"
MARITAL_STATUS="${MARITAL_STATUS:-MARRIED}"

# Address
ADDRESS_LINE1="${ADDRESS_LINE1:-123, Test Street}"
ADDRESS_LINE2="${ADDRESS_LINE2:-Block A}"
CITY="${CITY:-Mumbai}"
STATE="${STATE:-Maharashtra}"
PINCODE="${PINCODE:-400001}"
COUNTRY="${COUNTRY:-India}"

# Child data
CHILD_NAME="${CHILD_NAME:-Aarav}"
CHILD_DOB="${CHILD_DOB:-2015-06-20}"
CHILD_GENDER="${CHILD_GENDER:-male}"

# Nominee data
NOMINEE_NAME="${NOMINEE_NAME:-Priya Kumar}"
NOMINEE_RELATIONSHIP="${NOMINEE_RELATIONSHIP:-SPOUSE}"
NOMINEE_DOB="${NOMINEE_DOB:-1992-03-10}"
NOMINEE_ALLOCATION="${NOMINEE_ALLOCATION:-100}"

# Check if token is provided
if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}❌ Missing AUTH_TOKEN${NC}"
  echo ""
  echo "Usage:"
  echo "  export K6_AUTH_TOKEN='your-token-here'"
  echo "  ./scripts/setup-test-user.sh"
  echo ""
  echo "Or get token first:"
  echo "  ./scripts/get-mobile-token.sh"
  echo "  export K6_AUTH_TOKEN=\$(cat results/mobile-token.txt)"
  echo "  ./scripts/setup-test-user.sh"
  exit 1
fi

echo -e "${BLUE}🚀 Setting up test user...${NC}"
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

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to get user ID${NC}"
  echo "Response: $USER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ User ID: ${USER_ID}${NC}"
echo ""

# ==============================================
# Step 2: Update User Profile
# ==============================================
echo -e "${YELLOW}Step 2: Updating user profile with test data...${NC}"

UPDATE_PAYLOAD=$(cat <<EOF
{
  "first_name": "${FIRST_NAME}",
  "last_name": "${LAST_NAME}",
  "email": "${EMAIL}",
  "phone_number": "+91${PHONE_NUMBER}",
  "date_of_birth": "${DATE_OF_BIRTH}",
  "gender": "${GENDER}",
  "pan_number": "${PAN_NUMBER}",
  "occupation": "${OCCUPATION}",
  "income_slab": "${INCOME_SLAB}",
  "marital_status": "${MARITAL_STATUS}",
  "address": {
    "line1": "${ADDRESS_LINE1}",
    "line2": "${ADDRESS_LINE2}",
    "city": "${CITY}",
    "state": "${STATE}",
    "pincode": "${PINCODE}",
    "country": "${COUNTRY}"
  }
}
EOF
)

UPDATE_RESPONSE=$(curl --silent --request PATCH \
  --url "${BASE_URL}/api/v1/users/${USER_ID}" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$UPDATE_PAYLOAD")

if echo "$UPDATE_RESPONSE" | grep -q "error"; then
  echo -e "${YELLOW}⚠️  Profile update may have failed (non-critical)${NC}"
  echo "Response: $UPDATE_RESPONSE"
else
  echo -e "${GREEN}✅ Profile updated${NC}"
fi
echo ""

# ==============================================
# Step 3: Initiate KYC
# ==============================================
echo -e "${YELLOW}Step 3: Initiating KYC...${NC}"

KYC_RESPONSE=$(curl --silent --request POST \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/init_kyc" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

if echo "$KYC_RESPONSE" | grep -q "error"; then
  echo -e "${YELLOW}⚠️  KYC may already be initiated${NC}"
  echo "Response: $KYC_RESPONSE"
else
  echo -e "${GREEN}✅ KYC initiated${NC}"
fi
echo ""

# ==============================================
# Step 4: Create Investor (after KYC completion)
# ==============================================
echo -e "${YELLOW}Step 4: Creating investor profile...${NC}"

INVESTOR_RESPONSE=$(curl --silent --request POST \
  --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

if echo "$INVESTOR_RESPONSE" | grep -q "error"; then
  ERROR_MSG=$(echo "$INVESTOR_RESPONSE" | jq -r '.error // .message // "Unknown error"')
  if echo "$ERROR_MSG" | grep -qi "kyc\|not completed"; then
    echo -e "${YELLOW}⚠️  Investor creation skipped - KYC not completed yet${NC}"
    echo "Note: Complete KYC first, then run this script again"
  else
    echo -e "${YELLOW}⚠️  Investor may already exist${NC}"
    echo "Response: $INVESTOR_RESPONSE"
  fi
else
  echo -e "${GREEN}✅ Investor created${NC}"
fi
echo ""

# ==============================================
# Step 5: Add Child
# ==============================================
echo -e "${YELLOW}Step 5: Adding child...${NC}"

CHILD_PAYLOAD=$(cat <<EOF
{
  "data": [{
    "first_name": "${CHILD_NAME}",
    "date_of_birth": "${CHILD_DOB}",
    "gender": "${CHILD_GENDER}",
    "relationship": "CHILD"
  }]
}
EOF
)

CHILD_RESPONSE=$(curl --silent --request POST \
  --url "${BASE_URL}/api/v1/children" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$CHILD_PAYLOAD")

CHILD_ID=$(echo "$CHILD_RESPONSE" | jq -r '.data[0].id // empty')

if [ -z "$CHILD_ID" ] || [ "$CHILD_ID" = "null" ]; then
  if echo "$CHILD_RESPONSE" | grep -qi "already exists\|duplicate"; then
    echo -e "${YELLOW}⚠️  Child may already exist${NC}"
  else
    echo -e "${RED}❌ Failed to create child${NC}"
    echo "Response: $CHILD_RESPONSE"
  fi
else
  echo -e "${GREEN}✅ Child created: ${CHILD_ID}${NC}"
fi
echo ""

# ==============================================
# Step 6: Add Nominee (Requires MFA)
# ==============================================
echo -e "${YELLOW}Step 6: Adding nominee (requires MFA)...${NC}"

# Step 6a: Start MFA Session for Nominee
echo -e "${YELLOW}  → Starting MFA session...${NC}"

MFA_START_PAYLOAD=$(cat <<EOF
{
  "action": "NOMINEE_UPDATE",
  "channel": "SMS"
}
EOF
)

MFA_START_RESPONSE=$(curl --silent --request POST \
  --url "${BASE_URL}/api/v1/auth/mfa/start" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$MFA_START_PAYLOAD")

MFA_SESSION_ID=$(echo "$MFA_START_RESPONSE" | jq -r '.mfaSessionId // .data.mfaSessionId // empty')

if [ -z "$MFA_SESSION_ID" ] || [ "$MFA_SESSION_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to start MFA session${NC}"
  echo "Response: $MFA_START_RESPONSE"
  MFA_SESSION_ID=""
else
  echo -e "${GREEN}  ✅ MFA session started${NC}"
fi

# Step 6b: Verify OTP and Get MFA Token
MFA_TOKEN=""
if [ -n "$MFA_SESSION_ID" ] && [ "$MFA_SESSION_ID" != "null" ]; then
  # Check if test mode is enabled
  if [ "${TEST_MODE:-false}" = "true" ]; then
    TEST_OTP="${TEST_OTP:-000000}"
    echo -e "${YELLOW}  → Using test OTP: ${TEST_OTP}${NC}"
    OTP_CODE="$TEST_OTP"
  else
    echo -e "${YELLOW}  → Enter the 6-digit OTP sent to your phone:${NC}"
    read -r OTP_CODE
    
    # Validate OTP
    if ! [[ "$OTP_CODE" =~ ^[0-9]{6}$ ]]; then
      echo -e "${RED}❌ Invalid OTP. Must be 6 digits.${NC}"
      OTP_CODE=""
    fi
  fi
  
  if [ -n "$OTP_CODE" ]; then
    echo -e "${YELLOW}  → Verifying OTP...${NC}"
    
    MFA_VERIFY_PAYLOAD=$(cat <<EOF
{
  "mfaSessionId": "${MFA_SESSION_ID}",
  "otp": "${OTP_CODE}"
}
EOF
    )
    
    MFA_VERIFY_RESPONSE=$(curl --silent --request POST \
      --url "${BASE_URL}/api/v1/auth/mfa/verify" \
      --header "Authorization: Bearer ${AUTH_TOKEN}" \
      --header "Content-Type: application/json" \
      --data "$MFA_VERIFY_PAYLOAD")
    
    MFA_TOKEN=$(echo "$MFA_VERIFY_RESPONSE" | jq -r '.mfaToken // .data.mfaToken // empty')
    
    if [ -z "$MFA_TOKEN" ] || [ "$MFA_TOKEN" = "null" ]; then
      echo -e "${RED}❌ Failed to verify OTP${NC}"
      echo "Response: $MFA_VERIFY_RESPONSE"
      echo -e "${YELLOW}⚠️  Skipping nominee creation (MFA required)${NC}"
    else
      echo -e "${GREEN}  ✅ MFA token obtained${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Skipping nominee creation (MFA required)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping nominee creation (MFA session failed)${NC}"
fi

# Step 6c: Add Nominee with MFA Token
NOMINEE_ID=""
if [ -n "$MFA_TOKEN" ] && [ "$MFA_TOKEN" != "null" ]; then
  echo -e "${YELLOW}  → Creating nominee...${NC}"
  
  NOMINEE_PAYLOAD=$(cat <<EOF
{
  "data": [{
    "name": "${NOMINEE_NAME}",
    "relationship": "${NOMINEE_RELATIONSHIP}",
    "date_of_birth": "${NOMINEE_DOB}",
    "allocation": ${NOMINEE_ALLOCATION},
    "address": {
      "address_line": "${ADDRESS_LINE1}",
      "city": "${CITY}",
      "state": "${STATE}",
      "pin_code": "${PINCODE}",
      "country": "in"
    }
  }]
}
EOF
  )
  
  NOMINEE_RESPONSE=$(curl --silent --request POST \
    --url "${BASE_URL}/api/v1/users/nominees" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "X-MFA-Token: ${MFA_TOKEN}" \
    --header "Content-Type: application/json" \
    --data "$NOMINEE_PAYLOAD")
  
  NOMINEE_ID=$(echo "$NOMINEE_RESPONSE" | jq -r '.data[0].id // empty')
fi

if [ -z "$NOMINEE_ID" ] || [ "$NOMINEE_ID" = "null" ]; then
  if [ -n "$NOMINEE_RESPONSE" ]; then
    if echo "$NOMINEE_RESPONSE" | grep -qi "already exists\|duplicate"; then
      echo -e "${YELLOW}⚠️  Nominee may already exist${NC}"
    else
      echo -e "${RED}❌ Failed to create nominee${NC}"
      echo "Response: $NOMINEE_RESPONSE"
    fi
  fi
else
  echo -e "${GREEN}✅ Nominee created: ${NOMINEE_ID}${NC}"
fi
echo ""

# ==============================================
# Summary
# ==============================================
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Setup Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}User ID:${NC} ${USER_ID}"
echo -e "${BLUE}Name:${NC} ${FIRST_NAME} ${LAST_NAME}"
echo -e "${BLUE}Email:${NC} ${EMAIL}"
echo -e "${BLUE}Phone:${NC} +91${PHONE_NUMBER}"
if [ -n "$CHILD_ID" ] && [ "$CHILD_ID" != "null" ]; then
  echo -e "${BLUE}Child:${NC} ${CHILD_NAME} (ID: ${CHILD_ID})"
fi
if [ -n "$NOMINEE_ID" ] && [ "$NOMINEE_ID" != "null" ]; then
  echo -e "${BLUE}Nominee:${NC} ${NOMINEE_NAME} (ID: ${NOMINEE_ID})"
fi
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# Save user info to file
mkdir -p results
cat > results/test-user-info.json <<EOF
{
  "user_id": "${USER_ID}",
  "first_name": "${FIRST_NAME}",
  "last_name": "${LAST_NAME}",
  "email": "${EMAIL}",
  "phone_number": "+91${PHONE_NUMBER}",
  "child_id": "${CHILD_ID}",
  "nominee_id": "${NOMINEE_ID}",
  "setup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 User info saved to: results/test-user-info.json${NC}"
echo ""
echo -e "${GREEN}✅ Test user setup complete!${NC}"
echo ""
if [ -z "$NOMINEE_ID" ] || [ "$NOMINEE_ID" = "null" ]; then
  echo -e "${YELLOW}Note: Nominee creation requires MFA verification.${NC}"
  echo -e "${YELLOW}To add nominee, run with TEST_MODE=true and TEST_OTP if backend supports it:${NC}"
  echo -e "${CYAN}  export TEST_MODE=true${NC}"
  echo -e "${CYAN}  export TEST_OTP=000000${NC}"
  echo -e "${CYAN}  ./scripts/setup-test-user.sh${NC}"
fi
