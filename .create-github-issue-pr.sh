#!/bin/bash
# Script to create GitHub issue and PR for Task #167
# This script provides the content and URLs needed

echo "=========================================="
echo "GitHub Issue and PR Creation Guide"
echo "=========================================="
echo ""

echo "1. CREATE GITHUB ISSUE"
echo "======================"
echo "URL: https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/new"
echo ""
echo "Title: Backend: PropertyValueException when saving PasswordHistory during password reset"
echo ""
echo "Labels: bug, backend, high-priority, authentication"
echo ""
echo "Body: (Copy from .github-issue-backend-password-history.md)"
echo ""
cat .github-issue-backend-password-history.md
echo ""
echo ""
echo "=========================================="
echo ""
echo "2. CREATE PULL REQUEST"
echo "======================"
echo "URL: https://github.com/SimpleAccounts/SimpleAccounts-UAE/compare/develop...feature/auth-react-hook-form-167"
echo ""
echo "Title: feat(auth): migrate authentication screens to React Hook Form + Zod (#167)"
echo ""
echo "Body: (Copy from .pr-description-167.md)"
echo ""
cat .pr-description-167.md
echo ""
echo ""
echo "=========================================="
echo ""
echo "3. AFTER CREATING ISSUE"
echo "======================="
echo "Once you have the issue number (e.g., #XXX), update the PR description:"
echo "- Replace '#XXX' with the actual issue number"
echo "- Link the issue in the PR description"
echo ""

