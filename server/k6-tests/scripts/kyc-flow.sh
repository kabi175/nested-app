#!/bin/bash

# ==============================================
# Complete KYC Flow Script
# Initiates KYC and guides through verification steps
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
  echo "  ./scripts/kyc-flow.sh"
  exit 1
fi

echo -e "${BLUE}🔐 KYC Flow Script${NC}"
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
KYC_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data[0].kycStatus // .data[0].kyc_status // "unknown"')

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to get user ID${NC}"
  echo "Response: $USER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ User ID: ${USER_ID}${NC}"
echo -e "${BLUE}Current KYC Status: ${KYC_STATUS}${NC}"
echo ""

# ==============================================
# Step 2: Initiate KYC
# ==============================================
if [ "$KYC_STATUS" = "unknown" ] || [ "$KYC_STATUS" = "pending" ]; then
  echo -e "${YELLOW}Step 2: Initiating KYC...${NC}"
  
  KYC_RESPONSE=$(curl --silent --request POST \
    --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/init_kyc" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  if echo "$KYC_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Failed to initiate KYC${NC}"
    echo "Response: $KYC_RESPONSE"
    exit 1
  fi
  
  echo -e "${GREEN}✅ KYC initiated successfully${NC}"
  echo -e "${BLUE}Status changed to: AADHAAR_PENDING${NC}"
  echo ""
  sleep 1
else
  echo -e "${YELLOW}Step 2: KYC already initiated (Status: ${KYC_STATUS})${NC}"
  echo ""
fi

# ==============================================
# Step 3: Aadhaar Upload
# ==============================================
if [ "$KYC_STATUS" = "aadhaar_pending" ] || [ "$KYC_STATUS" = "AADHAAR_PENDING" ]; then
  echo -e "${YELLOW}Step 3: Getting Aadhaar upload redirect URL...${NC}"
  
  # Get response with HTTP status code
  AADHAAR_HTTP_CODE=$(curl --silent --write-out "%{http_code}" --output /tmp/aadhaar_response.json \
    --request POST \
    --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/aadhaar_upload" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  AADHAAR_RESPONSE=$(cat /tmp/aadhaar_response.json 2>/dev/null || echo "{}")
  
  echo -e "${BLUE}HTTP Status: ${AADHAAR_HTTP_CODE}${NC}"
  
  # Check HTTP status codes
  if [ "$AADHAAR_HTTP_CODE" = "202" ]; then
    # 202 Accepted means Aadhaar is already completed
    echo -e "${GREEN}✅ Aadhaar verification already completed (202 Accepted)${NC}"
    echo -e "${YELLOW}Note: Status may update shortly. Checking current status...${NC}"
    echo ""
    sleep 2
    
    # Refresh status
    USER_RESPONSE=$(curl --silent --request GET \
      --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
      --header "Authorization: Bearer ${AUTH_TOKEN}" \
      --header "Content-Type: application/json")
    
    UPDATED_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data[0].kycStatus // .data[0].kyc_status // "unknown"')
    echo -e "${BLUE}Updated KYC Status: ${UPDATED_STATUS}${NC}"
    echo ""
  elif [ "$AADHAAR_HTTP_CODE" = "201" ] || [ "$AADHAAR_HTTP_CODE" = "200" ]; then
    # Try multiple JSON paths for redirect URL
    REDIRECT_URL=$(echo "$AADHAAR_RESPONSE" | jq -r '.redirectUrl // .redirect_url // .data.redirectUrl // .data.redirect_url // empty' 2>/dev/null || echo "")
    
    if [ -z "$REDIRECT_URL" ] || [ "$REDIRECT_URL" = "null" ]; then
      echo -e "${YELLOW}⚠️  No redirect URL found in response${NC}"
      echo ""
      echo -e "${CYAN}Full Response:${NC}"
      echo "$AADHAAR_RESPONSE" | jq '.' 2>/dev/null || echo "$AADHAAR_RESPONSE"
      echo ""
      echo -e "${YELLOW}Possible reasons:${NC}"
      echo "  1. Aadhaar document already exists in KYC service"
      echo "  2. KYC service returned different response format"
      echo "  3. External KYC service may be unavailable"
      echo ""
      echo -e "${CYAN}Try checking KYC status again or contact support${NC}"
    else
      echo -e "${GREEN}✅ Aadhaar upload URL obtained${NC}"
      echo ""
      echo -e "${CYAN}════════════════════════════════════════════════${NC}"
      echo -e "${CYAN}  Aadhaar Verification Required${NC}"
      echo -e "${CYAN}════════════════════════════════════════════════${NC}"
      echo ""
      echo -e "${YELLOW}Redirect URL:${NC}"
      echo "$REDIRECT_URL"
      echo ""
      echo -e "${YELLOW}Instructions:${NC}"
      echo "1. Open the URL above in your browser"
      echo "2. Complete Aadhaar verification on the external service"
      echo "3. After completion, the status will automatically update to E_SIGN_PENDING"
      echo "4. Run this script again to proceed with e-sign"
      echo ""
      
      # Try to open URL automatically
      if command -v xdg-open &> /dev/null; then
        xdg-open "$REDIRECT_URL" 2>/dev/null &
        echo -e "${GREEN}🌐 Opened URL in default browser${NC}"
      elif command -v open &> /dev/null; then
        open "$REDIRECT_URL" 2>/dev/null &
        echo -e "${GREEN}🌐 Opened URL in default browser${NC}"
      else
        echo -e "${CYAN}Copy and paste the URL above into your browser${NC}"
      fi
    fi
  else
    echo -e "${RED}❌ Failed to get Aadhaar upload URL${NC}"
    echo -e "${RED}HTTP Status: ${AADHAAR_HTTP_CODE}${NC}"
    echo ""
    echo -e "${CYAN}Response:${NC}"
    echo "$AADHAAR_RESPONSE" | jq '.' 2>/dev/null || echo "$AADHAAR_RESPONSE"
    echo ""
  fi
  echo ""
else
  echo -e "${YELLOW}Step 3: Aadhaar verification not required (Status: ${KYC_STATUS})${NC}"
  echo ""
fi

# ==============================================
# Step 4: E-Sign Upload
# ==============================================
# Refresh user status
USER_RESPONSE=$(curl --silent --request GET \
  --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

KYC_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data[0].kycStatus // .data[0].kyc_status // "unknown"')

if [ "$KYC_STATUS" = "esign_pending" ] || [ "$KYC_STATUS" = "E_SIGN_PENDING" ]; then
  echo -e "${YELLOW}Step 4: Getting e-sign upload redirect URL...${NC}"
  
  ESIGN_RESPONSE=$(curl --silent --request POST \
    --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/esign_upload" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  # Get HTTP status code
  ESIGN_HTTP_CODE=$(curl --silent --write-out "%{http_code}" --output /tmp/esign_response.json \
    --request POST \
    --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/esign_upload" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  ESIGN_RESPONSE=$(cat /tmp/esign_response.json 2>/dev/null || echo "{}")
  ESIGN_REDIRECT_URL=$(echo "$ESIGN_RESPONSE" | jq -r '.redirectUrl // .redirect_url // .data.redirectUrl // .data.redirect_url // empty' 2>/dev/null || echo "")
  
  echo -e "${BLUE}HTTP Status: ${ESIGN_HTTP_CODE}${NC}"
  
  if [ "$ESIGN_HTTP_CODE" = "202" ]; then
    echo -e "${GREEN}✅ E-sign already completed (202 Accepted)${NC}"
    echo -e "${YELLOW}Status may update shortly...${NC}"
  elif [ -z "$ESIGN_REDIRECT_URL" ] || [ "$ESIGN_REDIRECT_URL" = "null" ]; then
    echo -e "${YELLOW}⚠️  No redirect URL returned${NC}"
    echo ""
    echo -e "${CYAN}Full Response:${NC}"
    echo "$ESIGN_RESPONSE" | jq '.' 2>/dev/null || echo "$ESIGN_RESPONSE"
    echo ""
    echo -e "${CYAN}Note: E-sign may require manual completion${NC}"
  else
    echo -e "${GREEN}✅ E-sign upload URL obtained${NC}"
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  E-Sign Verification Required${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Redirect URL:${NC}"
    echo "$ESIGN_REDIRECT_URL"
    echo ""
    echo -e "${YELLOW}Instructions:${NC}"
    echo "1. Open the URL above in your browser"
    echo "2. Complete e-signature on the external service"
    echo "3. After completion, status will update to SUBMITTED"
    echo "4. KYC will be reviewed and status will change to COMPLETED"
    echo ""
    echo -e "${CYAN}Or open URL directly:${NC}"
    echo "xdg-open \"$ESIGN_REDIRECT_URL\" 2>/dev/null || open \"$ESIGN_REDIRECT_URL\" 2>/dev/null || echo \"$ESIGN_REDIRECT_URL\""
    echo ""
    
    # Try to open URL automatically
    if command -v xdg-open &> /dev/null; then
      xdg-open "$ESIGN_REDIRECT_URL" 2>/dev/null &
    elif command -v open &> /dev/null; then
      open "$ESIGN_REDIRECT_URL" 2>/dev/null &
    fi
  fi
  echo ""
else
  echo -e "${YELLOW}Step 4: E-sign verification not required (Status: ${KYC_STATUS})${NC}"
  echo ""
fi

# ==============================================
# Step 5: Check Final Status
# ==============================================
echo -e "${YELLOW}Step 5: Checking final KYC status...${NC}"

# Wait a moment for status to update
sleep 2

USER_RESPONSE=$(curl --silent --request GET \
  --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json")

FINAL_KYC_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data[0].kycStatus // .data[0].kyc_status // "unknown"')
IS_READY_TO_INVEST=$(echo "$USER_RESPONSE" | jq -r '.data[0].is_ready_to_invest // .data[0].isReadyToInvest // false')

echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           KYC Status Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}User ID:${NC} ${USER_ID}"
echo -e "${BLUE}KYC Status:${NC} ${FINAL_KYC_STATUS}"
echo -e "${BLUE}Ready to Invest:${NC} ${IS_READY_TO_INVEST}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# Status interpretation
case "$FINAL_KYC_STATUS" in
  "unknown"|"pending")
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  → Run this script again to initiate KYC"
    ;;
  "aadhaar_pending"|"AADHAAR_PENDING")
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  → Complete Aadhaar verification using the redirect URL above"
    echo "  → Run this script again after Aadhaar verification"
    ;;
  "esign_pending"|"E_SIGN_PENDING")
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  → Complete e-signature using the redirect URL above"
    echo "  → Run this script again after e-sign completion"
    ;;
  "submitted"|"SUBMITTED")
    echo -e "${YELLOW}📋 Status:${NC}"
    echo "  → KYC is submitted and under review"
    echo "  → In dev environment, KYC may auto-complete in ~10 seconds"
    echo "  → Run this script again to check completion status"
    ;;
  "completed"|"COMPLETED")
    echo -e "${GREEN}✅ KYC Completed Successfully!${NC}"
    echo ""
    
    # Check if investor needs to be created
    if [ "$IS_READY_TO_INVEST" != "true" ]; then
      echo -e "${YELLOW}Step 6: Creating investor profile (mandatory after KYC)...${NC}"
      
      INVESTOR_RESPONSE=$(curl --silent --request POST \
        --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
        --header "Authorization: Bearer ${AUTH_TOKEN}" \
        --header "Content-Type: application/json")
      
      INVESTOR_HTTP_STATUS=$(curl --silent --write-out "%{http_code}" --output /dev/null \
        --request POST \
        --url "${BASE_URL}/api/v1/users/${USER_ID}/actions/create_investor" \
        --header "Authorization: Bearer ${AUTH_TOKEN}" \
        --header "Content-Type: application/json")
      
      if [ "$INVESTOR_HTTP_STATUS" = "200" ] || [ "$INVESTOR_HTTP_STATUS" = "201" ] || [ "$INVESTOR_HTTP_STATUS" = "204" ]; then
        echo -e "${GREEN}✅ Investor created successfully${NC}"
        echo ""
        
        # Refresh user status
        sleep 1
        USER_RESPONSE=$(curl --silent --request GET \
          --url "${BASE_URL}/api/v1/users?type=CURRENT_USER" \
          --header "Authorization: Bearer ${AUTH_TOKEN}" \
          --header "Content-Type: application/json")
        
        IS_READY_TO_INVEST=$(echo "$USER_RESPONSE" | jq -r '.data[0].is_ready_to_invest // .data[0].isReadyToInvest // false')
        
        if [ "$IS_READY_TO_INVEST" = "true" ]; then
          echo -e "${GREEN}✅ User is now ready to invest!${NC}"
        fi
      else
        ERROR_MSG=$(echo "$INVESTOR_RESPONSE" | jq -r '.error // .message // empty' 2>/dev/null || echo "")
        if echo "$ERROR_MSG" | grep -qi "already\|exists"; then
          echo -e "${YELLOW}⚠️  Investor may already exist${NC}"
        else
          echo -e "${YELLOW}⚠️  Investor creation failed: ${ERROR_MSG}${NC}"
          echo "HTTP Status: $INVESTOR_HTTP_STATUS"
        fi
      fi
      echo ""
    else
      echo -e "${GREEN}✅ Investor already created (user is ready to invest)${NC}"
      echo ""
    fi
    
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  → Create bank account:"
    echo "    ./scripts/create-bank.sh"
    echo "  → Create goal:"
    echo "    ./scripts/create-goal.sh"
    echo "  → Test investment journey:"
    echo "    k6 run --vus 1 --iterations 1 journeys/investment-journey.js"
    ;;
  "failed"|"FAILED")
    echo -e "${RED}❌ KYC Verification Failed${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  → Review the error and retry KYC"
    echo "  → Contact support if issue persists"
    ;;
  *)
    echo -e "${YELLOW}📋 Status: ${FINAL_KYC_STATUS}${NC}"
    ;;
esac

echo ""

# Save status to file
mkdir -p results
cat > results/kyc-status.json <<EOF
{
  "user_id": "${USER_ID}",
  "kyc_status": "${FINAL_KYC_STATUS}",
  "is_ready_to_invest": ${IS_READY_TO_INVEST},
  "checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 Status saved to: results/kyc-status.json${NC}"
