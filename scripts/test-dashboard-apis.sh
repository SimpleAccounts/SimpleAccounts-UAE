#!/bin/bash
# Test Dashboard API Endpoints
# This script tests all dashboard-related API endpoints

set -e

BASE_URL="http://localhost:8080"
USERNAME="${E2E_USERNAME:-test@example.com}"
PASSWORD="${E2E_PASSWORD:-Test@1234}"

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo ""

echo "📊 Testing Dashboard APIs..."
echo ""

# Test 1: Cash Flow
echo "1. Cash Flow (12 months):"
CASH_FLOW_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/transaction/getCashFlow?monthNo=12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
CASH_FLOW_STATUS=$(echo "$CASH_FLOW_RESPONSE" | jq -r '.status // "Success"')
echo "   Status: $CASH_FLOW_STATUS"
if [ "$CASH_FLOW_STATUS" != "Success" ] && [ "$CASH_FLOW_STATUS" != "null" ]; then
  echo "   ⚠️  Unexpected response"
fi
echo ""

# Test 2: Invoice Chart Data
echo "2. Invoice Chart Data (12 months):"
INVOICE_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/invoice/getChartData?monthCount=12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
INVOICE_STATUS=$(echo "$INVOICE_RESPONSE" | jq -r '.status // "Success"')
echo "   Status: $INVOICE_STATUS"
if [ "$INVOICE_STATUS" != "Success" ] && [ "$INVOICE_STATUS" != "null" ]; then
  echo "   ⚠️  Unexpected response"
fi
echo ""

# Test 3: Profit & Loss Report
echo "3. Profit & Loss Report (12 months):"
P_L_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/dashboardReport/profitandloss?monthNo=12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
P_L_HAS_INCOME=$(echo "$P_L_RESPONSE" | jq -r '.Income // "No Income field"')
echo "   Has Income data: $([ "$P_L_HAS_INCOME" != "No Income field" ] && echo "Yes" || echo "No")"
echo ""

# Test 4: Bank Account Types
echo "4. Bank Account Types:"
BANK_TYPES_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/bank/list" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
BANK_TYPES_COUNT=$(echo "$BANK_TYPES_RESPONSE" | jq -r '.data | length // 0')
echo "   Count: $BANK_TYPES_COUNT"
echo ""

# Test 5: Total Balance
echo "5. Total Balance:"
TOTAL_BALANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/bank/getTotalBalance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
TOTAL_BALANCE=$(echo "$TOTAL_BALANCE_RESPONSE" | jq -r '. // "No data"')
echo "   Balance: $TOTAL_BALANCE"
echo ""

# Test 6: Bank Chart (if we have a bank account)
if [ "$BANK_TYPES_COUNT" -gt 0 ]; then
  FIRST_BANK_ID=$(echo "$BANK_TYPES_RESPONSE" | jq -r '.data[0].bankAccountId // empty')
  if [ -n "$FIRST_BANK_ID" ]; then
    echo "6. Bank Chart (Bank ID: $FIRST_BANK_ID, 12 months):"
    BANK_CHART_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/bank/getBankChart?bankId=$FIRST_BANK_ID&monthCount=12" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    BANK_CHART_HAS_DATA=$(echo "$BANK_CHART_RESPONSE" | jq -r '.data // "No data"')
    echo "   Has chart data: $([ "$BANK_CHART_HAS_DATA" != "No data" ] && echo "Yes" || echo "No")"
    echo ""
  fi
fi

# Test 7: Expenses List
echo "7. Expenses List:"
EXPENSES_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/expense/getList" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
EXPENSES_COUNT=$(echo "$EXPENSES_RESPONSE" | jq -r '.data | length // 0')
echo "   Count: $EXPENSES_COUNT"
echo ""

# Test 8: Revenues List (Invoices type=2)
echo "8. Revenues List (Invoices type=2):"
REVENUES_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/invoice/getList?type=2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
REVENUES_COUNT=$(echo "$REVENUES_RESPONSE" | jq -r '.data | length // 0')
echo "   Count: $REVENUES_COUNT"
echo ""

echo "✅ All API tests completed"
echo ""
echo "Summary:"
echo "  - Cash Flow: $CASH_FLOW_STATUS"
echo "  - Invoice Chart: $INVOICE_STATUS"
echo "  - Bank Accounts: $BANK_TYPES_COUNT"
echo "  - Expenses: $EXPENSES_COUNT"
echo "  - Revenues: $REVENUES_COUNT"

