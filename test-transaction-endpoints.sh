#!/bin/bash

# Test script to verify transaction endpoints are working
# Usage: ./test-transaction-endpoints.sh

echo "Testing Transaction Endpoints..."
echo "================================"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  sleep 2
done

# Test 1: Get Transaction Types
echo ""
echo "Test 1: GET /rest/datalist/getTransactionTypes"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:8080/rest/datalist/getTransactionTypes 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS: Transaction types endpoint returned 200"
  COUNT=$(echo "$BODY" | jq '. | length' 2>/dev/null || echo "0")
  echo "   Found $COUNT transaction types"
else
  echo "❌ FAILED: Transaction types endpoint returned $HTTP_CODE"
  echo "   Response: $BODY"
fi

# Test 2: Get Transaction List (requires auth, so we'll just check if endpoint exists)
echo ""
echo "Test 2: GET /rest/transaction/list (without auth - should return 401/403, not 500)"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "http://localhost:8080/rest/transaction/list?bankId=1" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "500" ]; then
  echo "❌ FAILED: Transaction list endpoint returned 500 (should be 401/403 without auth)"
else
  echo "✅ SUCCESS: Transaction list endpoint returned $HTTP_CODE (expected 401/403 without auth)"
fi

echo ""
echo "================================"
echo "Tests completed!"
echo ""
echo "Next steps:"
echo "1. Test in browser: http://localhost:3000/admin/banking/bank-account/transaction/create"
echo "2. Check browser console for transaction types loading"
echo "3. Test View Transactions: http://localhost:3000/admin/banking/bank-account"
