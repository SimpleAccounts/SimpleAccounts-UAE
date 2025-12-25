#!/bin/bash

# Contact API Integration Tests
# Usage: ./scripts/test-contact-api.sh [token]

set -e

BASE_URL="${SIMPLEACCOUNTS_HOST:-http://localhost:8080}"
TOKEN="${1:-${E2E_TOKEN}}"

if [ -z "$TOKEN" ]; then
  echo "❌ Error: Token required"
  echo "Usage: ./scripts/test-contact-api.sh <token>"
  echo "   or: E2E_TOKEN=<token> ./scripts/test-contact-api.sh"
  exit 1
fi

echo "🧪 Testing Contact API Endpoints"
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=${5:-200}

  echo -n "Testing $name... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" = "PUT" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $http_code)"
    echo "  Response: $body"
    ((FAILED++))
    return 1
  fi
}

# 1. Get Contact List
echo "1. Testing GET /rest/contact/getContactList"
test_endpoint "Get Contact List" \
  "GET" \
  "$BASE_URL/rest/contact/getContactList?pageNo=1&pageSize=10"

# 2. Get Contacts for Dropdown
echo ""
echo "2. Testing GET /rest/contact/getContactsForDropdown"
test_endpoint "Get Contacts for Dropdown" \
  "GET" \
  "$BASE_URL/rest/contact/getContactsForDropdown?contactType=1"

# 3. Get Country List
echo ""
echo "3. Testing GET /rest/contact/getCountryList"
test_endpoint "Get Country List" \
  "GET" \
  "$BASE_URL/rest/contact/getCountryList"

# 4. Get State List (assuming UAE country ID is 1)
echo ""
echo "4. Testing GET /rest/contact/getStateList"
test_endpoint "Get State List" \
  "GET" \
  "$BASE_URL/rest/contact/getStateList?countryId=1"

# 5. Get Contact Type List
echo ""
echo "5. Testing GET /rest/contact/getContactTypeList"
test_endpoint "Get Contact Type List" \
  "GET" \
  "$BASE_URL/rest/contact/getContactTypeList"

# 6. Create Contact
echo ""
echo "6. Testing POST /rest/contact/save (Create)"
CONTACT_DATA=$(cat <<EOF
{
  "firstName": "Test",
  "lastName": "Contact $(date +%s)",
  "email": "test$(date +%s)@example.com",
  "phone": "+971501234567",
  "contactType": 1,
  "isActive": true,
  "deleteFlag": false
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/rest/contact/save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CONTACT_DATA")

CREATE_STATUS=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$BASE_URL/rest/contact/save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CONTACT_DATA")

if [ "$CREATE_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} (HTTP $CREATE_STATUS)"
  CONTACT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"contactId":[0-9]*' | cut -d: -f2 || echo "")
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Expected HTTP 200, got $CREATE_STATUS)"
  echo "  Response: $CREATE_RESPONSE"
  ((FAILED++))
fi

# 7. Get Contact by ID (if created successfully)
if [ -n "$CONTACT_ID" ]; then
  echo ""
  echo "7. Testing GET /rest/contact/getContactById"
  test_endpoint "Get Contact by ID" \
    "GET" \
    "$BASE_URL/rest/contact/getContactById?id=$CONTACT_ID"

  # 8. Update Contact
  echo ""
  echo "8. Testing POST /rest/contact/update (Update)"
  UPDATE_DATA=$(cat <<EOF
{
  "contactId": $CONTACT_ID,
  "firstName": "Updated",
  "lastName": "Contact",
  "email": "updated$(date +%s)@example.com",
  "phone": "+971501234567",
  "contactType": 1,
  "isActive": true,
  "deleteFlag": false
}
EOF
)
  test_endpoint "Update Contact" \
    "POST" \
    "$BASE_URL/rest/contact/update" \
    "$UPDATE_DATA"

  # 9. Delete Contact (cleanup)
  echo ""
  echo "9. Testing DELETE /rest/contact/delete (Cleanup)"
  test_endpoint "Delete Contact" \
    "DELETE" \
    "$BASE_URL/rest/contact/delete?id=$CONTACT_ID"
else
  echo ""
  echo -e "${YELLOW}⚠ Skipping Get/Update/Delete tests (contact creation failed)${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi


