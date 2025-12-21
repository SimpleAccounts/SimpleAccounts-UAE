# Pre-PR Validation Scripts

This directory contains scripts to help ensure code quality before creating Pull Requests.

## pre-pr-check.sh

Comprehensive validation script that runs all checks before creating/merging a PR.

### Usage

```bash
# Check against develop branch (default)
bash .scripts/pre-pr-check.sh

# Check against specific branch
bash .scripts/pre-pr-check.sh master
```

### What it checks

1. ✅ Prettier formatting
2. ✅ ESLint errors and warnings
3. ✅ Frontend unit tests
4. ✅ Backend tests (if Java files changed)
5. ⚠️  Common CodeQL issues (non-strict equality comparisons)
6. ⚠️  Unused variables/imports
7. ⚠️  Debug statements (console.log, debugger)
8. ⚠️  TODO/FIXME comments
9. ⚠️  Error handling patterns

### Exit codes

- `0` - All checks passed (warnings are acceptable)
- `1` - Errors found, must be fixed before PR

### Integration

Use before creating PR:

```bash
npm run pre-pr-check
```

Or integrate into your workflow:

```bash
# Before PR
git checkout feature/my-feature
npm run pre-pr-check
# Fix any errors, then create PR
```

