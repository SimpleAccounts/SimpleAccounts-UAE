#!/bin/bash
# Test Customer Invoice API Endpoints
# This script tests all customer invoice-related API endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:8080}"
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

echo "📄 Testing Customer Invoice APIs..."
echo ""

# Test 1: Get Invoice List
echo "1. Get Invoice List:"
INVOICE_LIST=$(curl -s -X GET "$BASE_URL/rest/invoice/getList?type=2&pageNo=0&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
INVOICE_COUNT=$(echo "$INVOICE_LIST" | jq -r '.data | length // 0')
echo "   Invoices found: $INVOICE_COUNT"
if [ "$INVOICE_COUNT" -gt 0 ]; then
  FIRST_INVOICE_ID=$(echo "$INVOICE_LIST" | jq -r '.data[0].id // empty')
  echo "   First invoice ID: $FIRST_INVOICE_ID"
fi
echo ""

# Test 2: Get Single Invoice (if we have one)
if [ -n "$FIRST_INVOICE_ID" ] && [ "$FIRST_INVOICE_ID" != "null" ]; then
  echo "2. Get Single Invoice (ID: $FIRST_INVOICE_ID):"
  INVOICE_DETAIL=$(curl -s -X GET "$BASE_URL/rest/invoice/getInvoiceById?id=$FIRST_INVOICE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  INVOICE_NUMBER=$(echo "$INVOICE_DETAIL" | jq -r '.referenceNumber // "N/A"')
  echo "   Invoice Number: $INVOICE_NUMBER"
  echo ""
fi

# Test 3: Get Customer List (for modal)
echo "3. Get Customer List:"
CUSTOMER_LIST=$(curl -s -X GET "$BASE_URL/rest/contact/getContactsForDropdown?contactType=2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
CUSTOMER_COUNT=$(echo "$CUSTOMER_LIST" | jq -r '. | length // 0')
echo "   Customers found: $CUSTOMER_COUNT"
echo ""

# Test 4: Get Product List (for modal)
echo "4. Get Product List:"
PRODUCT_LIST=$(curl -s -X GET "$BASE_URL/rest/product/getList" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
PRODUCT_COUNT=$(echo "$PRODUCT_LIST" | jq -r '.data | length // 0')
echo "   Products found: $PRODUCT_COUNT"
echo ""

# Test 5: Get Status List
echo "5. Get Status List:"
STATUS_LIST=$(curl -s -X GET "$BASE_URL/rest/datalist/invoiceStatus" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
STATUS_COUNT=$(echo "$STATUS_LIST" | jq -r '. | length // 0')
echo "   Statuses found: $STATUS_COUNT"
echo ""

# Test 6: Get Currency List
echo "6. Get Currency List:"
CURRENCY_LIST=$(curl -s -X GET "$BASE_URL/rest/currency/getactivecurrencies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
CURRENCY_COUNT=$(echo "$CURRENCY_LIST" | jq -r '.data | length // 0')
echo "   Currencies found: $CURRENCY_COUNT"
echo ""

# Test 7: Get VAT List
echo "7. Get VAT List:"
VAT_LIST=$(curl -s -X GET "$BASE_URL/rest/datalist/vatCategory" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")
VAT_COUNT=$(echo "$VAT_LIST" | jq -r '. | length // 0')
echo "   VAT Categories found: $VAT_COUNT"
echo ""

echo "✅ All API tests completed!"

