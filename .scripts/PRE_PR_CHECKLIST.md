# Pre-PR Validation Checklist

This document outlines the validation checks that should be run before creating a Pull Request to prevent multiple follow-up commits.

## Quick Start

Before creating a PR, run:

```bash
npm run pre-pr-check
```

This will run all validation checks and report any issues that need to be fixed.

## What Gets Checked

### ✅ Automated Checks (via pre-pr-check.sh)

1. **Prettier Formatting** - Ensures code follows formatting standards
2. **ESLint** - Catches linting errors and warnings
3. **Frontend Unit Tests** - Runs all frontend unit tests
4. **Backend Tests** - Runs backend tests if Java files changed
5. **CodeQL Patterns** - Warns about common issues (non-strict equality, etc.)
6. **Unused Variables** - Checks for unused imports/variables
7. **Debug Statements** - Warns about console.log/debugger
8. **TODO/FIXME** - Warns about incomplete code comments
9. **Error Handling** - Basic check for async error handling

### 🔧 Pre-Commit Hook

Automatically runs on every commit:
- ESLint auto-fix (where possible)
- Prettier formatting
- Java formatting (backend)

### 🚀 Pre-Push Hook

Automatically runs before pushing:
- Formatting check
- Linting check
- Frontend unit tests (if frontend files changed)

## Common Issues and Fixes

### Issue: Prettier Formatting Failed

```bash
# Fix: Auto-format all files
npm run format

# Or check what needs formatting
npm run format:check
```

### Issue: ESLint Errors

```bash
# Fix: Auto-fix ESLint issues
cd apps/frontend
npm exec eslint -- --ext .js,.jsx src/ --fix

# Or use the convenience script
npm run fix
```

### Issue: Test Failures

```bash
# Run tests locally
npm test

# Or frontend only
cd apps/frontend && npm test -- --run
```

### Issue: Unused Variables

ESLint should catch these, but if you see warnings:
- Remove unused imports
- Remove unused variables
- Use ESLint auto-fix: `npm run fix`

### Issue: CodeQL Warnings

Common issues:
- **Non-strict equality**: Use `===` instead of `==`
- **Missing error handling**: Add `.catch()` to promises
- **Unused variables**: Remove or use them

## Recommended Workflow

### Step 1: Development Phase

```bash
# Make changes, commit frequently
git add .
git commit -m "WIP: working on feature X"

# Pre-commit hook will auto-fix formatting/linting
```

### Step 2: Before Creating PR

```bash
# 1. Run comprehensive pre-PR check
npm run pre-pr-check

# 2. Fix any errors reported
#    - npm run format (formatting)
#    - npm run fix (linting)
#    - Fix test failures
#    - Address CodeQL warnings

# 3. Clean up commits (squash WIP commits)
git rebase -i origin/develop

# 4. Final validation
npm run validate

# 5. Push and create PR
git push origin feature/my-feature
```

### Step 3: After PR Creation

- CI will run CodeQL, tests, formatting
- Address any CI failures immediately
- Use fixup commits: `git commit --fixup <commit-hash>`
- Auto-squash: `git rebase -i --autosquash origin/develop`

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run pre-pr-check` | Run comprehensive pre-PR validation |
| `npm run validate` | Run format check, lint, and tests |
| `npm run validate:frontend` | Validate frontend only |
| `npm run validate:backend` | Validate backend only |
| `npm run fix` | Auto-fix formatting and linting |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without fixing |

## Troubleshooting

### Pre-commit hook not running

```bash
# Reinstall husky hooks
npm install
```

### Pre-push hook is too slow

The pre-push hook runs tests. If it's too slow, you can:
1. Skip hooks for this push: `git push --no-verify` (not recommended)
2. Modify `.husky/pre-push` to skip tests (tests still run in pre-pr-check)

### Tests failing in pre-pr-check but passing locally

- Make sure you're on the correct branch
- Try: `cd apps/frontend && rm -rf node_modules && npm install && npm test`
- Check for environment differences

## Benefits

✅ **Catch issues early** - Before creating PR  
✅ **Reduce follow-up commits** - Fix issues before PR review  
✅ **Better code quality** - Automated checks ensure standards  
✅ **Faster CI** - Fewer CI failures mean faster feedback  
✅ **Cleaner history** - Fewer "fix linting" commits  

## Integration with CI

These checks complement (not replace) CI checks:
- **Pre-commit/Pre-push**: Fast, local checks
- **Pre-PR check**: Comprehensive validation
- **CI**: Final validation before merge

All three layers ensure code quality at different stages.

