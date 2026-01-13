// Export screen module objects (not lazy-loaded) for use in admin routes
// This file imports the actual module objects so we can access .screen properties
// Reuses screens/reducers.js and adds sub-screens (Create, Detail, View, etc.)

// Import main screens from reducers.js (already has direct imports)
import {
  Dashboard,
  Journal,
  BankAccount,
  Employee,
  Contact,
  Expense,
  GeneralSettings,
  CustomerInvoice,
  Receipt,
  SupplierInvoice,
  Product,
  Project,
  Payment,
  TransactionCategory,
  User,
  VatCode,
  Currency,
  CurrencyConvert,
  Help,
  Notification,
  Organization,
  UsersRoles,
  DataBackup,
  TransactionsReport,
  ChartAccount,
  ProductCategory,
  Profile,
  ImportTransaction,
  OpeningBalance,
  VatTransactions,
  Inventory,
  Quotation,
  RequestForQuotation,
  PurchaseOrder,
  GoodsReceivedNote,
  FinancialReport,
  SalaryRoles,
  SalaryStucture,
  SalaryTemplate,
  Designation,
  PayrollEmployee,
  CreditNotes,
  Import,
  PayrollRun,
  DebitNotes,
} from './reducers';

// Import DashboardTwo separately (not in reducers.js)
import DashboardTwo from './dashboard/screen-two.jsx';

// Import sub-screens (Create, Detail, View, etc.) that are used in routes
// Journal screens
import CreateJournal from './journal/screens/create/index.js';
import DetailJournal from './journal/screens/detail/index.js';

// Opening Balance screens
import CreateOpeningBalance from './opening_balance/screens/create/index.js';
import DetailOpeningBalance from './opening_balance/screens/detail/index.js';

// Bank Account screens
import CreateBankAccount from './bank_account/screens/create/index.js';
import DetailBankAccount from './bank_account/screens/detail/index.js';
import BankTransactions from './bank_account/screens/transactions/index.js';
import CreateBankTransaction from './bank_account/screens/transactions/screens/create/index.js';
import DetailBankTransaction from './bank_account/screens/transactions/screens/detail/index.js';
import ReconcileTransaction from './bank_account/screens/transactions/screens/reconcile/index.js';
import ImportBankStatement from './import_bank_statement/index.js';

// Customer Invoice screens
import CreateCustomerInvoice from './customer_invoice/screens/create/index.js';
import DetailCustomerInvoice from './customer_invoice/screens/detail/index.js';
import ViewCustomerInvoice from './customer_invoice/screens/view/index.js';
import RecordCustomerPayment from './customer_invoice/screens/record_payment/index.js';

// Credit Notes screens
import CreateCreditNote from './creditNotes/screens/create/index.js';
import DetailCreditNote from './creditNotes/screens/detail/index.js';
import ViewCreditNote from './creditNotes/screens/view/index.js';
import ApplyToInvoice from './creditNotes/screens/applyToInvoice/index.js';
import Refund from './creditNotes/screens/refund/index.js';

// Receipt screens
import CreateReceipt from './receipt/screens/create/index.js';
import DetailReceipt from './receipt/screens/detail/index.js';

// Supplier Invoice screens
import CreateSupplierInvoice from './supplier_invoice/screens/create/index.js';
import DetailSupplierInvoice from './supplier_invoice/screens/detail/index.js';
import ViewInvoice from './supplier_invoice/screens/view/index.js';
import RecordSupplierPayment from './supplier_invoice/screens/record_payment/index.js';

// Request for Quotation screens
import CreateRequestForQuotation from './request_for_quotation/screens/create/index.js';
import DetailRequestForQuotation from './request_for_quotation/screens/detail/index.js';
import ViewRequestForQuotation from './request_for_quotation/screens/view/index.js';

// Purchase Order screens
import CreatePurchaseOrder from './purchase_order/screens/create/index.js';
import DetailPurchaseOrder from './purchase_order/screens/detail/index.js';
import ViewPurchaseOrder from './purchase_order/screens/view/index.js';

// Goods Received Note screens
import CreateGoodsReceivedNote from './goods_received_note/screens/create/index.js';
import DetailGoodsReceivedNote from './goods_received_note/screens/detail/index.js';
import ViewGoodsReceivedNote from './goods_received_note/screens/view/index.js';

// Quotation screens
import CreateQuotation from './quotation/screens/create/index.js';
import DetailQuotation from './quotation/screens/detail/index.js';
import ViewQuotation from './quotation/screens/view/index.js';

// Expense screens
import CreateExpense from './expense/screens/create/index.js';
import DetailExpense from './expense/screens/detail/index.js';
import ViewExpense from './expense/screens/view/index.js';

// Payment screens
import CreatePayment from './payment/screens/create/index.js';
import DetailPayment from './payment/screens/detail/index.js';

// Debit Notes screens
import CreateDebitNote from './debitNotes/screens/create/index.js';
import DetailDebitNote from './debitNotes/screens/detail/index.js';
import DebitNoteRefund from './debitNotes/screens/refund/index.js';
import ApplyToSupplierInvoice from './debitNotes/screens/applyToInvoice/index.js';
import ViewDebitNote from './debitNotes/screens/view/index.js';

// Report screens (sub-screens of FinancialReport)
import ProfitAndLossReport from './financial_report/sections/profit_and_loss/index.js';
import BalanceSheet from './financial_report/sections/balance_sheet/index.js';
import HorizontalBalanceSheet from './financial_report/sections/horizontal_balance_sheet/index.js';
import TrailBalances from './financial_report/sections/trail_Balances/index.js';
import CustomerAccountStatement from './financial_report/sections/customer_account_statement/index.js';
import Cashflow from './financial_report/sections/cashflow/index.js';
import VatReturnsReport from './financial_report/sections/vat_return/index.js';
import DetailedGeneralLedgerReport from './detailed_general_ledger_report/index.js';
import SalesByCustomer from './financial_report/sections/sales_by_customer/index.js';
import SalesByProduct from './financial_report/sections/sales_by_product/index.js';
import PurchaseByitem from './financial_report/sections/purchase_by_item/index.js';
import PurchaseByVendor from './financial_report/sections/purchase_by_vendor/index.js';
import ReceivableInvoiceDetailsReport from './financial_report/sections/receivable_invoice_details/index.js';
import ReceivableInvoiceSummary from './financial_report/sections/receivable_invoice_summary/index.js';
import PayablesInvoiceDetailsReport from './financial_report/sections/payables_invoice_details/index.js';
import PayablesInvoiceSummary from './financial_report/sections/payables_invoice_summary/index.js';
import PayrollSummaryReport from './financial_report/sections/payroll_summary/index.js';
import VatReports from './financial_report/sections/vat_reports/index.js';
import VatPaymentRecord from './financial_report/sections/vat_reports/screens/vatPaymentRecord/index.js';
import RecordTaxClaim from './financial_report/sections/vat_reports/screens/record_claim_tax/index.js';
import RecordVatPayment from './financial_report/sections/vat_reports/screens/record_tax_payment/index.js';
import ARAgingReport from './financial_report/sections/ar_aging_report/index.js';
import CorporateTax from './financial_report/sections/corporate_tax/index.js';
import CorporateTaxPaymentHistory from './financial_report/sections/corporate_tax/screens/payment_history/index.js';
import CorporateTaxPaymentRecord from './financial_report/sections/corporate_tax/screens/payment_record/index.js';
import ViewCorporateTax from './financial_report/sections/corporate_tax/screens/view/index.js';
import DebitNoteDetailsReport from './financial_report/sections/debit_note_details/index.js';
import CreditNoteDetailsReport from './financial_report/sections/credit_note_details/index.js';
import ExpenseDetailsReport from './financial_report/sections/expense_details/index.js';
import ExpenseByCategory from './financial_report/sections/expense_by_catogery/index.js';
import InvoiceDetails from './financial_report/sections/invoice_details/index.js';
import SOAReport from './financial_report/sections/soa_statementsOfAccounts/index.js';
import FtaAuditReport from './financial_report/sections/fta_audit_report_MainPage/index.js';
import GenerateAuditFile from './financial_report/sections/fta_audit_report_MainPage/screens/generate_Fta_audit_report/index.js';
import ViewFtaAuditReport from './financial_report/sections/Fta_Audit_Report/index.js';
import ExciseTaxAuditReport from './financial_report/sections/excise_tax_audit_report_MainPage/index.js';
import ViewFtaExciseAuditReport from './financial_report/sections/Excise_Audit_Report/index.js';
import SubReports from './financial_report/sections/vat_return/screens/subReports/index.js';

// Master screens (sub-screens)
import CreateChartAccount from './chart_account/screens/create/index.js';
import DetailChartAccount from './chart_account/screens/detail/index.js';
import CreateContact from './contact/screens/create/index.js';
import DetailContact from './contact/screens/detail/index.js';
import ViewContact from './contact/screens/view/index.js';
import EditContact from './contact/screens/edit/index.js';
import ViewEmployee from './payrollemp/screens/view/index.js';
import CreateProduct from './product/screens/create/index.js';
import DetailProduct from './product/screens/detail/index.js';
import InventoryEdit from './product/screens/inventory_edit/index.js';
import InventoryHistory from './product/screens/inventory_history/index.js';
import CreateProject from './project/screens/create/index.js';
import DetailProject from './project/screens/detail/index.js';
import CreateVatCode from './vat_code/screens/create/index.js';
import DetailVatCode from './vat_code/screens/detail/index.js';
import CreateCurrencyConvert from './currencyConvert/screens/create/index.js';
import DetailCurrencyConvert from './currencyConvert/screens/detail/index.js';
import CreateProductCategory from './product_category/screens/create/index.js';
import DetailProductCategory from './product_category/screens/detail/index.js';
import CreateCurrency from './currency/screens/create/index.js';
import DetailCurrency from './currency/screens/detail/index.js';

// User screens
import CreateUser from './user/screens/create/index.js';
import DetailUser from './user/screens/detail/index.js';

// Settings screens
import Template from './template/index.js';
import CreateRole from './users_roles/screens/create/index.js';
import UpdateRole from './users_roles/screens/detail/index.js';
import Faq from './help/screens/faq/index.js';
import NotesSettings from './notesSetting/index.js';
import PayrollSettings from './payrollsettings/index.js';

// Payroll screens
import CreatePayrollEmployee from './payrollemp/screens/create/index.js';
import EmployeeFinancial from './employee_Bank_Details/index.js';
import CreateEmployeeFinancial from './employee_Bank_Details/screens/create/index.js';
import DetailSalaryRole from './salaryRoles/screens/detail/index.js';
import CreateSalaryRoles from './salaryRoles/screens/create/index.js';
import CreateSalaryTemplate from './salaryTemplate/screens/create/index.js';
import UpdateEmployeePersonal from './payrollemp/screens/update_emp_personal/index.js';
import UpdateEmployeeBank from './payrollemp/screens/update_emp_bank/index.js';
import CreateSalaryStucture from './salaryStructure/screens/create/index.js';
import CreateDesignation from './designation/screens/create/index.js';
import DetailSalaryStructure from './salaryStructure/screens/detail/index.js';
import DetailSalaryTemplate from './salaryTemplate/screens/detail/index.js';
import DetailDesignation from './designation/screens/detail/index.js';
import DetailSalaryComponent from './salary_component/screens/detail/index.js';
import CreateSalaryComponent from './salary_component/screens/create/index.js';
import UpdateEmployeeEmployment from './payrollemp/screens/update_emp_employemet/index.js';
import UpdateSalaryComponent from './payrollemp/screens/update_salary_component/index.js';
import PayrollConfigurations from './payroll_configurations/index.js';
import CreatePayroll from './payroll_run/screens/createPayrollList/index.js';
import PayrollApproverScreen from './payroll_run/screens/approver/index.js';
import UpdatePayroll from './payroll_run/screens/updatePayroll/index.js';
import Migrate from './import/sections/migrate/index.js';
import MigrateHistory from './import/sections/migrate_history/index.js';

// Other screens
import ReportsFiling from './reports_filing/index.js';
import UnderConstruction from './under_const/index.js';

export {
  // Main screens (from reducers.js)
  Dashboard,
  DashboardTwo,
  Journal,
  BankAccount,
  Employee,
  Contact,
  Expense,
  GeneralSettings,
  CustomerInvoice,
  Receipt,
  SupplierInvoice,
  Product,
  Project,
  Payment,
  TransactionCategory,
  User,
  VatCode,
  Currency,
  CurrencyConvert,
  Help,
  Notification,
  Organization,
  UsersRoles,
  DataBackup,
  TransactionsReport,
  ChartAccount,
  ProductCategory,
  Profile,
  ImportTransaction,
  OpeningBalance,
  VatTransactions,
  Inventory,
  Quotation,
  RequestForQuotation,
  PurchaseOrder,
  GoodsReceivedNote,
  FinancialReport,
  SalaryRoles,
  SalaryStucture,
  SalaryTemplate,
  Designation,
  PayrollEmployee,
  CreditNotes,
  Import,
  PayrollRun,
  DebitNotes,
  // Sub-screens
  CreateJournal,
  DetailJournal,
  CreateOpeningBalance,
  DetailOpeningBalance,
  CreateBankAccount,
  DetailBankAccount,
  BankTransactions,
  CreateBankTransaction,
  DetailBankTransaction,
  ReconcileTransaction,
  ImportBankStatement,
  CreateCustomerInvoice,
  DetailCustomerInvoice,
  ViewCustomerInvoice,
  RecordCustomerPayment,
  CreateCreditNote,
  DetailCreditNote,
  ViewCreditNote,
  ApplyToInvoice,
  Refund,
  CreateReceipt,
  DetailReceipt,
  CreateSupplierInvoice,
  DetailSupplierInvoice,
  ViewInvoice,
  RecordSupplierPayment,
  CreateRequestForQuotation,
  DetailRequestForQuotation,
  ViewRequestForQuotation,
  CreatePurchaseOrder,
  DetailPurchaseOrder,
  ViewPurchaseOrder,
  CreateGoodsReceivedNote,
  DetailGoodsReceivedNote,
  ViewGoodsReceivedNote,
  CreateQuotation,
  DetailQuotation,
  ViewQuotation,
  CreateExpense,
  DetailExpense,
  ViewExpense,
  CreatePayment,
  DetailPayment,
  CreateDebitNote,
  DetailDebitNote,
  DebitNoteRefund,
  ApplyToSupplierInvoice,
  ViewDebitNote,
  ProfitAndLossReport,
  BalanceSheet,
  HorizontalBalanceSheet,
  TrailBalances,
  CustomerAccountStatement,
  Cashflow,
  VatReturnsReport,
  DetailedGeneralLedgerReport,
  SalesByCustomer,
  SalesByProduct,
  PurchaseByitem,
  PurchaseByVendor,
  ReceivableInvoiceDetailsReport,
  ReceivableInvoiceSummary,
  PayablesInvoiceDetailsReport,
  PayablesInvoiceSummary,
  PayrollSummaryReport,
  VatReports,
  VatPaymentRecord,
  RecordTaxClaim,
  RecordVatPayment,
  ARAgingReport,
  CorporateTax,
  CorporateTaxPaymentHistory,
  CorporateTaxPaymentRecord,
  ViewCorporateTax,
  DebitNoteDetailsReport,
  CreditNoteDetailsReport,
  ExpenseDetailsReport,
  ExpenseByCategory,
  InvoiceDetails,
  SOAReport,
  FtaAuditReport,
  GenerateAuditFile,
  ViewFtaAuditReport,
  ExciseTaxAuditReport,
  ViewFtaExciseAuditReport,
  SubReports,
  CreateChartAccount,
  DetailChartAccount,
  CreateContact,
  DetailContact,
  ViewContact,
  EditContact,
  ViewEmployee,
  CreateProduct,
  DetailProduct,
  InventoryEdit,
  InventoryHistory,
  CreateProject,
  DetailProject,
  CreateVatCode,
  DetailVatCode,
  CreateCurrencyConvert,
  DetailCurrencyConvert,
  CreateProductCategory,
  DetailProductCategory,
  CreateCurrency,
  DetailCurrency,
  CreateUser,
  DetailUser,
  Template,
  CreateRole,
  UpdateRole,
  Faq,
  NotesSettings,
  PayrollSettings,
  CreatePayrollEmployee,
  EmployeeFinancial,
  CreateEmployeeFinancial,
  DetailSalaryRole,
  CreateSalaryRoles,
  CreateSalaryTemplate,
  UpdateEmployeePersonal,
  UpdateEmployeeBank,
  CreateSalaryStucture,
  CreateDesignation,
  DetailSalaryStructure,
  DetailSalaryTemplate,
  DetailDesignation,
  DetailSalaryComponent,
  CreateSalaryComponent,
  UpdateEmployeeEmployment,
  UpdateSalaryComponent,
  PayrollConfigurations,
  CreatePayroll,
  PayrollApproverScreen,
  UpdatePayroll,
  Migrate,
  MigrateHistory,
  ReportsFiling,
  UnderConstruction,
};
