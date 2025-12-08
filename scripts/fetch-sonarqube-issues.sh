#!/bin/bash

# SonarQube API Configuration
SONARQUBE_URL="https://sonar-r0w40gg48okc00wkc08oowo4.46.62.252.63.sslip.io"
SONARQUBE_TOKEN="squ_a9dfb5e603c5ced7c6bb3133cce0b3cfdaf3c514"
PROJECT_KEY="SimpleAccounts_SimpleAccounts-UAE_f0046086-4810-411a-9ca7-6017268b2eb9"

# Output file
OUTPUT_FILE="/tmp/sonarqube_all_issues.json"

echo "Fetching all open issues from SonarQube..."
echo "Project: $PROJECT_KEY"
echo ""

# Fetch first page to get total count
FIRST_PAGE=$(curl -u "${SONARQUBE_TOKEN}:" -s "${SONARQUBE_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=500&p=1")

TOTAL=$(echo "$FIRST_PAGE" | python3 -c "import sys, json; print(json.load(sys.stdin)['total'])")
PAGE_SIZE=500
TOTAL_PAGES=$(( (TOTAL + PAGE_SIZE - 1) / PAGE_SIZE ))

echo "Total issues: $TOTAL"
echo "Total pages: $TOTAL_PAGES"
echo ""

# Combine all pages
ALL_ISSUES="[]"
for ((i=1; i<=TOTAL_PAGES; i++)); do
    echo "Fetching page $i/$TOTAL_PAGES..."
    PAGE_DATA=$(curl -u "${SONARQUBE_TOKEN}:" -s "${SONARQUBE_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=${PAGE_SIZE}&p=${i}")
    ISSUES=$(echo "$PAGE_DATA" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin)['issues']))")
    ALL_ISSUES=$(echo "$ALL_ISSUES" | python3 -c "import sys, json; existing=json.load(sys.stdin); new=json.load(sys.stdin); existing.extend(new); print(json.dumps(existing))" <<< "$ISSUES")
done

# Save to file
echo "$ALL_ISSUES" | python3 -m json.tool > "$OUTPUT_FILE"
echo ""
echo "All issues saved to: $OUTPUT_FILE"
echo "Total issues fetched: $(echo "$ALL_ISSUES" | python3 -c 'import sys, json; print(len(json.load(sys.stdin)))')"
