#!/bin/bash

# Script to help apply withNavigation HOC to class components
# This script identifies components that use this.props.history and need the HOC

set -e

echo "🔍 Finding components that need withNavigation HOC"
echo "=================================================="
echo ""

cd "$(dirname "$0")/.."

# Find files using this.props.history
echo "Files using this.props.history.push/replace/go:"
grep -r "this\.props\.history\.\(push\|replace\|go\)" apps/frontend/src/screens --include="*.js" | \
  cut -d: -f1 | \
  sort -u | \
  while read file; do
    # Check if already has withNavigation
    if ! grep -q "withNavigation" "$file"; then
      echo "  - $file"
    fi
  done

echo ""
echo "📝 To apply withNavigation HOC:"
echo ""
echo "1. Add import at top of file:"
echo "   import { withNavigation } from 'utils/withNavigation';"
echo ""
echo "2. Update export:"
echo ""
echo "   If using connect():"
echo "   export default connect(...)(withNavigation(Component));"
echo ""
echo "   If not using connect():"
echo "   export default withNavigation(Component);"
echo ""
echo "⚠️  Important: withNavigation should be the INNER HOC when combined with connect()"
echo ""

