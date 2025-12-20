# Complete Inventory - react-bootstrap-table Usage

## Summary

This document catalogs all files in the codebase that use `react-bootstrap-table` or `react-bootstrap-table-next`.

**Total Files**: 118 files
**Migrated**: 2 files (1.7%)
**Remaining**: 116 files (98.3%)

## Migrated Files ✅

1. `/apps/frontend/src/screens/customer_invoice/screen.js` (✅ Complete)
2. `/apps/frontend/src/screens/supplier_invoice/screen.js` (✅ Complete)

## High Priority Main Listing Screens (12 files)

These are the primary data listing screens that should be migrated first:

1. `/apps/frontend/src/screens/creditNotes/screen.js`
2. `/apps/frontend/src/screens/debitNotes/screen.js`
3. `/apps/frontend/src/screens/quotation/screen.js`
4. `/apps/frontend/src/screens/purchase_order/screen.js`
5. `/apps/frontend/src/screens/receipt/screen.js`
6. `/apps/frontend/src/screens/payment/screen.js`
7. `/apps/frontend/src/screens/expense/screen.js`
8. `/apps/frontend/src/screens/journal/screen.js`
9. `/apps/frontend/src/screens/contact/screen.js`
10. `/apps/frontend/src/screens/product/screen.js`
11. `/apps/frontend/src/screens/bank_account/screen.js`
12. `/apps/frontend/src/screens/goods_received_note/screen.js`

## Medium Priority - Supporting Screens (30+ files)

### Invoice/Note Detail & Create Screens
- `/apps/frontend/src/screens/customer_invoice/screens/detail/screen.js`
- `/apps/frontend/src/screens/customer_invoice/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/supplier_invoice/screens/create/screen.js`
- `/apps/frontend/src/screens/supplier_invoice/screens/create/screen.jsx`
- `/apps/frontend/src/screens/supplier_invoice/screens/detail/screen.js`
- `/apps/frontend/src/screens/supplier_invoice/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/creditNotes/screens/applyToInvoice/screen.js`
- `/apps/frontend/src/screens/creditNotes/screens/applyToInvoice/screen.jsx`
- `/apps/frontend/src/screens/debitNotes/screens/applyToInvoice/screen.js`
- `/apps/frontend/src/screens/debitNotes/screens/applyToInvoice/screen.jsx`
- `/apps/frontend/src/screens/debitNotes/screens/create/screen.js`
- `/apps/frontend/src/screens/debitNotes/screens/create/screen.jsx`
- `/apps/frontend/src/screens/debitNotes/screens/detail/screen.js`
- `/apps/frontend/src/screens/debitNotes/screens/detail/screen.jsx`

### Quotation Related
- `/apps/frontend/src/screens/quotation/screens/create/screen.js`
- `/apps/frontend/src/screens/quotation/screens/detail/screen.js`
- `/apps/frontend/src/screens/quotation/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/quotation/screens/view/screen.js`
- `/apps/frontend/src/screens/quotation/screens/view/screen.jsx`

### Purchase Order & RFQ
- `/apps/frontend/src/screens/purchase_order/screens/create/screen.js`
- `/apps/frontend/src/screens/purchase_order/screens/create/screen.jsx`
- `/apps/frontend/src/screens/purchase_order/screens/detail/screen.js`
- `/apps/frontend/src/screens/purchase_order/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/request_for_quotation/screen.js`
- `/apps/frontend/src/screens/request_for_quotation/screens/create/screen.js`
- `/apps/frontend/src/screens/request_for_quotation/screens/create/screen.jsx`
- `/apps/frontend/src/screens/request_for_quotation/screens/detail/screen.js`
- `/apps/frontend/src/screens/request_for_quotation/screens/detail/screen.jsx`

### Goods Received Note
- `/apps/frontend/src/screens/goods_received_note/screens/create/screen.js`
- `/apps/frontend/src/screens/goods_received_note/screens/create/screen.jsx`
- `/apps/frontend/src/screens/goods_received_note/screens/detail/screen.js`
- `/apps/frontend/src/screens/goods_received_note/screens/detail/screen.jsx`

### Receipt & Payment
- `/apps/frontend/src/screens/receipt/screens/create/screen.js`
- `/apps/frontend/src/screens/receipt/screens/create/screen.jsx`
- `/apps/frontend/src/screens/payment/screens/create/screen.jsx`

### Product & Inventory
- `/apps/frontend/src/screens/product/screens/detail/screen.js`
- `/apps/frontend/src/screens/product/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/product/screens/inventory_edit/screen.js`
- `/apps/frontend/src/screens/product/screens/inventory_edit/screen.jsx`
- `/apps/frontend/src/screens/product/screens/inventory_history/screen.js`
- `/apps/frontend/src/screens/product/screens/inventory_history/screen.jsx`
- `/apps/frontend/src/screens/inventory/sections/inventory_summary/index.js`

## Lower Priority - Supporting Components & Modals (40+ files)

### Modal Components
- `/apps/frontend/src/screens/customer_invoice/sections/createCN.js`
- `/apps/frontend/src/screens/customer_invoice/sections/createCN.jsx`
- `/apps/frontend/src/screens/customer_invoice/sections/multisupplier_product_modal.js`
- `/apps/frontend/src/screens/customer_invoice/sections/multisupplier_product_modal.jsx`
- `/apps/frontend/src/screens/creditNotes/sections/multisupplier_product_modal.js`
- `/apps/frontend/src/screens/creditNotes/sections/multisupplier_product_modal.jsx`
- `/apps/frontend/src/screens/purchase_order/sections/createGRN.js`
- `/apps/frontend/src/screens/request_for_quotation/sections/createPo.js`
- `/apps/frontend/src/screens/product/screens/detail/sections/invetoryHistorymodal.js`
- `/apps/frontend/src/screens/product/screens/detail/sections/invetoryHistorymodal.jsx`
- `/apps/frontend/src/screens/inventory/sections/inventory_summary/sections/invetoryHistorymodal.js`

### Financial Reports
- `/apps/frontend/src/screens/financial_report/sections/ar_aging_report/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/corporate_tax/screens/payment_history/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/corporate_tax/sections/deleteModal.js`
- `/apps/frontend/src/screens/financial_report/sections/excise_tax_audit_report_MainPage/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/fta_audit_report_MainPage/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/fta_audit_report_MainPage/sections/vatSettingModal.js`
- `/apps/frontend/src/screens/financial_report/sections/invoice_details/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/soa_statementsOfAccounts/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/vat_reports/screens/vatPaymentRecord/screen.js`
- `/apps/frontend/src/screens/financial_report/sections/vat_reports/sections/deleteModal.js`
- `/apps/frontend/src/screens/financial_report/sections/vat_reports/sections/vatSettingModal.js`

### Transaction Reports
- `/apps/frontend/src/screens/transactions_report/sections/account_balance/index.js`
- `/apps/frontend/src/screens/transactions_report/sections/customer_report/index.js`
- `/apps/frontend/src/screens/transactions_report/sections/expense_report/index.js`

### Payroll Screens
- `/apps/frontend/src/screens/payroll_configurations/screen.js`
- `/apps/frontend/src/screens/payroll_configurations/screen.jsx`
- `/apps/frontend/src/screens/payroll_run/screen.js`
- `/apps/frontend/src/screens/payroll_run/screens/approver/screen.js`
- `/apps/frontend/src/screens/payroll_run/screens/approver/screen.jsx`
- `/apps/frontend/src/screens/payroll_run/screens/approver/sections/addEmployees.js`
- `/apps/frontend/src/screens/payroll_run/screens/approver/sections/addEmployees.jsx`
- `/apps/frontend/src/screens/payroll_run/screens/createPayrollList/screen.jsx`
- `/apps/frontend/src/screens/payroll_run/screens/createPayrollList/sections/addEmployees.js`
- `/apps/frontend/src/screens/payroll_run/screens/updatePayroll/screen.js`
- `/apps/frontend/src/screens/payroll_run/screens/updatePayroll/screen.jsx`
- `/apps/frontend/src/screens/payroll_run/screens/updatePayroll/sections/addEmployees.js`
- `/apps/frontend/src/screens/payroll_run/sections/createCompanyDetailsModal.js`
- `/apps/frontend/src/screens/payrollemp/screen.js`
- `/apps/frontend/src/screens/payrollemp/screens/view/screen.js`
- `/apps/frontend/src/screens/payrollemp/screens/view/screen.jsx`
- `/apps/frontend/src/screens/employee_Bank_Details/screen.js`
- `/apps/frontend/src/screens/employee/screen.js`
- `/apps/frontend/src/screens/employment/screen.js`
- `/apps/frontend/src/screens/designation/screen.js`
- `/apps/frontend/src/screens/salary_component/screen.js`
- `/apps/frontend/src/screens/salaryRoles/screen.js`
- `/apps/frontend/src/screens/salaryStructure/screen.js`
- `/apps/frontend/src/screens/salaryTemplate/screen.js`

### Settings & Configuration
- `/apps/frontend/src/screens/currency/screen.js`
- `/apps/frontend/src/screens/currencyConvert/screen.js`
- `/apps/frontend/src/screens/transaction_category/screen.js`
- `/apps/frontend/src/screens/vat_code/screen.js`
- `/apps/frontend/src/screens/vat_transactions/screen.js`
- `/apps/frontend/src/screens/user/screen.js`
- `/apps/frontend/src/screens/users_roles/screen.js`
- `/apps/frontend/src/screens/project/screen.js`
- `/apps/frontend/src/screens/opening_balance/screen.js`

### Import & Bank
- `/apps/frontend/src/screens/import/screen.js`
- `/apps/frontend/src/screens/import/sections/migrate/screen.js`
- `/apps/frontend/src/screens/import/sections/migrate/screen.jsx`
- `/apps/frontend/src/screens/import/sections/migrate_history/screen.js`
- `/apps/frontend/src/screens/import_bank_statement/screen.js`
- `/apps/frontend/src/screens/import_transaction/screen.js`
- `/apps/frontend/src/screens/bank_account/screens/transactions/screens/reconcile/screen.js`

### Other
- `/apps/frontend/src/screens/journal/screens/create/screen.jsx`
- `/apps/frontend/src/screens/journal/screens/detail/screen.jsx`
- `/apps/frontend/src/screens/organization/screen.js`
- `/apps/frontend/src/screens/organization/screen.jsx`
- `/apps/frontend/src/screens/tax_report/screen.js`
- `/apps/frontend/src/screens/reports_filing/screen.js`
- `/apps/frontend/src/components/invoice_view_journal_entries/index.js`

## Migration Strategy

### Phase 1: Core Invoice Screens (Completed)
- [x] customer_invoice/screen.js
- [x] supplier_invoice/screen.js

### Phase 2: High Priority Listing Screens (4-6 hours)
Focus on main listing screens that users interact with most:
1. creditNotes, debitNotes
2. quotation, purchase_order
3. receipt, payment
4. expense, journal
5. contact, product
6. bank_account, goods_received_note

### Phase 3: Supporting Detail/Create Screens (6-8 hours)
Migrate detail and create screens for migrated listing screens:
- Invoice detail screens
- Note detail screens
- Order create/detail screens
- Receipt/payment create screens
- Product detail/inventory screens

### Phase 4: Reports & Financial Screens (4-6 hours)
- Financial reports
- Transaction reports
- VAT reports
- Tax reports

### Phase 5: Payroll Screens (6-8 hours)
- Payroll configurations
- Payroll run screens
- Employee screens
- Salary component screens

### Phase 6: Settings & Modals (4-6 hours)
- Currency, VAT codes
- User management
- Import screens
- Modal components
- Supporting components

## Total Estimated Time

- **Phase 1**: 1 hour (✅ Complete)
- **Phase 2**: 4-6 hours
- **Phase 3**: 6-8 hours
- **Phase 4**: 4-6 hours
- **Phase 5**: 6-8 hours
- **Phase 6**: 4-6 hours

**Total**: 25-35 hours of development time

## Recommendation

Given the scope of this migration:

1. **Start with Phase 2**: Complete the 12 high-priority listing screens (4-6 hours)
2. **Evaluate impact**: Test thoroughly and gather feedback
3. **Continue iteratively**: Move through phases based on priority and user impact
4. **Consider parallel work**: Multiple developers can work on different screens simultaneously

## Notes

- Some files appear multiple times (e.g., screen.js and screen.jsx) - these are duplicates
- Many modal components use tables for selection - these may be lower priority
- Report screens may have different requirements than CRUD screens
- Backup files (_backup.js) should be excluded from migration

---

**Last Updated**: December 19, 2025
**Completion**: 2/118 files (1.7%)
