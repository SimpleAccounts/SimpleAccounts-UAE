#!/bin/bash
# Test script for /rest/company/register endpoint
# This script sends a curl request matching the frontend FormData structure

echo "=== Testing /rest/company/register endpoint ==="
echo ""

# Test data - minimal required fields
curl -X POST http://localhost:8080/rest/company/register \
  -H "Content-Type: multipart/form-data" \
  -H "Origin: http://localhost:3000" \
  -F "companyName=Test Company $(date +%s)" \
  -F "currencyCode=150" \
  -F "companyTypeCode=129" \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "email=test$(date +%s)@example.com" \
  -F "password=Test123!@#" \
  -F "timeZone=Asia/Dubai" \
  -F "countryId=229" \
  -F "stateId=1" \
  -F "phoneNumber=+971501234567" \
  -F "IsDesignatedZone=false" \
  -F "IsRegisteredVat=false" \
  -F "companyAddressLine1=123 Test Street" \
  -F "companyAddressLine2=Test Area" \
  -F "loginUrl=http://localhost:3000" \
  -v

echo ""
echo "=== Test completed ==="

