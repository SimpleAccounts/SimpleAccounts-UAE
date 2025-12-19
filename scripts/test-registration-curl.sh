#!/bin/bash

# Script to test registration using curl
# This script clears the database, then tests registration with curl

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Registration with curl${NC}"
echo ""

# Step 1: Clear database
echo -e "${GREEN}Step 1: Clearing database...${NC}"
"$SCRIPT_DIR/clear-database-auto.sh" --force
echo ""

# Step 2: Wait a moment for backend to be ready
sleep 2

# Step 3: Get required data
echo -e "${GREEN}Step 2: Fetching required data...${NC}"

# Get a company type (first one)
COMPANY_TYPE=$(curl -s http://localhost:8080/rest/company/getCompanyType | jq -r '.[0].value')
echo "Company Type: $COMPANY_TYPE"

# Get states for UAE (countryId=229)
STATES_JSON=$(curl -s "http://localhost:8080/rest/common/getState?countryId=229" 2>&1)
if echo "$STATES_JSON" | grep -q "error"; then
    echo -e "${YELLOW}Warning: Could not fetch states. Using default state ID.${NC}"
    STATE_ID="3798"  # Default Dubai state ID
else
    STATE_ID=$(echo "$STATES_JSON" | jq -r '.[0].stateId // empty')
    if [ -z "$STATE_ID" ]; then
        STATE_ID="3798"  # Default Dubai state ID
    fi
fi
echo "State ID: $STATE_ID"

# Currency code for UAE Dirham
CURRENCY_CODE="150"
echo "Currency Code: $CURRENCY_CODE"

echo ""

# Step 4: Test registration
echo -e "${GREEN}Step 3: Testing registration...${NC}"

# Create FormData using curl
REGISTRATION_URL="http://localhost:8080/rest/company/register"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$REGISTRATION_URL" \
  -F "companyName=Test Company" \
  -F "currencyCode=$CURRENCY_CODE" \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "email=test@example.com" \
  -F "timeZone=Asia/Dubai" \
  -F "countryId=229" \
  -F "stateId=$STATE_ID" \
  -F "phoneNumber=971501234567" \
  -F "IsDesignatedZone=false" \
  -F "companyTypeCode=$COMPANY_TYPE" \
  -F "companyAddressLine1=123 Test Street" \
  -F "companyAddressLine2=" \
  -F "loginUrl=http://localhost:3000" \
  -F "password=Test@1234")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status Code: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Registration successful!${NC}"
    
    # Verify company count
    echo ""
    echo -e "${GREEN}Step 4: Verifying registration...${NC}"
    COMPANY_COUNT=$(curl -s http://localhost:8080/rest/company/getCompanyCount)
    echo "Company Count: $COMPANY_COUNT"
    
    if [ "$COMPANY_COUNT" = "1" ]; then
        echo -e "${GREEN}✅ Company count verified: 1${NC}"
    else
        echo -e "${RED}❌ Expected company count 1, got $COMPANY_COUNT${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Registration failed with HTTP $HTTP_CODE${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"

