#!/bin/bash

# ==============================================
# Create Goal Script
# Creates a goal for testing investment journey
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

# Goal data (can be overridden via environment variables)
GOAL_TITLE="${GOAL_TITLE:-Education Goal for Child}"
GOAL_TARGET_AMOUNT="${GOAL_TARGET_AMOUNT:-500000}"
GOAL_TARGET_DATE="${GOAL_TARGET_DATE:-$(date -d '+10 years' +%Y-%m-%d 2>/dev/null || date -v+10y +%Y-%m-%d 2>/dev/null || echo '2034-01-01')}"

# Check if token is provided
if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}❌ Missing K6_AUTH_TOKEN${NC}"
  echo ""
  echo "Usage:"
  echo "  export K6_AUTH_TOKEN='your-token-here'"
  echo "  ./scripts/create-goal.sh"
  echo ""
  echo "Optional variables:"
  echo "  GOAL_TITLE='My Goal Title'"
  echo "  GOAL_TARGET_AMOUNT=1000000"
  echo "  GOAL_TARGET_DATE='2035-12-31'"
  echo "  CHILD_ID='123'  # Skip child selection"
  echo "  BASKET_ID='456'  # Skip basket selection"
  exit 1
fi

echo -e "${BLUE}🎯 Goal Creation Script${NC}"
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
# Step 2: Get Children
# ==============================================
if [ -z "$CHILD_ID" ]; then
  echo -e "${YELLOW}Step 2: Fetching children...${NC}"
  
  CHILDREN_RESPONSE=$(curl --silent --request GET \
    --url "${BASE_URL}/api/v1/children" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  CHILDREN_COUNT=$(echo "$CHILDREN_RESPONSE" | jq -r '.data | length // 0')
  
  if [ "$CHILDREN_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No children found. Please create a child first:${NC}"
    echo "  ./scripts/setup-test-user.sh"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Found ${CHILDREN_COUNT} child(ren)${NC}"
  
  # Get first child ID
  CHILD_ID=$(echo "$CHILDREN_RESPONSE" | jq -r '.data[0].id // empty')
  CHILD_NAME=$(echo "$CHILDREN_RESPONSE" | jq -r '.data[0].name // .data[0].first_name // "Child"')
  
  if [ -z "$CHILD_ID" ] || [ "$CHILD_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to get child ID${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Using child: ${CHILD_NAME} (ID: ${CHILD_ID})${NC}"
  echo ""
else
  echo -e "${YELLOW}Step 2: Using provided CHILD_ID: ${CHILD_ID}${NC}"
  echo ""
fi

# ==============================================
# Step 3: Get Baskets
# ==============================================
if [ -z "$BASKET_ID" ]; then
  echo -e "${YELLOW}Step 3: Fetching baskets...${NC}"
  
  BASKETS_RESPONSE=$(curl --silent --request GET \
    --url "${BASE_URL}/api/v1/bucket" \
    --header "Authorization: Bearer ${AUTH_TOKEN}" \
    --header "Content-Type: application/json")
  
  BASKETS_COUNT=$(echo "$BASKETS_RESPONSE" | jq -r '.data | length // 0')
  
  if [ "$BASKETS_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No baskets found. Goal will be created without basket (will auto-select)${NC}"
    BASKET_ID=""
  else
    echo -e "${GREEN}✅ Found ${BASKETS_COUNT} basket(s)${NC}"
    
    # Get first basket ID
    BASKET_ID=$(echo "$BASKETS_RESPONSE" | jq -r '.data[0].id // empty')
    BASKET_NAME=$(echo "$BASKETS_RESPONSE" | jq -r '.data[0].title // .data[0].name // "Basket"')
    
    if [ -n "$BASKET_ID" ] && [ "$BASKET_ID" != "null" ]; then
      echo -e "${BLUE}Using basket: ${BASKET_NAME} (ID: ${BASKET_ID})${NC}"
    else
      BASKET_ID=""
    fi
  fi
  echo ""
else
  echo -e "${YELLOW}Step 3: Using provided BASKET_ID: ${BASKET_ID}${NC}"
  echo ""
fi

# ==============================================
# Step 4: Create Goal
# ==============================================
echo -e "${YELLOW}Step 4: Creating goal...${NC}"

# Build goal payload
GOAL_PAYLOAD=$(cat <<EOF
{
  "data": [{
    "title": "${GOAL_TITLE}",
    "target_amount": ${GOAL_TARGET_AMOUNT},
    "target_date": "${GOAL_TARGET_DATE}",
    "child": {
      "id": "${CHILD_ID}"
    }$(if [ -n "$BASKET_ID" ] && [ "$BASKET_ID" != "null" ]; then echo ",
    \"basket\": {
      \"id\": \"${BASKET_ID}\"
    }"; fi)
  }]
}
EOF
)

echo -e "${CYAN}Goal Payload:${NC}"
echo "$GOAL_PAYLOAD" | jq '.' 2>/dev/null || echo "$GOAL_PAYLOAD"
echo ""

# Get response with HTTP status
HTTP_STATUS=$(curl --silent --write-out "%{http_code}" --output /tmp/goal_response.json \
  --request POST \
  --url "${BASE_URL}/api/v1/goals" \
  --header "Authorization: Bearer ${AUTH_TOKEN}" \
  --header "Content-Type: application/json" \
  --data "$GOAL_PAYLOAD")

GOAL_RESPONSE=$(cat /tmp/goal_response.json 2>/dev/null || echo "{}")
GOAL_ID=$(echo "$GOAL_RESPONSE" | jq -r '.data[0].id // empty')

if [ "$HTTP_STATUS" != "200" ] && [ "$HTTP_STATUS" != "201" ]; then
  echo -e "${RED}❌ Failed to create goal${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $GOAL_RESPONSE"
  exit 1
fi

if [ -z "$GOAL_ID" ] || [ "$GOAL_ID" = "null" ]; then
  echo -e "${RED}❌ Goal created but ID not found in response${NC}"
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response: $GOAL_RESPONSE"
  exit 1
fi

GOAL_TITLE_RESPONSE=$(echo "$GOAL_RESPONSE" | jq -r '.data[0].title // empty')
GOAL_TARGET_AMOUNT_RESPONSE=$(echo "$GOAL_RESPONSE" | jq -r '.data[0].target_amount // empty')
GOAL_STATUS=$(echo "$GOAL_RESPONSE" | jq -r '.data[0].status // empty')

echo -e "${GREEN}✅ Goal created successfully!${NC}"
echo ""

# ==============================================
# Summary
# ==============================================
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Goal Creation Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Goal ID:${NC} ${GOAL_ID}"
echo -e "${BLUE}Title:${NC} ${GOAL_TITLE_RESPONSE}"
echo -e "${BLUE}Target Amount:${NC} ₹${GOAL_TARGET_AMOUNT_RESPONSE}"
echo -e "${BLUE}Target Date:${NC} ${GOAL_TARGET_DATE}"
echo -e "${BLUE}Status:${NC} ${GOAL_STATUS}"
echo -e "${BLUE}Child ID:${NC} ${CHILD_ID}"
if [ -n "$BASKET_ID" ] && [ "$BASKET_ID" != "null" ]; then
  echo -e "${BLUE}Basket ID:${NC} ${BASKET_ID}"
fi
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

# Save goal info to file
mkdir -p results
cat > results/goal-info.json <<EOF
{
  "goal_id": "${GOAL_ID}",
  "title": "${GOAL_TITLE_RESPONSE}",
  "target_amount": ${GOAL_TARGET_AMOUNT_RESPONSE},
  "target_date": "${GOAL_TARGET_DATE}",
  "status": "${GOAL_STATUS}",
  "child_id": "${CHILD_ID}",
  "basket_id": "${BASKET_ID:-null}",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}💾 Goal info saved to: results/goal-info.json${NC}"
echo ""

# Show next steps
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "  → Goal is ready for investment journey testing"
echo "  → Run investment journey test:"
echo "    k6 run --vus 1 --iterations 1 journeys/investment-journey.js"
echo ""

echo -e "${GREEN}✅ Goal creation complete!${NC}"
