#!/bin/bash

# Test script for Bulkpe Reverse Penny Drop Webhook
# Usage: ./test-webhook.sh [base-url]

BASE_URL="${1:-http://localhost:8080}"
ENDPOINT="${BASE_URL}/public/webhooks/bulkpe/reverse-penny-drop"

echo "Testing Bulkpe Webhook Endpoint"
echo "================================"
echo "Endpoint: ${ENDPOINT}"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Success Response
echo -e "${YELLOW}Test 1: Success Response${NC}"
echo "Sending webhook with SUCCESS transaction status..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": true,
    "statusCode": 200,
    "data": {
      "transcation_id": "TRAREF00032879984",
      "trx_status": "SUCCESS",
      "remitter_name": "Richar Hendricks",
      "remitter_account_number": "50103847384345",
      "remitter_ifsc": "HDFC0001005",
      "remitter_vpa": "9274982424444@axisbank",
      "amount": 1,
      "charge": 2,
      "gst": 0.36,
      "settlement_Amount": "1.00",
      "closing_balance": "254.46",
      "yetToSettle": "255.82",
      "type": "Credit",
      "utr": "418328140937",
      "payment_mode": "UPI",
      "payment_remark": "",
      "createdAt": "2024-07-01T11:58:40.320Z",
      "reference_id": "1"
    },
    "message": ""
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: ${HTTP_CODE}"
echo "Response: ${BODY}"
if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Test 1 Passed${NC}"
else
  echo -e "${RED}✗ Test 1 Failed${NC}"
fi
echo ""

