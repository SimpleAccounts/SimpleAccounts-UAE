#!/bin/bash

# SonarQube API Configuration
SONARQUBE_URL="https://sonar-r0w40gg48okc00wkc08oowo4.46.62.252.63.sslip.io"
SONARQUBE_TOKEN="squ_a9dfb5e603c5ced7c6bb3133cce0b3cfdaf3c514"
PROJECT_KEY="SimpleAccounts_SimpleAccounts-UAE_f0046086-4810-411a-9ca7-6017268b2eb9"

# Output file
OUTPUT_FILE="/Users/moshinhashmi/.gemini/tmp/e3133635b89e3cded2fa8ba105d46a8443722545df588e96ebe3c0461931f909/sonarqube_all_issues.json"

echo "Fetching all open issues from SonarQube..."
echo "Project: $PROJECT_KEY"
echo ""

# Fetch first page to get total count
FIRST_PAGE=$(curl -u "${SONARQUBE_TOKEN}:" -s "${SONARQUBE_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=500&p=1")

TOTAL=$(echo "$FIRST_PAGE" | python3 -c "import sys, json; print(json.load(sys.stdin)['total'])")
PAGE_SIZE=500
TOTAL_PAGES=$(( (TOTAL + PAGE_SIZE - 1) / PAGE_SIZE ))

# Combine all pages and save to a temporary file, one JSON array per line
TEMP_ISSUES_FILE="/Users/moshinhashmi/.gemini/tmp/e3133635b89e3cded2fa8ba105d46a8443722545df588e96ebe3c0461931f909/sonarqube_temp_issues.json"
> "$TEMP_ISSUES_FILE" # Clear the temp file

for ((i=1; i<=TOTAL_PAGES; i++)); do
    echo "Fetching page $i/$TOTAL_PAGES..."
    PAGE_DATA=$(curl -u "${SONARQUBE_TOKEN}:" -s "${SONARQUBE_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=${PAGE_SIZE}&p=${i}")
    echo "$PAGE_DATA" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin)['issues']))" >> "$TEMP_ISSUES_FILE"
done

# Check if jq is installed
if ! command -v jq &> /dev/null
then
    echo "jq could not be found. Please install jq to process JSON output (e.g., brew install jq or apt-get install jq)."
    rm "$TEMP_ISSUES_FILE" # Clean up temporary file
    exit 1
fi

# Combine all issues from the temporary file into a single JSON array
echo "Combining all issues..."
cat "$TEMP_ISSUES_FILE" | jq -s 'add' | python3 -m json.tool > "$OUTPUT_FILE"

# Clean up temporary file
rm "$TEMP_ISSUES_FILE"

echo ""
echo "All issues saved to: $OUTPUT_FILE"
echo "Total issues fetched: $(jq length "$OUTPUT_FILE")"
