# SimpleAccounts-UAE - AI Agent PR Guidelines

Before creating any Pull Request, you MUST complete ALL of the following checks.
Do NOT create a PR until every applicable item passes.

---

## 1. CODE COMPILATION & BUILD

### Backend (Java/Spring Boot)
```bash
cd apps/backend
./mvnw clean compile -q
```
- [ ] Code compiles without errors
- [ ] No new deprecation warnings introduced

### Frontend (React)
```bash
cd apps/frontend
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript/ESLint errors
- [ ] No console warnings in build output

---

## 2. AUTOMATED TESTS

### Run ALL Tests
```bash
# Backend tests (requires Java 8)
cd apps/backend && ./mvnw test

# Frontend tests
cd apps/frontend && npm test -- --watchAll=false
```

- [ ] All backend tests pass (currently 51 tests)
- [ ] All frontend tests pass (currently 151 tests)
- [ ] No skipped tests without documented reason
- [ ] Test coverage not decreased from baseline

### If You Modified Code, Verify:
- [ ] Existing tests still pass
- [ ] New tests added for new functionality
- [ ] Edge cases covered

---

## 3. SECURITY CHECKS

### Never Commit:
- [ ] No hardcoded passwords or secrets
- [ ] No API keys in code (check for patterns: `key=`, `secret=`, `password=`)
- [ ] No `.env` files with real credentials
- [ ] No private keys or certificates

### Code Security:
- [ ] No SQL injection vulnerabilities (use parameterized queries)
- [ ] No XSS vulnerabilities (sanitize user input)
- [ ] No exposed sensitive endpoints without auth
- [ ] JWT tokens properly validated
- [ ] File uploads validated (type, size, content)

### Run Security Scan:
```bash
# Check for secrets in staged files
git diff --cached | grep -iE "(password|secret|key|token).*=.*['\"][^'\"]+['\"]" || echo "No secrets found"

# Check for common vulnerability patterns
git diff --cached | grep -iE "eval\(|innerHTML|dangerouslySetInnerHTML" || echo "No dangerous patterns"
```

---

## 4. CODE QUALITY

### Backend:
- [ ] No `System.out.println` (use Logger instead)
- [ ] Proper exception handling (no empty catch blocks)
- [ ] Resources properly closed (try-with-resources)
- [ ] No unused imports
- [ ] Consistent naming conventions (camelCase for methods, PascalCase for classes)

### Frontend:
- [ ] No `console.log` in production code
- [ ] No unused variables/imports
- [ ] PropTypes or TypeScript types defined
- [ ] No inline styles (use CSS/styled-components)
- [ ] Accessible components (aria labels, alt text)

### Run Linting:
```bash
# Frontend linting
cd apps/frontend && npm run lint 2>/dev/null || echo "No lint script configured"
```

---

## 5. DATABASE & MIGRATIONS

If database changes made:
- [ ] Liquibase changelog updated (`apps/backend/src/main/resources/liquibase/`)
- [ ] Migration is reversible (rollback tested)
- [ ] No breaking changes to existing data
- [ ] Indexes added for frequently queried columns
- [ ] Foreign keys properly defined

### Verify Migration:
```bash
cd apps/backend
./mvnw liquibase:status -q 2>/dev/null || echo "Check Liquibase manually"
```

---

## 6. API CHANGES

If REST API modified:
- [ ] Backward compatible (no breaking changes to existing endpoints)
- [ ] Response format consistent with existing APIs
- [ ] Error responses follow standard format (`WebLayerErrorCodeEnum`)
- [ ] HTTP status codes appropriate (200, 201, 400, 401, 403, 404, 500)
- [ ] Rate limiting considered for public endpoints

### Document API Changes:
- [ ] API change noted in PR description
- [ ] Request/response examples provided

---

## 7. USER AUTHORIZATION & DATA ACCESS

**Note:** SimpleAccounts-UAE is a single-tenant application with role-based access control.

For any data access code:
- [ ] User authentication required for protected endpoints
- [ ] Role-based permissions checked (ADMIN vs EMPLOYEE access)
- [ ] User can only access/modify data they have permission for
- [ ] Audit logging for sensitive operations (user actions tracked)

### Verify Role-Based Access:
```java
// Check user has required role before operation
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyOperation() { }

// Verify user owns the resource or has admin access
if (!currentUser.isAdmin() && !resource.getCreatedBy().equals(currentUser.getId())) {
    throw new AccessDeniedException("Not authorized");
}
```

---

## 8. UAE-SPECIFIC REQUIREMENTS

If financial calculations involved:
- [ ] VAT calculations correct (5% standard rate, 0% zero-rated, exempt categories)
- [ ] Currency precision maintained (2 decimal places for AED)
- [ ] Date formats correct (dd/MM/yyyy for display, ISO for storage)
- [ ] Arabic text handled properly (RTL support in PDFs/UI)
- [ ] WPS file format correct for payroll exports

### Financial Validation:
```java
// Use BigDecimal for money, never float/double
BigDecimal amount = new BigDecimal("100.00");
BigDecimal vat = amount.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
```

---

## 9. GIT HYGIENE

### Before Creating PR:
```bash
# Ensure branch is up to date with target
git fetch origin
git rebase origin/master  # or origin/develop

# Check for merge conflicts
git diff --check

# Review what will be in the PR
git log origin/master..HEAD --oneline
git diff origin/master --stat
```

- [ ] Branch is based on latest master/develop
- [ ] No merge conflicts
- [ ] Commits are atomic and well-described
- [ ] No commits with "WIP", "fix", "test" only messages
- [ ] Sensitive files not staged (.env, credentials, node_modules)

### Commit Message Format:
```
<type>: <short description (50 chars max)>

<detailed description if needed (wrap at 72 chars)>

Types: feat, fix, docs, style, refactor, test, chore, perf
```

### Examples:
```
feat: Add VAT calculation for zero-rated items
fix: Prevent duplicate invoice numbers under concurrent requests
refactor: Extract PDF generation to separate service
```

---

## 10. DOCUMENTATION

- [ ] Code comments for complex logic (explain WHY, not WHAT)
- [ ] README updated if setup steps changed
- [ ] CHANGELOG updated for user-facing changes
- [ ] Migration guide provided if breaking changes
- [ ] API documentation updated if endpoints changed

---

## 11. FINAL VERIFICATION

### Manual Smoke Test (Required for UI/API changes):
```bash
# Start backend
cd apps/backend && ./run.sh &
sleep 30

# Start frontend
cd apps/frontend && npm start &
sleep 20

# Verify services are running
curl -s http://localhost:8080/actuator/health | grep -q "UP" && echo "Backend OK" || echo "Backend FAILED"
curl -s http://localhost:3000 | grep -q "html" && echo "Frontend OK" || echo "Frontend FAILED"
```

- [ ] Application starts without errors
- [ ] Login works with test credentials
- [ ] Core functionality not broken (test affected features)
- [ ] No JavaScript console errors
- [ ] No backend error logs

---

## 12. MANDATORY SCREENSHOTS FOR PR

**ALL PRs MUST include the following screenshots. PRs without these will be REJECTED.**

### Required Screenshots:

| # | Screenshot | Description | Required |
|---|------------|-------------|----------|
| 1 | **Backend Test Results** | Terminal showing all 51 tests pass | **YES** |
| 2 | **Frontend Test Results** | Terminal showing all 151 tests pass | **YES** |
| 3 | **Login Page** | Application login screen loaded | **YES** |
| 4 | **Dashboard (After Login)** | Main dashboard after successful login | **YES** |
| 5 | **Feature Before** | Screen before changes (for UI changes) | For UI PRs |
| 6 | **Feature After** | Screen after changes (for UI changes) | For UI PRs |
| 7 | **Browser Console** | DevTools console showing no errors | For UI PRs |

### How to Capture Screenshots:

**1. Backend Tests:**
```bash
cd apps/backend
./mvnw test
# Take screenshot showing:
# - "BUILD SUCCESS"
# - "Tests run: 51, Failures: 0, Errors: 0"
```

**2. Frontend Tests:**
```bash
cd apps/frontend
npm test -- --watchAll=false
# Take screenshot showing:
# - "Test Suites: X passed"
# - "Tests: 151 passed"
```

**3. Login Page Screenshot:**
- Open http://localhost:3000
- Take full-page screenshot of login form
- Ensure no console errors visible

**4. Dashboard Screenshot:**
- Login with test credentials
- Navigate to main dashboard
- Take full-page screenshot showing:
  - User logged in (username visible)
  - Dashboard widgets loaded
  - No loading spinners
  - No error messages

### Screenshot Checklist:
- [ ] Backend test screenshot attached (showing 51 tests pass)
- [ ] Frontend test screenshot attached (showing 151 tests pass)
- [ ] Login page screenshot attached
- [ ] Dashboard screenshot attached (after successful login)
- [ ] Feature-specific screenshots attached (if UI changes)
- [ ] Console showing no errors (if UI changes)

### Screenshot Naming Convention:
```
pr-[number]-backend-tests.png
pr-[number]-frontend-tests.png
pr-[number]-login-page.png
pr-[number]-dashboard.png
pr-[number]-feature-before.png
pr-[number]-feature-after.png
```

---

## 13. PR CREATION CHECKLIST

### PR Title Format:
```
<type>: <concise description>

Examples:
feat: Add bulk invoice export to Excel
fix: Resolve race condition in invoice numbering
docs: Update API documentation for auth endpoints
```

### PR Description Template:
```markdown
## Summary
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code compiles without errors
- [ ] All tests pass (51 backend + 151 frontend)
- [ ] No security vulnerabilities introduced
- [ ] No hardcoded secrets
- [ ] Documentation updated
- [ ] Tenant isolation verified (if data access code)

## Test Plan
1. Step to test feature 1
2. Step to test feature 2
3. Expected results

## Screenshots (if UI changes)
<attach before/after screenshots>

## Related Issues
Closes #<issue_number>

---
Generated with [Claude Code](https://claude.com/claude-code)
```

---

## STOP CONDITIONS - DO NOT CREATE PR IF:

1. **Tests Failing** - Any test failure must be fixed first
2. **Build Broken** - Code must compile without errors
3. **Security Issues** - No hardcoded credentials or vulnerabilities
4. **Breaking Changes** - Without migration path documented
5. **Merge Conflicts** - Must be resolved first
6. **Missing Tests** - New code must have test coverage

### If Blocked:
```
Instead of creating a broken PR:
1. Document the issue
2. Ask for help if needed
3. Fix the problem
4. Re-run this entire checklist
```

---

## QUICK REFERENCE COMMANDS

```bash
# Full validation suite
cd /path/to/SimpleAccounts-UAE

# 1. Update from remote
git fetch origin && git rebase origin/master

# 2. Backend checks
cd apps/backend
./mvnw clean compile test

# 3. Frontend checks
cd ../frontend
npm run build
npm test -- --watchAll=false

# 4. Security scan
git diff --cached | grep -iE "(password|secret|key|token).*=" || echo "Clean"

# 5. Start and verify
cd ../backend && ./run.sh &
cd ../frontend && npm start &
```

---

## Environment Requirements

- **Java**: 8 (use SDKMAN: `sdk use java 8.0.422-zulu`)
- **Node**: 20 (use nvm: `nvm use 20`)
- **Maven**: 3.6.x
- **PostgreSQL**: 13+
- **Docker**: For Testcontainers (optional)

---

*Last Updated: December 2025*
*Test Count: 51 backend + 151 frontend = 202 total*
