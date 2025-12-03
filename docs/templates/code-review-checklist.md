# Code Review Checklist for SimpleAccounts-UAE

Use this checklist when reviewing Pull Requests.

---

## Before Starting Review

- [ ] PR has mandatory screenshots (tests, login, dashboard)
- [ ] PR description is complete
- [ ] Related issue is linked
- [ ] All CI checks pass

---

## 1. Code Quality

### General
- [ ] Code is readable and self-documenting
- [ ] Variable/function names are descriptive
- [ ] No commented-out code (unless documented reason)
- [ ] No debug statements (`console.log`, `System.out.println`)
- [ ] DRY principle followed (no duplicate code)
- [ ] SOLID principles followed where applicable

### Backend (Java)
- [ ] Proper exception handling (no empty catch blocks)
- [ ] Resources properly closed (try-with-resources)
- [ ] Logging uses SLF4J logger, not System.out
- [ ] No hardcoded values (use constants/config)
- [ ] Proper use of Optional for null handling
- [ ] BigDecimal used for financial calculations (not float/double)

### Frontend (React)
- [ ] Components are properly structured
- [ ] State management is appropriate
- [ ] No memory leaks (cleanup in useEffect)
- [ ] PropTypes or TypeScript types defined
- [ ] Error boundaries for fault tolerance
- [ ] Accessibility attributes present (aria-*, alt, etc.)

---

## 2. Security

### Critical Security Checks
- [ ] **No hardcoded credentials** (passwords, API keys, secrets)
- [ ] **Input validation** implemented for all user inputs
- [ ] **SQL injection** prevention (parameterized queries)
- [ ] **XSS prevention** (sanitized output, no dangerouslySetInnerHTML)
- [ ] **CSRF protection** maintained
- [ ] **Authentication** required for protected endpoints
- [ ] **Authorization** checked (user has permission for action)

### Data Protection
- [ ] Sensitive data not logged
- [ ] PII handled according to regulations
- [ ] File uploads validated (type, size, content)
- [ ] Role-based access control enforced (single-tenant with RBAC)

---

## 3. Testing

### Test Coverage
- [ ] Unit tests added for new code
- [ ] Existing tests updated if behavior changed
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] All 51 backend tests pass (screenshot required)
- [ ] All 151 frontend tests pass (screenshot required)

### Test Quality
- [ ] Tests are independent (no order dependency)
- [ ] Tests have clear assertions
- [ ] Test names describe what is being tested
- [ ] Mocks used appropriately

---

## 4. Performance

### Backend
- [ ] N+1 query problem avoided
- [ ] Proper pagination for large datasets
- [ ] Caching used where appropriate
- [ ] No unnecessary database calls
- [ ] Transactions scoped appropriately

### Frontend
- [ ] No unnecessary re-renders
- [ ] Large lists virtualized
- [ ] Images optimized
- [ ] Bundle size impact considered
- [ ] Lazy loading used where appropriate

---

## 5. Architecture & Design

### Backend
- [ ] Service layer properly separated
- [ ] Repository pattern followed
- [ ] DTOs used for API communication
- [ ] Business logic in service layer (not controller)
- [ ] Proper use of dependency injection

### Frontend
- [ ] Component hierarchy makes sense
- [ ] State lifted appropriately
- [ ] Redux used correctly (actions, reducers)
- [ ] API calls in services, not components
- [ ] Routes properly structured

---

## 6. Database & Migrations

- [ ] Migration is reversible
- [ ] No breaking changes to existing data
- [ ] Indexes added for queried columns
- [ ] Foreign keys properly defined
- [ ] Data types appropriate
- [ ] Default values sensible

---

## 7. API Design

- [ ] RESTful conventions followed
- [ ] HTTP methods used correctly
- [ ] Status codes appropriate
- [ ] Error responses consistent
- [ ] Backward compatible (no breaking changes)
- [ ] Versioning considered if breaking change needed

---

## 8. Documentation

- [ ] Complex logic has comments explaining WHY
- [ ] Public APIs documented
- [ ] README updated if setup changed
- [ ] Breaking changes documented

---

## 9. UAE-Specific Requirements

- [ ] VAT calculations correct (5% rate)
- [ ] Currency precision (2 decimal places)
- [ ] Date format correct (dd/MM/yyyy display)
- [ ] Arabic text handled (RTL support)
- [ ] Regulatory compliance maintained

---

## 10. Screenshots Verification

**Verify ALL required screenshots are present:**

- [ ] Backend test results (51 tests passing)
- [ ] Frontend test results (151 tests passing)
- [ ] Login page screenshot
- [ ] Dashboard screenshot (after login)
- [ ] Feature-specific screenshots (for UI changes)
- [ ] Browser console showing no errors

---

## Review Decision

### Approve if:
- All critical checks pass
- All mandatory screenshots present
- Tests pass
- No security vulnerabilities
- Code quality acceptable

### Request Changes if:
- Missing screenshots
- Tests failing
- Security issues found
- Code quality issues
- Missing documentation

### Comments to Leave:
- Be specific and actionable
- Explain WHY something is an issue
- Suggest alternatives when requesting changes
- Praise good code practices

---

## Review Comment Templates

### Security Issue
```
🔒 **Security Concern**: [description]

This could lead to [vulnerability type].

**Suggested fix**: [solution]
```

### Code Quality
```
💡 **Suggestion**: [description]

Consider [alternative approach] because [reason].
```

### Required Change
```
⚠️ **Required Change**: [description]

This needs to be fixed before merge because [reason].
```

### Praise
```
✨ Great implementation of [feature]! Clean and well-tested.
```

---

*Last Updated: December 2025*
