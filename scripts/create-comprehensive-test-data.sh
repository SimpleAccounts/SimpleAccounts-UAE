#!/bin/bash

# Comprehensive test data creation script for SimpleAccounts UAE
# Creates: Customers, Suppliers, Products, Bank Accounts, Bank Transactions, and Invoices

set -euo pipefail

BASE_URL="${SIMPLEACCOUNTS_HOST:-http://localhost:8080}"
USERNAME="${E2E_USERNAME:-test@example.com}"
PASSWORD="${E2E_PASSWORD:-Test@1234}"

echo "🚀 Creating comprehensive test data for SimpleAccounts UAE"
echo "Base URL: $BASE_URL"
echo "Username: $USERNAME"
echo ""

# Function to get JWT token
get_token() {
  local response=$(curl -s -X POST "$BASE_URL/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  local token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
  if [ -z "$token" ]; then
    token=$(echo "$response" | jq -r '.token' 2>/dev/null || echo "")
  fi
  echo "$token"
}

# Function to make authenticated API call
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  
  if [ -n "$data" ]; then
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $token"
  fi
}

# Login and get token
echo "📝 Logging in..."
TOKEN=$(get_token)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Failed to get authentication token. Please check credentials."
  echo "Response was: $(curl -s -X POST "$BASE_URL/auth/token" -H "Content-Type: application/json" -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")"
  exit 1
fi

echo "✅ Authentication successful"
echo ""

# Get company details
echo "🏢 Fetching company details..."
COMPANY_RESPONSE=$(api_call "GET" "/rest/company/getCompanyDetails" "" "$TOKEN")
echo "Company details fetched"
echo ""

# Get currency list
echo "💱 Fetching currency list..."
CURRENCY_RESPONSE=$(api_call "GET" "/rest/currency/getCurrencyList" "" "$TOKEN")
AED_CURRENCY_ID=3
USD_CURRENCY_ID=1

# Try to extract from response if jq is available
if command -v jq &> /dev/null; then
  AED_CURRENCY_ID=$(echo "$CURRENCY_RESPONSE" | jq -r '.data[] | select(.currencyCode == "AED") | .currencyId' | head -1 || echo "3")
  USD_CURRENCY_ID=$(echo "$CURRENCY_RESPONSE" | jq -r '.data[] | select(.currencyCode == "USD") | .currencyId' | head -1 || echo "1")
fi

echo "Using Currency IDs - AED: $AED_CURRENCY_ID, USD: $USD_CURRENCY_ID"
echo ""

# Get country list
echo "🌍 Fetching country list..."
COUNTRY_RESPONSE=$(api_call "GET" "/rest/country/getCountryList" "" "$TOKEN")
UAE_COUNTRY_ID=229

if command -v jq &> /dev/null; then
  UAE_COUNTRY_ID=$(echo "$COUNTRY_RESPONSE" | jq -r '.data[] | select(.countryName == "United Arab Emirates") | .countryId' | head -1 || echo "229")
fi

echo "Using UAE Country ID: $UAE_COUNTRY_ID"
echo ""

# Get VAT codes
echo "📋 Fetching VAT codes..."
VAT_RESPONSE=$(api_call "GET" "/rest/vat/getVatList" "" "$TOKEN")
STANDARD_VAT_ID=5
ZERO_VAT_ID=6

if command -v jq &> /dev/null; then
  STANDARD_VAT_ID=$(echo "$VAT_RESPONSE" | jq -r '.data[] | select(.vatPercentage == 5) | .vatId' | head -1 || echo "5")
  ZERO_VAT_ID=$(echo "$VAT_RESPONSE" | jq -r '.data[] | select(.vatPercentage == 0) | .vatId' | head -1 || echo "6")
fi

echo "Using VAT IDs - Standard (5%): $STANDARD_VAT_ID, Zero: $ZERO_VAT_ID"
echo ""

# Get product categories
echo "📦 Fetching product categories..."
CATEGORY_RESPONSE=$(api_call "GET" "/rest/productCategory/getProductCategoryList" "" "$TOKEN")
SERVICE_CATEGORY_ID=1
PRODUCT_CATEGORY_ID=2

if command -v jq &> /dev/null; then
  SERVICE_CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data[0].productCategoryId' || echo "1")
  PRODUCT_CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data[1].productCategoryId' || echo "2")
fi

echo "Using Category IDs - Service: $SERVICE_CATEGORY_ID, Product: $PRODUCT_CATEGORY_ID"
echo ""

# Create Customers (contactType=2)
echo "👥 Creating customers..."

CUSTOMER_DATA=(
  "{\"organization\":\"Acme Corporation\",\"contactType\":2,\"email\":\"contact@acme.com\",\"mobileNumber\":\"+971501234567\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Dubai\",\"addressLine1\":\"P.O. Box 12345, Business Bay\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
  "{\"organization\":\"Tech Solutions LLC\",\"contactType\":2,\"email\":\"info@techsol.ae\",\"mobileNumber\":\"+971502345678\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Abu Dhabi\",\"addressLine1\":\"P.O. Box 67890, Al Khalidiyah\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
  "{\"organization\":\"Global Trading Co.\",\"contactType\":2,\"email\":\"sales@globaltrading.ae\",\"mobileNumber\":\"+971503456789\",\"currencyCode\":$USD_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Sharjah\",\"addressLine1\":\"P.O. Box 11111, Industrial Area\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":false}"
  "{\"organization\":\"Premium Services FZE\",\"contactType\":2,\"email\":\"info@premium.ae\",\"mobileNumber\":\"+971504567890\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Dubai\",\"addressLine1\":\"P.O. Box 22222, JLT\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
  "{\"organization\":\"Business Partners Ltd\",\"contactType\":2,\"email\":\"contact@bpartners.ae\",\"mobileNumber\":\"+971505678901\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Dubai\",\"addressLine1\":\"P.O. Box 33333, DIFC\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
)

CUSTOMER_IDS=()
for i in "${!CUSTOMER_DATA[@]}"; do
  customer_data="${CUSTOMER_DATA[$i]}"
  response=$(api_call "POST" "/rest/contact/save" "$customer_data" "$TOKEN")
  
  customer_id=""
  if command -v jq &> /dev/null; then
    customer_id=$(echo "$response" | jq -r '.contactId // .id // empty' 2>/dev/null || echo "")
  fi
  
  if [ -z "$customer_id" ]; then
    customer_id=$(echo "$response" | grep -o '"contactId":[0-9]*' | cut -d':' -f2 || echo "")
  fi
  
  if [ -z "$customer_id" ]; then
    customer_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2 || echo "")
  fi
  
  if [ -n "$customer_id" ] && [ "$customer_id" != "null" ]; then
    CUSTOMER_IDS+=("$customer_id")
    customer_name=$(echo "$customer_data" | grep -o '"organization":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created customer: $customer_name (ID: $customer_id)"
  else
    customer_name=$(echo "$customer_data" | grep -o '"organization":"[^"]*"' | cut -d'"' -f4)
    echo "  ⚠️  Failed to create customer: $customer_name"
    echo "     Response: $(echo "$response" | head -c 200)"
  fi
  sleep 0.3
done

echo "Total customers created: ${#CUSTOMER_IDS[@]}"
echo ""

# Create Suppliers (contactType=1)
echo "🏭 Creating suppliers..."

SUPPLIER_DATA=(
  "{\"organization\":\"ABC Suppliers FZE\",\"contactType\":1,\"email\":\"supply@abcsuppliers.ae\",\"mobileNumber\":\"+971506789012\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Dubai\",\"addressLine1\":\"P.O. Box 44444, Deira\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
  "{\"organization\":\"Global Materials Trading\",\"contactType\":1,\"email\":\"info@globalmat.ae\",\"mobileNumber\":\"+971507890123\",\"currencyCode\":$AED_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Sharjah\",\"addressLine1\":\"P.O. Box 55555, Al Qasimia\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":true}"
  "{\"organization\":\"Quality Products LLC\",\"contactType\":1,\"email\":\"sales@qualitypro.ae\",\"mobileNumber\":\"+971508901234\",\"currencyCode\":$USD_CURRENCY_ID,\"countryId\":$UAE_COUNTRY_ID,\"city\":\"Dubai\",\"addressLine1\":\"P.O. Box 66666, Al Quoz\",\"isBillingAndShippingAddressSame\":true,\"isRegisteredForVat\":false}"
)

SUPPLIER_IDS=()
for supplier_data in "${SUPPLIER_DATA[@]}"; do
  response=$(api_call "POST" "/rest/contact/save" "$supplier_data" "$TOKEN")
  
  supplier_id=""
  if command -v jq &> /dev/null; then
    supplier_id=$(echo "$response" | jq -r '.contactId // .id // empty' 2>/dev/null || echo "")
  fi
  
  if [ -z "$supplier_id" ]; then
    supplier_id=$(echo "$response" | grep -o '"contactId":[0-9]*' | cut -d':' -f2 || echo "")
  fi
  
  if [ -z "$supplier_id" ]; then
    supplier_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2 || echo "")
  fi
  
  if [ -n "$supplier_id" ] && [ "$supplier_id" != "null" ]; then
    SUPPLIER_IDS+=("$supplier_id")
    supplier_name=$(echo "$supplier_data" | grep -o '"organization":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created supplier: $supplier_name (ID: $supplier_id)"
  else
    supplier_name=$(echo "$supplier_data" | grep -o '"organization":"[^"]*"' | cut -d'"' -f4)
    echo "  ⚠️  Failed to create supplier: $supplier_name"
  fi
  sleep 0.3
done

echo "Total suppliers created: ${#SUPPLIER_IDS[@]}"
echo ""

# Create Products
echo "📦 Creating products..."

PRODUCT_DATA=(
  "{\"productName\":\"Consulting Services\",\"productCode\":\"SRV-CONSULT-001\",\"productDescription\":\"Professional consulting services\",\"salesUnitPrice\":5000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$SERVICE_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"SERVICE\",\"vatIncluded\":false}"
  "{\"productName\":\"Software License\",\"productCode\":\"PRD-SOFT-001\",\"productDescription\":\"Annual software license subscription\",\"salesUnitPrice\":15000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$PRODUCT_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"PRODUCT\",\"vatIncluded\":false}"
  "{\"productName\":\"Support Package\",\"productCode\":\"SRV-SUPPORT-001\",\"productDescription\":\"Technical support package (monthly)\",\"salesUnitPrice\":8000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$SERVICE_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"SERVICE\",\"vatIncluded\":false}"
  "{\"productName\":\"Training Session\",\"productCode\":\"SRV-TRAIN-001\",\"productDescription\":\"On-site training session (per day)\",\"salesUnitPrice\":12000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$SERVICE_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"SERVICE\",\"vatIncluded\":false}"
  "{\"productName\":\"Hardware Equipment\",\"productCode\":\"PRD-HW-001\",\"productDescription\":\"Computer hardware equipment\",\"salesUnitPrice\":25000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$PRODUCT_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"PRODUCT\",\"vatIncluded\":false}"
  "{\"productName\":\"Maintenance Service\",\"productCode\":\"SRV-MAINT-001\",\"productDescription\":\"Annual maintenance service contract\",\"salesUnitPrice\":30000.00,\"currencyCode\":$AED_CURRENCY_ID,\"productCategoryId\":$SERVICE_CATEGORY_ID,\"vatCategoryId\":$STANDARD_VAT_ID,\"unitTypeId\":1,\"productType\":\"SERVICE\",\"vatIncluded\":false}"
)

PRODUCT_IDS=()
for product_data in "${PRODUCT_DATA[@]}"; do
  response=$(api_call "POST" "/rest/product/save" "$product_data" "$TOKEN")
  
  product_id=""
  if command -v jq &> /dev/null; then
    product_id=$(echo "$response" | jq -r '.productId // .id // empty' 2>/dev/null || echo "")
  fi
  
  if [ -z "$product_id" ]; then
    product_id=$(echo "$response" | grep -o '"productId":[0-9]*' | cut -d':' -f2 || echo "")
  fi
  
  if [ -n "$product_id" ] && [ "$product_id" != "null" ]; then
    PRODUCT_IDS+=("$product_id")
    product_name=$(echo "$product_data" | grep -o '"productName":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created product: $product_name (ID: $product_id)"
  else
    product_name=$(echo "$product_data" | grep -o '"productName":"[^"]*"' | cut -d'"' -f4)
    echo "  ⚠️  Failed to create product: $product_name"
    echo "     Response: $(echo "$response" | head -c 200)"
  fi
  sleep 0.3
done

echo "Total products created: ${#PRODUCT_IDS[@]}"
echo ""

# Get or create bank account
echo "🏦 Fetching/Creating bank account..."
BANK_RESPONSE=$(api_call "GET" "/rest/bankAccount/getList" "" "$TOKEN")
BANK_ACCOUNT_ID=""

if command -v jq &> /dev/null; then
  BANK_ACCOUNT_ID=$(echo "$BANK_RESPONSE" | jq -r '.data[0].bankAccountId // empty' 2>/dev/null || echo "")
fi

if [ -z "$BANK_ACCOUNT_ID" ]; then
  BANK_ACCOUNT_ID=$(echo "$BANK_RESPONSE" | grep -o '"bankAccountId":[0-9]*' | head -1 | cut -d':' -f2 || echo "")
fi

if [ -z "$BANK_ACCOUNT_ID" ] || [ "$BANK_ACCOUNT_ID" == "null" ]; then
  echo "  ⚠️  No bank accounts found. Bank account creation requires additional setup."
  echo "     Please create a bank account manually in the UI."
else
  echo "  ✅ Using existing bank account (ID: $BANK_ACCOUNT_ID)"
fi
echo ""

# Create Sample Customer Invoices
if [ ${#CUSTOMER_IDS[@]} -gt 0 ] && [ ${#PRODUCT_IDS[@]} -gt 0 ]; then
  echo "📄 Creating sample customer invoices..."
  
  # Get invoice number prefix/suffix if available
  INVOICE_PREFIX="INV"
  
  # Create invoices for the last 12 months
  for month in {0..11}; do
    # Calculate dates
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      INVOICE_DATE=$(date -v-${month}m +"%Y-%m-15" 2>/dev/null || date -j -f "%Y-%m-%d" -v-${month}m +"%Y-%m-15")
      DUE_DATE=$(date -v-${month}m -v+30d +"%Y-%m-15" 2>/dev/null || date -j -f "%Y-%m-%d" -v-${month}m -v+30d +"%Y-%m-15")
    else
      # Linux
      INVOICE_DATE=$(date -d "${month} months ago" +"%Y-%m-15")
      DUE_DATE=$(date -d "${month} months ago +30 days" +"%Y-%m-15")
    fi
    
    # Select customer and product (rotate through arrays)
    CUSTOMER_ID=${CUSTOMER_IDS[$((month % ${#CUSTOMER_IDS[@]}))]}
    PRODUCT_ID=${PRODUCT_IDS[$((month % ${#PRODUCT_IDS[@]}))]}
    
    # Vary quantities and prices
    QUANTITY=$((5 + month))
    UNIT_PRICE=$((1000 * (month % 3 + 1)))
    TOTAL_NET=$((QUANTITY * UNIT_PRICE))
    VAT_AMOUNT=$((TOTAL_NET * 5 / 100))
    TOTAL_AMOUNT=$((TOTAL_NET + VAT_AMOUNT))
    
    INVOICE_NUMBER="${INVOICE_PREFIX}-$(date -v-${month}m +"%Y%m%d" 2>/dev/null || date -d "${month} months ago" +"%Y%m%d")-$(printf "%03d" $((month + 1)))"
    
    # Create invoice using multipart/form-data (as per backend @ModelAttribute)
    LINE_ITEMS_JSON="[{\"productId\":$PRODUCT_ID,\"quantity\":\"$QUANTITY\",\"unitPrice\":\"$UNIT_PRICE\",\"vatCategoryId\":$STANDARD_VAT_ID,\"subTotal\":$TOTAL_NET,\"vatAmount\":$VAT_AMOUNT}]"
    
    # Use curl with form data
    response=$(curl -s -X POST "$BASE_URL/rest/invoice/save" \
      -H "Authorization: Bearer $TOKEN" \
      -F "referenceNumber=$INVOICE_NUMBER" \
      -F "contactId=$CUSTOMER_ID" \
      -F "invoiceDate=$INVOICE_DATE" \
      -F "invoiceDueDate=$DUE_DATE" \
      -F "term=NET_30" \
      -F "currencyCode=$AED_CURRENCY_ID" \
      -F "type=2" \
      -F "totalNet=$TOTAL_NET" \
      -F "totalVatAmount=$VAT_AMOUNT" \
      -F "totalAmount=$TOTAL_AMOUNT" \
      -F "lineItemsString=$LINE_ITEMS_JSON" \
      -F "notes=Test invoice created by script for month $(($month + 1))")
    
    invoice_id=""
    if command -v jq &> /dev/null; then
      invoice_id=$(echo "$response" | jq -r '.invoiceId // .id // empty' 2>/dev/null || echo "")
    fi
    
    if [ -z "$invoice_id" ]; then
      invoice_id=$(echo "$response" | grep -o '"invoiceId":[0-9]*' | cut -d':' -f2 || echo "")
    fi
    
    if [ -n "$invoice_id" ] && [ "$invoice_id" != "null" ]; then
      echo "  ✅ Created invoice: $INVOICE_NUMBER (ID: $invoice_id) - Amount: $TOTAL_AMOUNT AED"
    else
      echo "  ⚠️  Failed to create invoice: $INVOICE_NUMBER"
      echo "     Response: $(echo "$response" | head -c 200)"
    fi
    
    sleep 0.5  # Rate limiting
  done
else
  echo "⚠️  Skipping invoice creation - need at least one customer and one product"
fi

echo ""
echo "✅ Test data creation complete!"
echo ""
echo "📊 Summary:"
echo "  - Customers: ${#CUSTOMER_IDS[@]}"
echo "  - Suppliers: ${#SUPPLIER_IDS[@]}"
echo "  - Products: ${#PRODUCT_IDS[@]}"
echo "  - Bank Account: $([ -n "$BANK_ACCOUNT_ID" ] && echo "Available (ID: $BANK_ACCOUNT_ID)" || echo "Not available")"
echo ""
echo "💡 You can now test invoice creation in the frontend at:"
echo "   http://localhost:3000/admin/income/customer-invoice/create"
echo ""

