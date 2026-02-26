# Phase 4: Remaining Tasks Action Plan

**Milestone:** Phase 4: Banking & Reporting (E2E Workflow Tests)  
**Branch:** `phase-4-completed-tasks-verification`  
**Last updated:** 2026

This document outlines the action plan for the **one remaining task** across the Phase 4 epics. **#574** is implemented (see below). All other tasks for Epic #591 (VAT Filing), #581 (Financial Reporting), and #571 (Bank Reconciliation) are implemented and covered by the verification spec.

---

## Summary of Remaining Tasks

| Epic | Task | Title | Priority |
|------|------|--------|-----------|
| #591 VAT Filing | **#597** | Implement VAT filing test (if automated) | Optional |

**#574 (Bank Reconciliation – Import Statement)** is implemented: tests in `bank-reconciliation-workflow.spec.ts` and `phase-4-completed-tasks-verification.spec.ts`; Reconcile/Import Statement navigation fixed.

---

## Task #597: Implement VAT filing test (if automated)

**Epic:** [VAT Filing Workflow E2E Tests (#591)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/591)  
**Issue:** [#597](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/597)

### Context

- The epic description states: *"Implement VAT filing test **(if automated)**"*.
- If the application does **not** expose an automated VAT filing flow (e.g. submit to authority via API or UI), this task can be closed as **N/A** or **Won’t do** with a short comment.
- If the application **does** expose automated filing (e.g. "File VAT return" button or API that submits to the tax authority), then a Playwright test should be added.

### Action Plan

1. **Clarify product behaviour**
   - Confirm with product/backend whether there is an automated VAT filing flow (UI or API).
   - If **no**: Close #597 with comment: *"VAT filing is not automated; task N/A."*
   - If **yes**: Proceed to step 2.

2. **Implement test (if automated)**
   - **Location:** `apps/frontend/e2e/vat-filing-workflow.spec.ts`
   - **Helper (if needed):** Add e.g. `submitVatFiling()` or `navigateToVatFiling()` in `helpers/vat-helpers.ts` if an API or UI flow exists.
   - **Test steps:**
     - Ensure a VAT return/period is in a state that allows filing (e.g. generated, not yet filed).
     - Trigger the filing action (API or UI).
     - Assert success (e.g. status change to "Filed", or success response).
   - **Add to verification spec:** Add a test in `phase-4-completed-tasks-verification.spec.ts` under Epic #591 that runs this flow (or skip if filing is not available in test env).

3. **Acceptance**
   - E2E run includes the new test when automated filing is available.
   - #597 closed with a reference to the implemented test or N/A decision.

---

## Task #574: Bank Reconciliation – Import Statement ✅ Implemented

**Epic:** [Bank Reconciliation Workflow E2E Tests (#571)](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/571)  
**Issue:** [#574](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/574)

### Status

- **Implemented.** Task #574 (“Test imports bank statement, verifies transactions are imported correctly”) is covered by:
  - **Workflow spec:** `bank-reconciliation-workflow.spec.ts` – test “should open Import Statement from View Transaction and verify transaction list” (navigates to View Transaction, clicks Import Statement, verifies Import Statement page; adds a transaction via API and verifies it appears in the list).
  - **Verification spec:** `phase-4-completed-tasks-verification.spec.ts` – test “[#574] Import bank statement and verify transactions” (navigates to View Transaction, clicks Import Statement, verifies upload-statement page).
- **Fix applied:** Reconcile and Import Statement buttons on the View Transaction page now pass `state: { bankAccountId }` to `navigate()`, so both buttons correctly open the reconciliation and import-statement pages.

---

## Verification Spec (Completed Tasks)

All **completed** Phase 4 tasks are covered by:

- **Single suite:**  
  `apps/frontend/e2e/phase-4-completed-tasks-verification.spec.ts`

- **Full epic coverage:**  
  - `vat-filing-workflow.spec.ts` (Epic #591)  
  - `financial-reporting-workflow.spec.ts` (Epic #581)  
  - `bank-reconciliation-workflow.spec.ts` (Epic #571)

**Run verification only:**

```bash
cd apps/frontend
npx playwright test phase-4-completed-tasks-verification.spec.ts
```

**Run full Phase 4 workflow tests:**

```bash
npx playwright test vat-filing-workflow.spec.ts financial-reporting-workflow.spec.ts bank-reconciliation-workflow.spec.ts
```

---

## Checklist

- [ ] **#597:** Product decision (automated VAT filing yes/no) documented; test added or issue closed as N/A.
- [x] **#574:** Test added in `bank-reconciliation-workflow.spec.ts` and in `phase-4-completed-tasks-verification.spec.ts`; Reconcile/Import Statement navigation fixed; issue #574 can be closed.
