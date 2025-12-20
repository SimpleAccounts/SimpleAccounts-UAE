# TanStack Table Migration - Progress Checklist

## Migration Status

Last Updated: December 19, 2025

## Infrastructure Components

- [x] ServerDataTable component created
- [x] ServerDataTablePagination component created
- [x] Migration guide documentation
- [x] Quick reference guide
- [x] Example migrations completed

## Screen Migrations

### Completed ✅

- [x] `/apps/frontend/src/screens/customer_invoice/screen.js`
  - Migrated: December 19, 2025
  - Backup: screen-bootstrap-table.js.bak
  - Tested: Pending
  - Notes: Complex actions dropdown, status badges, currency formatting

- [x] `/apps/frontend/src/screens/supplier_invoice/screen.js`
  - Migrated: December 19, 2025
  - Backup: screen-bootstrap-table.js.bak
  - Tested: Pending
  - Notes: Debit note creation, similar pattern to customer invoice

### High Priority - Invoice/Note Screens

- [ ] `/apps/frontend/src/screens/creditNotes/screen.js`
  - Status: Not started
  - Complexity: High (similar to customer invoice)
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Credit note management for customer invoices

- [ ] `/apps/frontend/src/screens/debitNotes/screen.js`
  - Status: Not started
  - Complexity: Medium-High
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Debit note management for supplier invoices

### High Priority - Transaction Screens

- [ ] `/apps/frontend/src/screens/quotation/screen.js`
  - Status: Not started
  - Complexity: Medium-High
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Sales quotations

- [ ] `/apps/frontend/src/screens/purchase_order/screen.js`
  - Status: Not started
  - Complexity: Medium-High
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Purchase order management

- [ ] `/apps/frontend/src/screens/receipt/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Receipt management

- [ ] `/apps/frontend/src/screens/payment/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Payment management

- [ ] `/apps/frontend/src/screens/expense/screen.js`
  - Status: Not started
  - Complexity: Medium-High
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Expense tracking

- [ ] `/apps/frontend/src/screens/journal/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Journal entries

### High Priority - Master Data Screens

- [ ] `/apps/frontend/src/screens/contact/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Customer/Supplier contact management

- [ ] `/apps/frontend/src/screens/product/screen.js`
  - Status: Not started
  - Complexity: Medium-High
  - Estimated time: 20-25 minutes
  - Dependencies: None
  - Notes: Product/Service catalog

- [ ] `/apps/frontend/src/screens/chart_account/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Chart of accounts

- [ ] `/apps/frontend/src/screens/bank_account/screen.js`
  - Status: Not started
  - Complexity: Medium
  - Estimated time: 15-20 minutes
  - Dependencies: None
  - Notes: Bank account management

## Testing Progress

### Completed Screens

- [ ] Customer Invoice
  - [ ] Pagination (all functions)
  - [ ] Sorting (all columns)
  - [ ] Filtering
  - [ ] Actions dropdown
  - [ ] Status badges
  - [ ] Currency formatting
  - [ ] Empty state
  - [ ] Loading state

- [ ] Supplier Invoice
  - [ ] Pagination (all functions)
  - [ ] Sorting (all columns)
  - [ ] Filtering
  - [ ] Actions dropdown
  - [ ] Status badges
  - [ ] Currency formatting
  - [ ] Empty state
  - [ ] Loading state

### Pending Screens

(Add testing checkboxes for each screen as they are migrated)

## Post-Migration Tasks

- [ ] All screens migrated and tested
- [ ] Remove react-bootstrap-table from package.json
- [ ] Remove react-bootstrap-table-next from package.json
- [ ] Remove react-bootstrap-table2-paginator from package.json
- [ ] Run `npm install` to update package-lock.json
- [ ] Update bundle analyzer to verify reduced bundle size
- [ ] Remove all `.bak` files after confirming production stability
- [ ] Update team documentation
- [ ] Create migration lessons learned document

## Rollback Plan

If issues are discovered:

1. **Individual Screen**: Restore from `.bak` file

   ```bash
   cd /apps/frontend/src/screens/[screen-name]
   mv screen.js screen-tanstack.js.failed
   mv screen-bootstrap-table.js.bak screen.js
   ```

2. **Multiple Screens**: Use git to revert specific commits

   ```bash
   git log --oneline  # Find commit hash
   git revert <commit-hash>
   ```

3. **Complete Rollback**: Revert to branch point
   ```bash
   git checkout develop
   git branch -D feature/vite-test-config-180
   ```

## Team Assignments

Assign team members to migrate specific screens:

- Developer 1: creditNotes, debitNotes
- Developer 2: quotation, purchase_order
- Developer 3: receipt, payment
- Developer 4: expense, journal
- Developer 5: contact, product
- Developer 6: chart_account, bank_account

## Known Issues & Solutions

| Issue    | Screen | Solution | Status |
| -------- | ------ | -------- | ------ |
| None yet | -      | -        | -      |

## Performance Metrics

Record bundle size and performance before/after:

### Before Migration

- Bundle size: TBD
- Initial load time: TBD
- Time to interactive: TBD

### After Migration

- Bundle size: TBD (Expected: -50KB to -100KB)
- Initial load time: TBD (Expected: Similar or better)
- Time to interactive: TBD (Expected: Better)

## Migration Notes

### Common Gotchas

1. Page index is 0-based (not 1-based like BootstrapTable)
2. Sorting is an array, not separate name/order variables
3. Actions dropdown state remains separate from table state
4. Always backup original file before migration
5. Test pagination reset on filter/search

### Best Practices

1. Follow the pattern from customer_invoice/supplier_invoice
2. Use the Quick Reference guide for common patterns
3. Test thoroughly before marking complete
4. Keep commit messages clear: "migrate: [screen-name] to TanStack Table"
5. Update this checklist immediately after completing each screen

---

**Status**: 2 of 14 screens completed (14.3%)
**Estimated completion**: 4-6 hours remaining
**Target date**: TBD
