#!/bin/bash
# =============================================================================
# Database Validation Script
# =============================================================================
# This script validates that the PostgreSQL database is correctly configured
# and all required environment variables are set
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Print functions
print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_check() {
    echo -e "  Checking: $1"
}

print_success() {
    echo -e "  ${GREEN}✓${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    CHECKS_WARNING=$((CHECKS_WARNING + 1))
}

print_info() {
    echo -e "  ${BLUE}ℹ${NC} $1"
}

# =============================================================================
# Environment Variable Checks
# =============================================================================

print_header "1. Environment Variables"

REQUIRED_VARS=(
    "SIMPLEACCOUNTS_DB_HOST"
    "SIMPLEACCOUNTS_DB_PORT"
    "SIMPLEACCOUNTS_DB"
    "SIMPLEACCOUNTS_DB_USER"
    "SIMPLEACCOUNTS_DB_PASSWORD"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
)

for var in "${REQUIRED_VARS[@]}"; do
    print_check "$var"
    if [ -z "${!var}" ]; then
        print_error "$var is NOT set"
    else
        print_success "$var = ${!var}"
    fi
done

echo ""

# =============================================================================
# PostgreSQL Service Checks
# =============================================================================

print_header "2. PostgreSQL Service"

print_check "PostgreSQL is listening on port ${SIMPLEACCOUNTS_DB_PORT:-5432}"
if pg_isready -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" -p "${SIMPLEACCOUNTS_DB_PORT:-5432}" > /dev/null 2>&1; then
    print_success "PostgreSQL is accepting connections"
else
    print_error "PostgreSQL is NOT accepting connections"
fi

echo ""

# =============================================================================
# Database Existence Checks
# =============================================================================

print_header "3. Databases"

# Check main database
print_check "Database '${SIMPLEACCOUNTS_DB:-simpleaccounts}' exists"
if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -U "${POSTGRES_USER:-postgres}" \
        -lqt | cut -d \| -f 1 | grep -qw "${SIMPLEACCOUNTS_DB:-simpleaccounts}"; then
    print_success "Database '${SIMPLEACCOUNTS_DB:-simpleaccounts}' exists"
else
    print_error "Database '${SIMPLEACCOUNTS_DB:-simpleaccounts}' NOT found"
fi

# Check test database
print_check "Database 'simpleaccounts_test' exists"
if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -U "${POSTGRES_USER:-postgres}" \
        -lqt | cut -d \| -f 1 | grep -qw "simpleaccounts_test"; then
    print_success "Database 'simpleaccounts_test' exists"
else
    print_warning "Database 'simpleaccounts_test' NOT found (optional)"
fi

echo ""

# =============================================================================
# User/Role Checks
# =============================================================================

print_header "4. Database Users"

print_check "User '${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}' exists"
if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -U "${POSTGRES_USER:-postgres}" \
        -tAc "SELECT 1 FROM pg_roles WHERE rolname='${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}'" | grep -q 1; then
    print_success "User '${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}' exists"
else
    print_error "User '${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}' NOT found"
fi

echo ""

# =============================================================================
# Connection Test
# =============================================================================

print_header "5. Application Connection Test"

print_check "Can connect as '${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}' to '${SIMPLEACCOUNTS_DB:-simpleaccounts}'"
if PGPASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD}" psql \
        -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -p "${SIMPLEACCOUNTS_DB_PORT:-5432}" \
        -U "${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}" \
        -d "${SIMPLEACCOUNTS_DB:-simpleaccounts}" \
        -c "SELECT 1" > /dev/null 2>&1; then
    print_success "Connection successful"
else
    print_error "Connection FAILED"
fi

echo ""

# =============================================================================
# Extensions Check
# =============================================================================

print_header "6. PostgreSQL Extensions"

print_check "Extension 'uuid-ossp' is installed"
if PGPASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD}" psql \
        -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -U "${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}" \
        -d "${SIMPLEACCOUNTS_DB:-simpleaccounts}" \
        -tAc "SELECT 1 FROM pg_extension WHERE extname='uuid-ossp'" | grep -q 1; then
    print_success "Extension 'uuid-ossp' is installed"
else
    print_warning "Extension 'uuid-ossp' NOT installed"
fi

print_check "Extension 'pgcrypto' is installed"
if PGPASSWORD="${SIMPLEACCOUNTS_DB_PASSWORD}" psql \
        -h "${SIMPLEACCOUNTS_DB_HOST:-localhost}" \
        -U "${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}" \
        -d "${SIMPLEACCOUNTS_DB:-simpleaccounts}" \
        -tAc "SELECT 1 FROM pg_extension WHERE extname='pgcrypto'" | grep -q 1; then
    print_success "Extension 'pgcrypto' is installed"
else
    print_warning "Extension 'pgcrypto' NOT installed"
fi

echo ""

# =============================================================================
# Summary
# =============================================================================

print_header "Validation Summary"

echo -e "  ${GREEN}Passed:${NC}   $CHECKS_PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $CHECKS_WARNING"
echo -e "  ${RED}Failed:${NC}   $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Database validation PASSED${NC}"
    echo ""
    echo "Connection Details:"
    echo "  Host:     ${SIMPLEACCOUNTS_DB_HOST:-localhost}"
    echo "  Port:     ${SIMPLEACCOUNTS_DB_PORT:-5432}"
    echo "  Database: ${SIMPLEACCOUNTS_DB:-simpleaccounts}"
    echo "  User:     ${SIMPLEACCOUNTS_DB_USER:-simpleaccounts}"
    echo ""
    echo "JDBC URL:"
    echo "  jdbc:postgresql://${SIMPLEACCOUNTS_DB_HOST:-localhost}:${SIMPLEACCOUNTS_DB_PORT:-5432}/${SIMPLEACCOUNTS_DB:-simpleaccounts}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Database validation FAILED${NC}"
    echo ""
    echo "Please fix the errors above and try again."
    echo ""
    echo "Common fixes:"
    echo "  1. Ensure .devcontainer/.env file exists and contains all required variables"
    echo "  2. Restart the devcontainer: docker compose down && docker compose up -d"
    echo "  3. Check PostgreSQL logs: docker compose logs db"
    echo ""
    exit 1
fi
