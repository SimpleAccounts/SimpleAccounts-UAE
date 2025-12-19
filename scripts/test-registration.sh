#!/bin/bash

# Test script for registration workflow
# This script clears the database, tests registration with curl, and verifies the result

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Testing Registration Workflow ==="
echo ""

# Step 1: Clear database
echo "Step 1: Clearing database..."
bash "$SCRIPT_DIR/clear-database-auto.sh" > /dev/null 2>&1
echo "✓ Database cleared"
echo ""

# Step 2: Wait for backend to be ready
echo "Step 2: Waiting for backend to be ready..."
sleep 3

# Step 3: Test registration with curl
echo "Step 3: Testing registration with curl..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "http://localhost:8080/rest/company/register" \
  -F "companyName=Test Company" \
  -F "currencyCode=150" \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "email=test@example.com" \
  -F "timeZone=Asia/Dubai" \
  -F "countryId=229" \
  -F "stateId=3798" \
  -F "phoneNumber=971501234567" \
  -F "IsDesignatedZone=false" \
  -F "companyTypeCode=136" \
  -F "companyAddressLine1=Test Address" \
  -F "loginUrl=http://localhost:3000" \
  -F "password=Test@1234")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Response body: $BODY"
echo "HTTP Status: $HTTP_STATUS"
echo ""

# Step 4: Verify registration succeeded
echo "Step 4: Verifying registration in database..."
if docker ps | grep -q "simpleaccounts-db"; then
    COMPANY_COUNT=$(docker exec simpleaccounts-db psql -U simpleaccounts_db_user -d simpleaccounts_db -t -c "SELECT COUNT(*) FROM company;" | tr -d ' ')
    USER_COUNT=$(docker exec simpleaccounts-db psql -U simpleaccounts_db_user -d simpleaccounts_db -t -c "SELECT COUNT(*) FROM sa_user;" | tr -d ' ')
    
    echo "Company count: $COMPANY_COUNT"
    echo "User count: $USER_COUNT"
    echo ""
    
    if [ "$COMPANY_COUNT" = "1" ] && [ "$USER_COUNT" = "1" ]; then
        echo "✓ Registration succeeded in database"
        if [ "$HTTP_STATUS" = "200" ]; then
            echo "✓ HTTP response is 200"
            echo ""
            echo "=== Registration Test: PASSED ==="
            exit 0
        else
            echo "⚠ HTTP response is $HTTP_STATUS (expected 200)"
            echo "Response: $BODY"
            echo ""
            echo "=== Registration Test: PARTIAL SUCCESS ==="
            echo "Registration succeeded but HTTP response indicates error"
            exit 1
        fi
    else
        echo "✗ Registration failed - company count: $COMPANY_COUNT, user count: $USER_COUNT"
        echo ""
        echo "=== Registration Test: FAILED ==="
        exit 1
    fi
else
    echo "✗ Database container not running"
    exit 1
fi

