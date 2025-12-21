import { combineReducers } from 'redux';

// Import new RTK slices
import authReducer from './global/auth/authSlice';
import commonReducer from './global/common/commonSlice';

// Import reducers directly from their slice/reducer files
import dashboardReducer from 'screens/dashboard/reducer';
import journalReducer from 'screens/journal/reducer';
import bankAccountReducer from 'screens/bank_account/reducer';
import employeeReducer from 'screens/employee/reducer';
import contactReducer from 'screens/contact/reducer';
import expenseReducer from 'screens/expense/reducer';
import generalSettingsReducer from 'screens/general_settings/reducer';
import customerInvoiceReducer from 'screens/customer_invoice/reducer';
import receiptReducer from 'screens/receipt/reducer';
import supplierInvoiceReducer from 'screens/supplier_invoice/reducer';
import productReducer from 'screens/product/reducer';
import projectReducer from 'screens/project/reducer';
import paymentReducer from 'screens/payment/reducer';
import transactionCategoryReducer from 'screens/transaction_category/reducer';
import userReducer from 'screens/user/userSlice';
import vatCodeReducer from 'screens/vat_code/reducer';
import currencyReducer from 'screens/currency/reducer';
import currencyConvertReducer from 'screens/currencyConvert/reducer';
import helpReducer from 'screens/help/reducer';
import notificationReducer from 'screens/notification/reducer';
import organizationReducer from 'screens/organization/reducer';
import usersRolesReducer from 'screens/users_roles/reducer';
import dataBackupReducer from 'screens/data_backup/reducer';
import transactionsReportReducer from 'screens/transactions_report/reducer';
import chartAccountReducer from 'screens/chart_account/reducer';
import productCategoryReducer from 'screens/product_category/reducer';
import profileReducer from 'screens/profile/reducer';
import importTransactionReducer from 'screens/import_transaction/reducer';
import openingBalanceReducer from 'screens/opening_balance/reducer';
import vatTransactionsReducer from 'screens/vat_transactions/reducer';
import inventoryReducer from 'screens/inventory/reducer';
import quotationReducer from 'screens/quotation/reducer';
import requestForQuotationReducer from 'screens/request_for_quotation/reducer';
import purchaseOrderReducer from 'screens/purchase_order/reducer';
import goodsReceivedNoteReducer from 'screens/goods_received_note/reducer';
import financialReportReducer from 'screens/financial_report/reducer';
import salaryRolesReducer from 'screens/salaryRoles/reducer';
import salaryStructureReducer from 'screens/salaryStructure/reducer';
import salaryTemplateReducer from 'screens/salaryTemplate/reducer';
import designationReducer from 'screens/designation/reducer';
import payrollEmployeeReducer from 'screens/payrollemp/reducer';
import creditNotesReducer from 'screens/creditNotes/reducer';
import importReducer from 'screens/import/reducer';
import payrollRunReducer from 'screens/payroll_run/reducer';
import debitNotesReducer from 'screens/debitNotes/reducer';

import InvoiceViewJournalReducer from 'components/invoice_view_journal_entries/invoiceViewJournalSlice';

const reducer = combineReducers({
  common: commonReducer,
  auth: authReducer,

  dashboard: dashboardReducer,
  journal: journalReducer,
  bank_account: bankAccountReducer,
  employee: employeeReducer,
  contact: contactReducer,
  expense: expenseReducer,
  settings: generalSettingsReducer,
  customer_invoice: customerInvoiceReducer,
  vat_transactions: vatTransactionsReducer,
  receipt: receiptReducer,
  supplier_invoice: supplierInvoiceReducer,
  debit_notes: debitNotesReducer,
  request_for_quotation: requestForQuotationReducer,
  purchase_order: purchaseOrderReducer,
  goods_received_note: goodsReceivedNoteReducer,
  quotation: quotationReducer,
  product: productReducer,
  project: projectReducer,
  payment: paymentReducer,
  transaction: transactionCategoryReducer,
  currencyConvert: currencyConvertReducer,
  vat: vatCodeReducer,
  currency: currencyReducer,
  help: helpReducer,
  reports: financialReportReducer,
  notification: notificationReducer,
  organization: organizationReducer,
  users_roles: usersRolesReducer,
  data_backup: dataBackupReducer,
  transaction_data: transactionsReportReducer,
  chart_account: chartAccountReducer,
  product_category: productCategoryReducer,
  profile: profileReducer,
  import_transaction: importTransactionReducer,
  opening_balance: openingBalanceReducer,
  inventory: inventoryReducer,
  salaryRoles: salaryRolesReducer,
  salaryStructure: salaryStructureReducer,
  salarytemplate: salaryTemplateReducer,
  employeeDesignation: designationReducer,
  payrollEmployee: payrollEmployeeReducer,
  user: userReducer,
  creditNote: creditNotesReducer,
  payrollRun: payrollRunReducer,
  import: importReducer,
  invoice_view_journal: InvoiceViewJournalReducer,
});

export default reducer;
