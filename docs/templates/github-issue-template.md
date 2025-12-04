# GitHub Issue Templates for SimpleAccounts-UAE

Use the appropriate template below when creating issues.

---

## Bug Report Template

```markdown
---
name: Bug Report
about: Report a bug or unexpected behavior
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
<!-- A clear and concise description of what the bug is -->

## Environment
- **Browser**: [e.g., Chrome 120, Safari 17]
- **OS**: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- **Environment**: [e.g., Production, Staging, Local]
- **User Role**: [e.g., Admin, Accountant, Employee]
- **Company/Tenant**: [if applicable]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

## Expected Behavior
<!-- What you expected to happen -->

## Actual Behavior
<!-- What actually happened -->

## Screenshots/Videos
<!-- Add screenshots or screen recordings to help explain the problem -->
| Step | Screenshot |
|------|------------|
| Before | ![before](url) |
| Error | ![error](url) |

## Console Errors (if any)
```
<!-- Paste browser console errors here -->
```

## Backend Logs (if available)
```
<!-- Paste relevant backend logs here -->
```

## Additional Context
<!-- Add any other context about the problem here -->

## Impact
- [ ] Blocker - Cannot use the application
- [ ] Critical - Major feature broken
- [ ] Major - Feature partially broken
- [ ] Minor - Cosmetic or minor inconvenience
```

---

## Feature Request Template

```markdown
---
name: Feature Request
about: Suggest a new feature or enhancement
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Feature Summary
<!-- A clear and concise description of the feature -->

## Problem Statement
<!-- What problem does this feature solve? -->
As a [type of user], I want [goal] so that [benefit].

## Proposed Solution
<!-- Describe your proposed solution -->

## Alternative Solutions
<!-- Have you considered any alternative approaches? -->

## User Story
<!-- Break down into user stories if applicable -->
- [ ] As a user, I can...
- [ ] As an admin, I can...

## Acceptance Criteria
<!-- Define what "done" looks like -->
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Mockups/Wireframes
<!-- Add any mockups, wireframes, or design references -->

## Technical Considerations
<!-- Any technical notes or constraints -->
- Backend changes needed: Yes/No
- Database changes needed: Yes/No
- Third-party integrations: None/List them

## Priority
- [ ] High - Critical for business
- [ ] Medium - Important but not urgent
- [ ] Low - Nice to have

## Additional Context
<!-- Add any other context or screenshots -->
```

---

## Task/Chore Template

```markdown
---
name: Task/Chore
about: Technical task, refactoring, or maintenance work
title: '[TASK] '
labels: chore
assignees: ''
---

## Task Description
<!-- What needs to be done? -->

## Motivation
<!-- Why is this task needed? -->

## Scope
<!-- What is included/excluded from this task? -->

### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 1
- Item 2

## Technical Approach
<!-- How will this be implemented? -->

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass
- [ ] No regression

## Dependencies
<!-- List any dependencies or blockers -->
- Depends on: #issue_number
- Blocks: #issue_number

## Estimated Effort
- [ ] Small (< 4 hours)
- [ ] Medium (4-16 hours)
- [ ] Large (> 16 hours)
```

---

## Security Vulnerability Template

```markdown
---
name: Security Vulnerability
about: Report a security issue (DO NOT include sensitive details publicly)
title: '[SECURITY] '
labels: security
assignees: ''
---

## Vulnerability Type
- [ ] Authentication/Authorization bypass
- [ ] Data exposure
- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Other: ___________

## Severity Assessment
- [ ] Critical - Immediate action required
- [ ] High - Significant risk
- [ ] Medium - Moderate risk
- [ ] Low - Minor risk

## Summary
<!-- Brief description WITHOUT exposing exploit details -->

## Affected Components
<!-- Which parts of the system are affected? -->

## Steps to Reproduce
<!-- Contact security team privately for detailed steps -->
Please contact the security team directly with detailed reproduction steps.

## Suggested Mitigation
<!-- Any suggestions for fixing the issue -->

## Reporter Contact
<!-- How can we reach you for more details? -->

---
**IMPORTANT**: For critical security issues, please email security@simpleaccounts.io directly instead of creating a public issue.
```

---

## Documentation Request Template

```markdown
---
name: Documentation Request
about: Request new or improved documentation
title: '[DOCS] '
labels: documentation
assignees: ''
---

## Documentation Type
- [ ] New documentation needed
- [ ] Existing documentation is incorrect
- [ ] Existing documentation is incomplete
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide

## Description
<!-- What documentation is needed or what's wrong with existing docs? -->

## Location
<!-- Where should this documentation be or where is the incorrect doc? -->

## Suggested Content
<!-- What should the documentation include? -->

## Audience
<!-- Who is this documentation for? -->
- [ ] End users
- [ ] Developers
- [ ] System administrators
- [ ] All
```

---

## Issue Labels Reference

| Label | Description | Color |
|-------|-------------|-------|
| `bug` | Something isn't working | #d73a4a |
| `enhancement` | New feature or request | #a2eeef |
| `chore` | Technical task/maintenance | #fef2c0 |
| `security` | Security related | #ee0701 |
| `documentation` | Documentation improvements | #0075ca |
| `P0-critical` | Must fix immediately | #b60205 |
| `P1-high` | High priority | #d93f0b |
| `P2-medium` | Medium priority | #fbca04 |
| `P3-low` | Low priority | #0e8a16 |
| `backend` | Backend related | #5319e7 |
| `frontend` | Frontend related | #1d76db |
| `needs-triage` | Needs review | #ededed |
| `wontfix` | Will not be fixed | #ffffff |
| `duplicate` | Duplicate issue | #cfd3d7 |

---

*Last Updated: December 2025*
