#!/bin/bash

# Fix all test expectations that expect { data: ... } but should expect just the data array

# List of files to fix
files=(
    "apps/frontend/src/screens/employee_Bank_Details/__tests__/actions.test.js"
    "apps/frontend/src/screens/employment/__tests__/actions.test.js"
    "apps/frontend/src/screens/financial_report/__tests__/actions.test.js"
    "apps/frontend/src/screens/goods_received_note/__tests__/actions.test.js"
    "apps/frontend/src/screens/journal/__tests__/actions.test.js"
    "apps/frontend/src/screens/payroll_run/__tests__/actions.test.js"
    "apps/frontend/src/screens/purchase_order/__tests__/actions.test.js"
    "apps/frontend/src/screens/quotation/__tests__/actions.test.js"
    "apps/frontend/src/screens/request_for_quotation/__tests__/actions.test.js"
    "apps/frontend/src/screens/salaryTemplate/__tests__/actions.test.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file"
        # Replace payload: { data: ... } with payload: ...
        sed -i 's/payload: { data: \([^}]*\) }/payload: \1/g' "$file"
        # Replace payload: { status: 200, data: ... } with payload: ...
        sed -i 's/payload: { status: 200, data: \([^}]*\) }/payload: \1/g' "$file"
        # Fix cases where the replacement left dangling commas
        sed -i 's/payload: \([^}]*\), }/payload: \1 }/g' "$file"
    fi
done

echo "Test expectations fixed"
