# GitHub Pull Request Template for SimpleAccounts-UAE

**IMPORTANT**: All PRs MUST include proof of work and successful tests. PRs without required screenshots will be rejected.

---

## Pull Request Template

Copy this template when creating a PR:

```markdown
## Summary
<!-- Brief description of changes (2-3 bullet points) -->
-
-
-

## Related Issue
<!-- Link to the related issue -->
Closes #<issue_number>

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Configuration change
- [ ] Dependency update

---

## MANDATORY: Proof of Successful Tests

### Backend Tests
<!-- Paste screenshot of Maven test output showing all tests pass -->

**Backend Test Results** (51 tests must pass):
```
<!-- Paste test output here -->
./mvnw test output:
Tests run: XX, Failures: 0, Errors: 0, Skipped: 0
```

| Test Suite | Status | Screenshot |
|------------|--------|------------|
| Backend Unit Tests | PASS/FAIL | ![backend-tests](paste_screenshot_url) |

### Frontend Tests
<!-- Paste screenshot of npm test output showing all tests pass -->

**Frontend Test Results** (151 tests must pass):
```
<!-- Paste test output here -->
npm test output:
Test Suites: XX passed, XX total
Tests: XXX passed, XXX total
```

| Test Suite | Status | Screenshot |
|------------|--------|------------|
| Frontend Unit Tests | PASS/FAIL | ![frontend-tests](paste_screenshot_url) |

---

## MANDATORY: Application Screenshots

### 1. Login Screen
<!-- Screenshot showing successful login -->
![Login Screen](paste_screenshot_url)

### 2. Home Screen / Dashboard (After Login)
<!-- Screenshot of the main dashboard after successful login -->
![Dashboard](paste_screenshot_url)

### 3. Feature-Specific Screenshots
<!-- Screenshots demonstrating the specific changes made -->

| Screen/Feature | Before | After |
|----------------|--------|-------|
| [Feature Name] | ![before](url) | ![after](url) |
| [Feature Name] | ![before](url) | ![after](url) |

---

## Detailed Changes

### Backend Changes
<!-- List all backend files changed -->
- [ ] `path/to/file1.java` - Description of change
- [ ] `path/to/file2.java` - Description of change

### Frontend Changes
<!-- List all frontend files changed -->
- [ ] `path/to/component1.js` - Description of change
- [ ] `path/to/component2.js` - Description of change

### Database Changes
<!-- List any database/migration changes -->
- [ ] No database changes
- [ ] Migration added: `changelog_name.xml`
- [ ] Schema changes: [describe]

### Configuration Changes
<!-- List any config changes -->
- [ ] No configuration changes
- [ ] Environment variables added: [list]
- [ ] Application properties changed: [list]

---

## Testing Performed

### Manual Testing Checklist
<!-- Check all tests performed -->

**Core Functionality (REQUIRED)**:
- [ ] Application starts without errors
- [ ] Login works with test credentials
- [ ] Dashboard loads correctly
- [ ] Navigation works properly
- [ ] Logout works correctly

**Feature-Specific Testing**:
- [ ] Test case 1: [describe]
- [ ] Test case 2: [describe]
- [ ] Test case 3: [describe]

**Cross-Browser Testing** (for UI changes):
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile responsive

**Edge Cases Tested**:
- [ ] Empty data handling
- [ ] Invalid input handling
- [ ] Error message display
- [ ] Loading states

---

## Security Checklist
<!-- Check all that apply -->
- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] SQL queries use parameterized statements
- [ ] User permissions verified for data access
- [ ] Tenant isolation maintained (multi-tenancy)
- [ ] Sensitive data not logged

---

## Performance Impact
<!-- Describe any performance implications -->
- [ ] No significant performance impact
- [ ] Performance tested with [tool/method]
- [ ] Potential impact: [describe]

---

## Documentation
<!-- Check all that apply -->
- [ ] Code is self-documenting / comments added
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] User guide updated (if applicable)

---

## Deployment Notes
<!-- Any special deployment considerations -->
- [ ] No special deployment steps needed
- [ ] Database migration required
- [ ] Environment variables to add: [list]
- [ ] Dependencies to install: [list]
- [ ] Cache clear required
- [ ] Other: [describe]

---

## Rollback Plan
<!-- How to rollback if issues occur -->
In case of issues:
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Reviewer Checklist
<!-- For reviewers to check -->
- [ ] Code follows project style guidelines
- [ ] Tests are adequate and pass
- [ ] Screenshots provided and verified
- [ ] No security vulnerabilities
- [ ] Documentation is adequate
- [ ] Breaking changes are documented

---

## Additional Notes
<!-- Any other information for reviewers -->

---

**PR created by**: @username
**Generated with**: [Claude Code](https://claude.com/claude-code)
```

---

## Screenshot Requirements Reference

### Required Screenshots for ALL PRs:

| Screenshot | Purpose | Required |
|------------|---------|----------|
| Backend Test Output | Prove 51 tests pass | **YES** |
| Frontend Test Output | Prove 151 tests pass | **YES** |
| Login Screen | Verify app works | **YES** |
| Dashboard (after login) | Verify core functionality | **YES** |
| Feature Before/After | Show changes made | For UI changes |
| Console (no errors) | Verify no JS errors | For UI changes |

### How to Take Screenshots:

**Backend Tests:**
```bash
cd apps/backend
./mvnw test 2>&1 | tee test-output.txt
# Screenshot the terminal showing "BUILD SUCCESS" and test counts
```

**Frontend Tests:**
```bash
cd apps/frontend
npm test -- --watchAll=false 2>&1 | tee test-output.txt
# Screenshot the terminal showing all tests passed
```

**Application Screenshots:**
1. Open browser DevTools (F12)
2. Clear console
3. Navigate to the screen
4. Take full-page screenshot
5. Include browser console showing no errors

### Screenshot Naming Convention:
```
pr-XXX-backend-tests.png
pr-XXX-frontend-tests.png
pr-XXX-login-screen.png
pr-XXX-dashboard.png
pr-XXX-feature-before.png
pr-XXX-feature-after.png
```

---

## PR Rejection Criteria

PRs will be **automatically rejected** if:

1. **Missing test proof** - No screenshot of passing tests
2. **Missing login screenshot** - Cannot verify app works
3. **Missing dashboard screenshot** - Cannot verify core functionality
4. **Tests failing** - Any test failure
5. **Build broken** - Code doesn't compile
6. **Security issues** - Hardcoded credentials or vulnerabilities
7. **No related issue** - PR not linked to an issue
8. **Incomplete description** - Missing required sections

---

## Quick PR Checklist

Before submitting, verify:

```
[ ] All 51 backend tests pass (screenshot attached)
[ ] All 151 frontend tests pass (screenshot attached)
[ ] Login screen screenshot attached
[ ] Dashboard screenshot attached
[ ] Feature screenshots attached (for UI changes)
[ ] Related issue linked
[ ] All required sections filled
[ ] No console errors in screenshots
[ ] Code compiles without errors
[ ] No hardcoded secrets
```

---

*Last Updated: December 2025*
*Test Requirements: 51 backend + 151 frontend = 202 total tests*
