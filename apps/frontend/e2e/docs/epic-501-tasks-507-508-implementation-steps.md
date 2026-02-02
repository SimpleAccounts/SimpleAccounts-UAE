# Epic #501 – Suggested Implementation Steps for #507 and #508

These tasks require **full E2E verification** of transaction linking (not just UI presence). Below are concrete steps; **full E2E tests are implemented** in `bank-account-transaction-workflow.spec.ts` (tests: "should link transaction to receipt", "should link transaction to payment").

---

## Task #507: Implement transaction linking to receipts test

**Goal:** Verify that a bank deposit transaction can be linked to a customer receipt and that the link is persisted and visible.

**Suggested steps:**

1. **Prerequisites (reuse existing workflow setup)**
   - Use the same `testBankAccount` from `beforeAll` / previous tests.
   - Ensure a test customer exists (create via `createTestContact` from `contact-helpers` if not already in workflow).

2. **Create customer invoice and post it**
   - Use `createInvoiceViaAPI` and `postInvoice` from `invoice-helpers` (see `bank-reconciliation-workflow.spec.ts`).
   - Use a product that has `productId` so posting succeeds.
   - Store `invoiceId` and invoice amount.

3. **Create receipt linked to the invoice**
   - Use `createReceiptViaAPI` from `receipt-helpers` with:
     - `contactId`: same customer as invoice
     - `invoiceId`: the posted invoice ID
     - `amount`: e.g. full or partial invoice amount
     - `payMode`: `'BANK'`
   - Store `receiptId` from response.

4. **Create deposit transaction**
   - Use `createDepositTransaction` from `bank-account-helpers` with:
     - `bankId`: `testBankAccount.bankAccountId`
     - `transactionAmount`: same as receipt amount (or match logic)
     - `description`: e.g. `Receipt ${receiptId}`

5. **Get the new transaction ID**
   - Call `getTransactionList(request, token, testBankAccount.bankAccountId, { paginationDisable: true })`.
   - Find the transaction just created (e.g. by amount and type `DEPOSIT` and optionally by description or date).
   - Read `transactionId` or `id` from the transaction object.

6. **Link transaction to receipt via API**
   - Use `matchTransactionWithReceipt(request, token, transactionId, receiptId)` from `reconciliation-helpers`.
   - Assert the call succeeds (no thrown error).

7. **Verify the link (choose one or both)**
   - **API:** If the backend exposes a “transaction detail” or “reconciliation” endpoint that returns linked receipt/invoice info, call it and assert the transaction is linked to the receipt.
   - **UI:** Navigate to the bank account transactions page (or reconciliation page), open the transaction, and assert that the receipt (or invoice) is shown as linked (e.g. receipt number or “linked” badge).

8. **Optional cleanup**
   - Delete or leave test data depending on project conventions.

**Existing reference:** `bank-reconciliation-workflow.spec.ts` already implements a similar flow in “should match transaction with receipt successfully” (create receipt → create deposit → get transaction list → `matchTransactionWithReceipt`). You can reuse that pattern and add the **verification** step (step 7) so the test truly asserts “transaction linking to receipts” is working.

---

## Task #508: Implement transaction linking to payments test

**Goal:** Verify that a bank withdrawal transaction can be linked to a supplier payment and that the link is persisted and visible.

**Suggested steps:**

1. **Prerequisites**
   - Use the same `testBankAccount` from the workflow.
   - Ensure a test **supplier** contact exists (create via supplier contact helper if available).

2. **Create supplier invoice and post it**
   - Use supplier-invoice API/helpers (e.g. `createSupplierInvoiceViaAPI` or equivalent in `supplier-invoice-helpers.ts`) with a product so posting succeeds.
   - Post the supplier invoice.
   - Store supplier invoice ID and amount.

3. **Create payment linked to the supplier invoice**
   - Use `createPaymentViaAPI` from `payment-helpers` with:
     - `contactId`: supplier contact ID
     - `amount`: e.g. full or partial invoice amount
     - `payMode`: `'BANK'`
     - `invoiceMappings`: `[{ invoiceId: <supplierInvoiceId>, amount: <amount> }]`
   - Store `paymentId` from response.

4. **Create withdrawal transaction**
   - Use `createWithdrawalTransaction` from `bank-account-helpers` with:
     - `bankId`: `testBankAccount.bankAccountId`
     - `transactionAmount`: same as payment amount

5. **Get the new transaction ID**
   - Call `getTransactionList(..., { transactionType: 'WITHDRAWAL', paginationDisable: true })`.
   - Find the transaction just created (by amount and type).
   - Read `transactionId` or `id`.

6. **Link transaction to payment**
   - **If backend has an endpoint** like `matchTransactionWithPayment` (or similar in `/rest/reconsile/` or payment/reconciliation APIs), add a helper in `reconciliation-helpers.ts` or `payment-helpers.ts` and call it with `(request, token, transactionId, paymentId)`.
   - **If linking is done only in the UI** (e.g. on reconciliation screen): navigate to the reconciliation page for the bank account, find the withdrawal transaction, use the “Link” / “Match” / “Explain” control to link it to the payment (or supplier invoice), then submit. Assert success message or no error.

7. **Verify the link**
   - **API:** If an endpoint returns transaction–payment link, call it and assert the withdrawal is linked to the payment.
   - **UI:** Navigate to transactions or reconciliation, open the withdrawal, and assert that the payment (or supplier invoice) is shown as linked.

8. **Optional cleanup**
   - Same as #507.

**Note:** The codebase currently has `matchTransactionWithInvoice` and `matchTransactionWithReceipt` in `reconciliation-helpers.ts`. There may be no `matchTransactionWithPayment` yet; if the app links withdrawals to **supplier invoices** instead of payment records, check the backend for an endpoint that matches a transaction to a supplier invoice or payment and add the corresponding helper and test step.

---

## Summary

| Task | Link type              | Key helpers                                      | Verification |
|------|------------------------|--------------------------------------------------|--------------|
| #507 | Transaction → Receipt   | `createReceiptViaAPI`, `createDepositTransaction`, `matchTransactionWithReceipt` | API and/or UI: transaction shows linked receipt |
| #508 | Transaction → Payment  | `createPaymentViaAPI`, `createWithdrawalTransaction`, and match API/UI if available | API and/or UI: transaction shows linked payment |

After implementing these steps in `bank-account-transaction-workflow.spec.ts`, replace the current “link button exists” assertions with the above create → link → verify flow so the epic success criterion “Transaction linking verified” is met.
