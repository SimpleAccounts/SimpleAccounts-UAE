#!/bin/bash
# Create test data for Customer Invoice module testing
# Usage: ./scripts/create-invoice-test-data.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
USERNAME="${E2E_USERNAME:-test@example.com}"
PASSWORD="${E2E_PASSWORD:-Test@1234}"

echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Please check credentials."
  exit 1
fi

echo "✅ Login successful"

# Create test customer
echo "👤 Creating test customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE_URL/rest/contact/save" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "organization": "Test Customer Invoice",
    "email": "testcustomer@example.com",
    "mobileNumber": "+971501234567",
    "addressLine1": "Test Address, Dubai, UAE",
    "contactType": 2,
    "countryId": 1,
    "currencyCode": 1
  }')

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.id // empty')
if [ -z "$CUSTOMER_ID" ]; then
  # Try to find existing customer
  CUSTOMER_ID=$(curl -s -X GET "$BASE_URL/rest/contact/getContactList?contactType=2" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.data[] | select(.organization | contains("Test Customer")) | .id' | head -1)
fi

if [ -z "$CUSTOMER_ID" ]; then
  echo "⚠️  Could not create or find test customer. Using ID 1 as fallback."
  CUSTOMER_ID=1
else
  echo "✅ Customer created/found with ID: $CUSTOMER_ID"
fi

# Create test products
echo "📦 Creating test products..."
PRODUCT_IDS=()

# Product A: Price 100 AED, VAT 5%
PRODUCT_A=$(curl -s -X POST "$BASE_URL/rest/product/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productName": "Test Product A",
    "productCode": "PROD-A-001",
    "productDescription": "Test product with 5% VAT",
    "salesUnitPrice": 100,
    "purchaseUnitPrice": 80,
    "vatCategoryId": 1,
    "productType": "GOODS",
    "vatIncluded": false
  }' | jq -r '.data.productId // empty')

if [ -n "$PRODUCT_A" ]; then
  PRODUCT_IDS+=("$PRODUCT_A")
  echo "✅ Product A created with ID: $PRODUCT_A"
fi

# Product B: Price 200 AED, VAT 5%
PRODUCT_B=$(curl -s -X POST "$BASE_URL/rest/product/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productName": "Test Product B",
    "productCode": "PROD-B-002",
    "productDescription": "Test product with 5% VAT",
    "salesUnitPrice": 200,
    "purchaseUnitPrice": 150,
    "vatCategoryId": 1,
    "productType": "GOODS",
    "vatIncluded": false
  }' | jq -r '.data.productId // empty')

if [ -n "$PRODUCT_B" ]; then
  PRODUCT_IDS+=("$PRODUCT_B")
  echo "✅ Product B created with ID: $PRODUCT_B"
fi

# Product C: Price 150 AED, No VAT
PRODUCT_C=$(curl -s -X POST "$BASE_URL/rest/product/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productName": "Test Product C",
    "productCode": "PROD-C-003",
    "productDescription": "Test product with no VAT",
    "salesUnitPrice": 150,
    "purchaseUnitPrice": 120,
    "vatCategoryId": null,
    "productType": "GOODS",
    "vatIncluded": false
  }' | jq -r '.data.productId // empty')

if [ -n "$PRODUCT_C" ]; then
  PRODUCT_IDS+=("$PRODUCT_C")
  echo "✅ Product C created with ID: $PRODUCT_C"
fi

# Product D: Price 300 AED, VAT 15%
PRODUCT_D=$(curl -s -X POST "$BASE_URL/rest/product/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productName": "Test Product D",
    "productCode": "PROD-D-004",
    "productDescription": "Test product with 15% VAT",
    "salesUnitPrice": 300,
    "purchaseUnitPrice": 250,
    "vatCategoryId": 2,
    "productType": "GOODS",
    "vatIncluded": false
  }' | jq -r '.data.productId // empty')

if [ -n "$PRODUCT_D" ]; then
  PRODUCT_IDS+=("$PRODUCT_D")
  echo "✅ Product D created with ID: $PRODUCT_D"
fi

# Use existing products if creation failed
if [ ${#PRODUCT_IDS[@]} -eq 0 ]; then
  echo "⚠️  Could not create products. Fetching existing products..."
  EXISTING_PRODUCTS=$(curl -s -X GET "$BASE_URL/rest/product/getList" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.data[0:4] | .[].productId')
  
  while IFS= read -r pid; do
    if [ -n "$pid" ]; then
      PRODUCT_IDS+=("$pid")
    fi
  done <<< "$EXISTING_PRODUCTS"
  
  echo "✅ Using existing products: ${PRODUCT_IDS[*]}"
fi

# Create 12 invoices (one per month for the last 12 months)
echo "📄 Creating test invoices..."
INVOICE_IDS=()

for month in {0..11}; do
  # Calculate date (month months ago)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    INVOICE_DATE=$(date -v-${month}m +"%Y-%m-15" 2>/dev/null || date -j -v-${month}m +"%Y-%m-15")
    DUE_DATE=$(date -v-${month}m -v+30d +"%Y-%m-15" 2>/dev/null || date -j -v-${month}m -v+30d +"%Y-%m-15")
  else
    # Linux
    INVOICE_DATE=$(date -d "${month} months ago" +"%Y-%m-15")
    DUE_DATE=$(date -d "${month} months ago +30 days" +"%Y-%m-15")
  fi
  
  # Determine status: mix of draft, posted, and paid
  if [ $month -lt 4 ]; then
    STATUS=1  # Draft
  elif [ $month -lt 8 ]; then
    STATUS=3  # Posted
  else
    STATUS=6  # Paid
  fi
  
  # Create invoice with line items
  INVOICE_NUMBER="INV-TEST-$(printf "%03d" $((12 - month)))"
  
  # Use first product for simplicity
  PRODUCT_ID=${PRODUCT_IDS[0]:-1}
  QUANTITY=$((2 + month))
  UNIT_PRICE=100
  
  INVOICE_RESPONSE=$(curl -s -X POST "$BASE_URL/rest/invoice/save" \
    -H "Content-Type: multipart/form-data" \
    -H "Authorization: Bearer $TOKEN" \
    -F "referenceNumber=$INVOICE_NUMBER" \
    -F "contactId=$CUSTOMER_ID" \
    -F "invoiceDate=$INVOICE_DATE" \
    -F "invoiceDueDate=$DUE_DATE" \
    -F "currencyCode=AED" \
    -F "type=2" \
    -F "status=$STATUS" \
    -F "term=NET_30" \
    -F "invoiceLineItems[0].productId=$PRODUCT_ID" \
    -F "invoiceLineItems[0].quantity=$QUANTITY" \
    -F "invoiceLineItems[0].unitPrice=$UNIT_PRICE" \
    -F "invoiceLineItems[0].vatCategoryId=1")
  
  INVOICE_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.data.invoiceId // empty')
  
  if [ -n "$INVOICE_ID" ]; then
    INVOICE_IDS+=("$INVOICE_ID")
    echo "✅ Invoice $INVOICE_NUMBER created with ID: $INVOICE_ID (Status: $STATUS)"
  else
    echo "⚠️  Failed to create invoice $INVOICE_NUMBER"
  fi
  
  sleep 0.5  # Rate limiting
done

echo ""
echo "📊 Summary:"
echo "  - Customer ID: $CUSTOMER_ID"
echo "  - Products created: ${#PRODUCT_IDS[@]}"
echo "  - Invoices created: ${#INVOICE_IDS[@]}"
echo ""
echo "✅ Test data creation complete!"

