# Guide: Create GitHub Issue and PR for Bank Transaction Code Quality Fixes

## Step 1: Create GitHub Issue

1. Go to: https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/new
2. **Title:** `Code quality: Fix CodeQL warnings in bank account transaction screens`
3. **Description:** Copy the content from `GITHUB_ISSUE_BANK_TRANSACTION_CODE_QUALITY.md`
4. **Labels:** Add labels like `code-quality`, `frontend`, `bug` (if applicable)
5. Click **Submit new issue**
6. **Note the issue number** (e.g., #231)

## Step 2: Create Pull Request

1. Go to: https://github.com/SimpleAccounts/SimpleAccounts-UAE/compare/develop...fix/bank-transaction-code-quality
   - Or visit: https://github.com/SimpleAccounts/SimpleAccounts-UAE/pull/new/fix/bank-transaction-code-quality
2. **Base branch:** `develop`
3. **Compare branch:** `fix/bank-transaction-code-quality`
4. **Title:** `fix(bank-transactions): resolve CodeQL warnings for code quality`
5. **Description:** Copy the content from `PR_DESCRIPTION_BANK_TRANSACTION_CODE_QUALITY.md`
6. **Link to issue:** Add `Closes #<ISSUE_NUMBER>` or `Fixes #<ISSUE_NUMBER>` in the description
7. Click **Create pull request**

## Step 3: Verify PR Details

After creating the PR, verify:
- [ ] All commits are included (should see 2 commits)
- [ ] Files changed shows 4 files modified
- [ ] PR description is complete
- [ ] Issue is linked (if you added the "Closes #" reference)

## Quick Links

- **Repository:** https://github.com/SimpleAccounts/SimpleAccounts-UAE
- **New Issue:** https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/new
- **Create PR:** https://github.com/SimpleAccounts/SimpleAccounts-UAE/pull/new/fix/bank-transaction-code-quality
- **Branch:** `fix/bank-transaction-code-quality`

## Files Ready

- ✅ `GITHUB_ISSUE_BANK_TRANSACTION_CODE_QUALITY.md` - Issue template
- ✅ `PR_DESCRIPTION_BANK_TRANSACTION_CODE_QUALITY.md` - PR description
- ✅ Branch pushed to remote
- ✅ All fixes committed and tested

