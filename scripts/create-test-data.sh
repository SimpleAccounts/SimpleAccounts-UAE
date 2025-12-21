#!/bin/bash

# Script to create comprehensive test data for SimpleAccounts UAE
# This includes: Customers, Suppliers, Products, Bank Accounts, and Invoices

set -e

BASE_URL="${SIMPLEACCOUNTS_HOST:-http://localhost:8080}"
USERNAME="${E2E_USERNAME:-test@example.com}"
PASSWORD="${E2E_PASSWORD:-Test@1234}"

echo "🚀 Creating test data for SimpleAccounts UAE"
echo "Base URL: $BASE_URL"
echo "Username: $USERNAME"
echo ""

# Function to get JWT token
get_token() {
  local response=$(curl -s -X POST "$BASE_URL/auth/token" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
  
  echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
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

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token. Please check credentials."
  exit 1
fi

echo "✅ Authentication successful"
echo ""

# Get company details first (needed for creating contacts)
echo "🏢 Fetching company details..."
COMPANY_RESPONSE=$(api_call "GET" "/rest/company/getCompanyDetails" "" "$TOKEN")
COMPANY_ID=$(echo "$COMPANY_RESPONSE" | grep -o '"companyId":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$COMPANY_ID" ]; then
  echo "⚠️  Could not get company ID. Using default."
  COMPANY_ID=1
fi

echo "Company ID: $COMPANY_ID"
echo ""

# Get currency list
echo "💱 Fetching currency list..."
CURRENCY_RESPONSE=$(api_call "GET" "/rest/currency/getCurrencyList" "" "$TOKEN")
AED_CURRENCY_ID=$(echo "$CURRENCY_RESPONSE" | grep -o '"currencyId":3[^,}]*' | head -1 | grep -o '"currencyId":[0-9]*' | cut -d':' -f2 || echo "3")
USD_CURRENCY_ID=$(echo "$CURRENCY_RESPONSE" | grep -o '"currencyId":1[^,}]*' | head -1 | grep -o '"currencyId":[0-9]*' | cut -d':' -f2 || echo "1")

echo "AED Currency ID: ${AED_CURRENCY_ID:-3}"
echo "USD Currency ID: ${USD_CURRENCY_ID:-1}"
echo ""

# Get country list
echo "🌍 Fetching country list..."
COUNTRY_RESPONSE=$(api_call "GET" "/rest/country/getCountryList" "" "$TOKEN")
UAE_COUNTRY_ID=$(echo "$COUNTRY_RESPONSE" | grep -o '"countryId":[0-9]*.*"countryName":"United Arab Emirates"' | head -1 | grep -o '"countryId":[0-9]*' | cut -d':' -f2 || echo "229")

echo "UAE Country ID: ${UAE_COUNTRY_ID:-229}"
echo ""

# Create Customers
echo "👥 Creating customers..."

CUSTOMER_DATA=(
  "{\"contactName\":\"Acme Corporation\",\"contactType\":2,\"email\":\"contact@acme.com\",\"phoneNumber\":\"+971501234567\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Dubai\",\"billingAddress\":\"P.O. Box 12345, Business Bay\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Tech Solutions LLC\",\"contactType\":2,\"email\":\"info@techsol.ae\",\"phoneNumber\":\"+971502345678\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Abu Dhabi\",\"billingAddress\":\"P.O. Box 67890, Al Khalidiyah\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Global Trading Co.\",\"contactType\":2,\"email\":\"sales@globaltrading.ae\",\"phoneNumber\":\"+971503456789\",\"currencyId\":${USD_CURRENCY_ID:-1},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Sharjah\",\"billingAddress\":\"P.O. Box 11111, Industrial Area\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Premium Services FZE\",\"contactType\":2,\"email\":\"info@premium.ae\",\"phoneNumber\":\"+971504567890\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Dubai\",\"billingAddress\":\"P.O. Box 22222, JLT\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Business Partners Ltd\",\"contactType\":2,\"email\":\"contact@bpartners.ae\",\"phoneNumber\":\"+971505678901\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Dubai\",\"billingAddress\":\"P.O. Box 33333, DIFC\",\"isBillingAndShippingAddressSame\":true}"
)

CUSTOMER_IDS=()
for customer_data in "${CUSTOMER_DATA[@]}"; do
  response=$(api_call "POST" "/rest/contact/createContact" "$customer_data" "$TOKEN")
  customer_id=$(echo "$response" | grep -o '"contactId":[0-9]*' | cut -d':' -f2 || echo "")
  if [ -n "$customer_id" ]; then
    CUSTOMER_IDS+=("$customer_id")
    customer_name=$(echo "$customer_data" | grep -o '"contactName":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created customer: $customer_name (ID: $customer_id)"
  else
    echo "  ⚠️  Failed to create customer: $(echo "$customer_data" | grep -o '"contactName":"[^"]*"' | cut -d'"' -f4)"
  fi
done

echo "Total customers created: ${#CUSTOMER_IDS[@]}"
echo ""

# Create Suppliers
echo "🏭 Creating suppliers..."

SUPPLIER_DATA=(
  "{\"contactName\":\"ABC Suppliers FZE\",\"contactType\":1,\"email\":\"supply@abcsuppliers.ae\",\"phoneNumber\":\"+971506789012\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Dubai\",\"billingAddress\":\"P.O. Box 44444, Deira\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Global Materials Trading\",\"contactType\":1,\"email\":\"info@globalmat.ae\",\"phoneNumber\":\"+971507890123\",\"currencyId\":${AED_CURRENCY_ID:-3},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Sharjah\",\"billingAddress\":\"P.O. Box 55555, Al Qasimia\",\"isBillingAndShippingAddressSame\":true}"
  "{\"contactName\":\"Quality Products LLC\",\"contactType\":1,\"email\":\"sales@qualitypro.ae\",\"phoneNumber\":\"+971508901234\",\"currencyId\":${USD_CURRENCY_ID:-1},\"countryId\":${UAE_COUNTRY_ID:-229},\"city\":\"Dubai\",\"billingAddress\":\"P.O. Box 66666, Al Quoz\",\"isBillingAndShippingAddressSame\":true}"
)

SUPPLIER_IDS=()
for supplier_data in "${SUPPLIER_DATA[@]}"; do
  response=$(api_call "POST" "/rest/contact/createContact" "$supplier_data" "$TOKEN")
  supplier_id=$(echo "$response" | grep -o '"contactId":[0-9]*' | cut -d':' -f2 || echo "")
  if [ -n "$supplier_id" ]; then
    SUPPLIER_IDS+=("$supplier_id")
    supplier_name=$(echo "$supplier_data" | grep -o '"contactName":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created supplier: $supplier_name (ID: $supplier_id)"
  else
    echo "  ⚠️  Failed to create supplier: $(echo "$supplier_data" | grep -o '"contactName":"[^"]*"' | cut -d'"' -f4)"
  fi
done

echo "Total suppliers created: ${#SUPPLIER_IDS[@]}"
echo ""

# Get VAT codes
echo "📋 Fetching VAT codes..."
VAT_RESPONSE=$(api_call "GET" "/rest/vat/getVatList" "" "$TOKEN")
STANDARD_VAT_ID=$(echo "$VAT_RESPONSE" | grep -o '"vatId":5[^,}]*' | head -1 | grep -o '"vatId":[0-9]*' | cut -d':' -f2 || echo "5")
ZERO_VAT_ID=$(echo "$VAT_RESPONSE" | grep -o '"vatId":6[^,}]*' | head -1 | grep -o '"vatId":[0-9]*' | cut -d':' -f2 || echo "6")

echo "Standard VAT ID: ${STANDARD_VAT_ID:-5}"
echo "Zero VAT ID: ${ZERO_VAT_ID:-6}"
echo ""

# Get product categories
echo "📦 Fetching product categories..."
CATEGORY_RESPONSE=$(api_call "GET" "/rest/productCategory/getProductCategoryList" "" "$TOKEN")
SERVICE_CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | grep -o '"productCategoryId":[0-9]*' | head -1 | cut -d':' -f2 || echo "1")
PRODUCT_CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | grep -o '"productCategoryId":[0-9]*' | tail -1 | cut -d':' -f2 || echo "2")

echo "Service Category ID: ${SERVICE_CATEGORY_ID:-1}"
echo "Product Category ID: ${PRODUCT_CATEGORY_ID:-2}"
echo ""

# Create Products
echo "📦 Creating products..."

PRODUCT_DATA=(
  "{\"productName\":\"Consulting Services\",\"productDescription\":\"Professional consulting services\",\"unitPrice\":\"5000.00\",\"currencyId\":${AED_CURRENCY_ID:-3},\"productCategoryId\":${SERVICE_CATEGORY_ID:-1},\"vatId\":${STANDARD_VAT_ID:-5},\"unitType\":\"Hour\",\"productType\":\"SERVICE\"}"
  "{\"productName\":\"Software License\",\"productDescription\":\"Annual software license\",\"unitPrice\":\"15000.00\",\"currencyId\":${AED_CURRENCY_ID:-3},\"productCategoryId\":${PRODUCT_CATEGORY_ID:-2},\"vatId\":${STANDARD_VAT_ID:-5},\"unitType\":\"Unit\",\"productType\":\"PRODUCT\"}"
  "{\"productName\":\"Support Package\",\"productDescription\":\"Technical support package\",\"unitPrice\":\"8000.00\",\"currencyId\":${AED_CURRENCY_ID:-3},\"productCategoryId\":${SERVICE_CATEGORY_ID:-1},\"vatId\":${STANDARD_VAT_ID:-5},\"unitType\":\"Month\",\"productType\":\"SERVICE\"}"
  "{\"productName\":\"Training Session\",\"productDescription\":\"On-site training session\",\"unitPrice\":\"12000.00\",\"currencyId\":${AED_CURRENCY_ID:-3},\"productCategoryId\":${SERVICE_CATEGORY_ID:-1},\"vatId\":${STANDARD_VAT_ID:-5},\"unitType\":\"Day\",\"productType\":\"SERVICE\"}"
  "{\"productName\":\"Hardware Equipment\",\"productDescription\":\"Computer hardware equipment\",\"unitPrice\":\"25000.00\",\"currencyId\":${AED_CURRENCY_ID:-3},\"productCategoryId\":${PRODUCT_CATEGORY_ID:-2},\"vatId\":${STANDARD_VAT_ID:-5},\"unitType\":\"Unit\",\"productType\":\"PRODUCT\"}"
)

PRODUCT_IDS=()
for product_data in "${PRODUCT_DATA[@]}"; do
  response=$(api_call "POST" "/rest/product/createProduct" "$product_data" "$TOKEN")
  product_id=$(echo "$response" | grep -o '"productId":[0-9]*' | cut -d':' -f2 || echo "")
  if [ -n "$product_id" ]; then
    PRODUCT_IDS+=("$product_id")
    product_name=$(echo "$product_data" | grep -o '"productName":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Created product: $product_name (ID: $product_id)"
  else
    echo "  ⚠️  Failed to create product: $(echo "$product_data" | grep -o '"productName":"[^"]*"' | cut -d'"' -f4)"
  fi
done

echo "Total products created: ${#PRODUCT_IDS[@]}"
echo ""

# Get bank accounts
echo "🏦 Fetching bank accounts..."
BANK_RESPONSE=$(api_call "GET" "/rest/bankAccount/getBankAccountList" "" "$TOKEN")
BANK_ACCOUNT_ID=$(echo "$BANK_RESPONSE" | grep -o '"bankAccountId":[0-9]*' | head -1 | cut -d':' -f2 || echo "")

if [ -z "$BANK_ACCOUNT_ID" ]; then
  echo "⚠️  No bank accounts found. Creating one..."
  BANK_ACCOUNT_DATA="{\"name\":\"Main Business Account\",\"accounName\":\"1234567890\",\"bankName\":\"Emirates NBD\",\"currencyId\":${AED_CURRENCY_ID:-3},\"accountType\":\"CURRENT\"}"
  BANK_RESPONSE=$(api_call "POST" "/rest/bankAccount/createBankAccount" "$BANK_ACCOUNT_DATA" "$TOKEN")
  BANK_ACCOUNT_ID=$(echo "$BANK_RESPONSE" | grep -o '"bankAccountId":[0-9]*' | cut -d':' -f2 || echo "")
  if [ -n "$BANK_ACCOUNT_ID" ]; then
    echo "  ✅ Created bank account (ID: $BANK_ACCOUNT_ID)"
  fi
else
  echo "Using existing bank account ID: $BANK_ACCOUNT_ID"
fi
echo ""

# Create Sample Invoices (if we have customers and products)
if [ ${#CUSTOMER_IDS[@]} -gt 0 ] && [ ${#PRODUCT_IDS[@]} -gt 0 ]; then
  echo "📄 Creating sample customer invoices..."
  
  # Get current date and due date (30 days from now)
  INVOICE_DATE=$(date +%Y-%m-%d)
  DUE_DATE=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)
  
  # Create first invoice
  if [ -n "${CUSTOMER_IDS[0]}" ] && [ -n "${PRODUCT_IDS[0]}" ]; then
    INVOICE_DATA="{\"invoice_number\":\"INV-$(date +%Y%m%d)-001\",\"contactId\":${CUSTOMER_IDS[0]},\"invoiceDate\":\"$INVOICE_DATE\",\"invoiceDueDate\":\"$DUE_DATE\",\"term\":\"NET_30\",\"currencyCode\":${AED_CURRENCY_ID:-3},\"type\":2,\"lineItemsString\":[{\"productId\":${PRODUCT_IDS[0]},\"quantity\":\"10\",\"unitPrice\":\"5000.00\",\"vatCategoryId\":${STANDARD_VAT_ID:-5},\"description\":\"Consulting Services\"}],\"totalNet\":\"50000.00\",\"totalVatAmount\":\"2500.00\",\"totalAmount\":\"52500.00\",\"notes\":\"Test invoice created by script\"}"
    
    response=$(api_call "POST" "/rest/invoice/createInvoice" "$INVOICE_DATA" "$TOKEN")
    invoice_id=$(echo "$response" | grep -o '"invoiceId":[0-9]*' | cut -d':' -f2 || echo "")
    if [ -n "$invoice_id" ]; then
      echo "  ✅ Created invoice: INV-$(date +%Y%m%d)-001 (ID: $invoice_id)"
    else
      echo "  ⚠️  Failed to create invoice. Response: $response"
    fi
  fi
fi

echo ""
echo "✅ Test data creation complete!"
echo ""
echo "📊 Summary:"
echo "  - Customers: ${#CUSTOMER_IDS[@]}"
echo "  - Suppliers: ${#SUPPLIER_IDS[@]}"
echo "  - Products: ${#PRODUCT_IDS[@]}"
echo "  - Bank Accounts: $([ -n "$BANK_ACCOUNT_ID" ] && echo "1" || echo "0")"
echo ""
echo "💡 You can now test invoice creation in the frontend!"

