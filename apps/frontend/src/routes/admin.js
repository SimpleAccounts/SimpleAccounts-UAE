import {
  Dashboard,
  DashboardTwo,
  // Account Screens
  Journal,
  CreateJournal,
  DetailJournal,
  OpeningBalance,
  CreateOpeningBalance,
  DetailOpeningBalance,

  // Bank Screens
  BankAccount,
  CreateBankAccount,
  DetailBankAccount,
  BankTransactions,
  CreateBankTransaction,
  DetailBankTransaction,
  ReconcileTransaction,
  ImportBankStatement,
  ImportTransaction,

  // Customer Screens
  CustomerInvoice,
  CreateCustomerInvoice,
  DetailCustomerInvoice,
  ViewCustomerInvoice,
  RecordCustomerPayment,
  //CreditNotes
  CreditNotes,
  CreateCreditNote,
  DetailCreditNote,
  ViewCreditNote,
  // Receipt Screens
  Receipt,
  CreateReceipt,
  DetailReceipt,
  PayrollRun,

  // SupplierInvoice Screens
  SupplierInvoice,
  CreateSupplierInvoice,
  DetailSupplierInvoice,
  ViewInvoice,
  RecordSupplierPayment,

  //Request For Quotation
  CreateRequestForQuotation,
  ViewRequestForQuotation,
  DetailRequestForQuotation,
  RequestForQuotation,

  //Purchase Order
  PurchaseOrder,
  CreatePurchaseOrder,
  DetailPurchaseOrder,
  ViewPurchaseOrder,

  //Goods Received Notes
  GoodsReceivedNote,
  CreateGoodsReceivedNote,
  DetailGoodsReceivedNote,
  ViewGoodsReceivedNote,

  //Quotation
  Quotation,
  CreateQuotation,
  DetailQuotation,
  ViewQuotation,

  // Expense Screens
  Expense,
  CreateExpense,
  DetailExpense,
  Payment,
  CreatePayment,
  DetailPayment,

  //Debit Notes Screens
  DebitNotes,
  CreateDebitNote,
  DetailDebitNote,
  DebitNoteRefund,
  ApplyToSupplierInvoice,
  ViewDebitNote,

  // Vat Screens
  VatTransactions,
  ReportsFiling,

  // Report Screens
  TransactionsReport,
  CustomerAccountStatement,
  FinancialReport,
  ProfitAndLossReport,
  BalanceSheet,
  HorizontalBalanceSheet,
  TrailBalances,
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

  // Master Screens
  ChartAccount,
  CreateChartAccount,
  DetailChartAccount,
  Contact,
  CreateContact,
  DetailContact,
  ViewEmployee,
  Product,
  CreateProduct,
  DetailProduct,
  InventoryEdit,
  InventoryHistory,
  Project,
  CreateProject,
  DetailProject,
  VatCode,
  CreateVatCode,
  DetailVatCode,
  CurrencyConvert,
  CreateCurrencyConvert,
  DetailCurrencyConvert,
  // Product Screens
  ProductCategory,
  CreateProductCategory,
  DetailProductCategory,

  // Currency Screens
  Currency,
  CreateCurrency,
  DetailCurrency,

  // User Screens
  User,
  CreateUser,
  DetailUser,
  Organization,

  // Profile Screens
  Profile,
  GeneralSettings,
  // TransactionCategory,
  // CreateTransactionCategory,
  // DetailTransactionCategory,
  UsersRoles,
  CreateRole,
  UpdateRole,
  Notification,
  DataBackup,
  Help,
  Faq,
  ViewExpense,
  Inventory,
  Template,
  PayrollEmployee,
  CreatePayrollEmployee,
  EmployeeFinancial,
  DetailSalaryRole,
  SalaryRoles,
  CreateSalaryRoles,
  UpdateEmployeePersonal,
  UpdateEmployeeBank,
  SalaryTemplate,
  CreateSalaryTemplate,
  SalaryStucture,
  CreateSalaryStucture,
  UnderConstruction,
  CreateDesignation,
  Designation,
  DetailSalaryStructure,
  DetailSalaryTemplate,
  DetailDesignation,
  DetailSalaryComponent,
  CreateSalaryComponent,
  ApplyToInvoice,
  Refund,
  UpdateEmployeeEmployment,
  UpdateSalaryComponent,
  PayrollConfigurations,
  CreditNoteDetailsReport,
  ExpenseDetailsReport,
  ExpenseByCategory,
  InvoiceDetails,
  Import,
  CreatePayroll,
  PayrollApproverScreen,
  UpdatePayroll,
  Migrate,
  MigrateHistory,
  SOAReport,
  FtaAuditReport,
  GenerateAuditFile,
  ViewFtaAuditReport,
  ExciseTaxAuditReport,
  ViewFtaExciseAuditReport,
  SubReports,
  NotesSettings,
  PayrollSettings,
} from 'screens';
import Config from '../constants/config';
const adminRoutes = [
  Config.DASHBOARD && {
    path: 'dashboard',
    name: 'Dashboard',
    component: Dashboard.screen,
  },

  Config.DASHBOARD && {
    path: 'dashboard-two',
    name: 'DashboardTwo',
    component: DashboardTwo,
  },

  Config.ACCOUNTANT_JOURNALS && {
    path: 'accountant/journal/create',
    name: 'Add Journal',
    component: CreateJournal.screen,
  },
  Config.ACCOUNTANT_JOURNALS && {
    path: 'accountant/journal/view',
    name: 'View Journal',
    component: DetailJournal.screen,
  },
  Config.ACCOUNTANT_JOURNALS && {
    path: 'accountant/journal/detail',
    name: 'Update Journal',
    component: DetailJournal.screen,
  },
  Config.ACCOUNTANT_JOURNALS && {
    path: 'accountant/journal',
    name: 'Journals',
    component: Journal.screen,
  },

  Config.ACCOUNTANT_OB && {
    path: 'accountant/opening-balance/create',
    name: 'Add Opening Balance',
    component: CreateOpeningBalance.screen,
  },
  Config.ACCOUNTANT_OB && {
    path: 'accountant/opening-balance/detail',
    name: 'Update Opening Balance',
    component: DetailOpeningBalance.screen,
  },
  Config.ACCOUNTANT_OB && {
    path: 'accountant/opening-balance',
    name: 'Opening Balances',
    component: OpeningBalance.screen,
  },
  {
    path: 'Inventory',
    name: 'Inventory Summary',
    component: Inventory.screen,
  },
  Config.SETTING_THEME && {
    path: 'settings/template',
    name: 'Mail Themes',
    component: Template.screen,
  },
  Config.ACCOUNTANT_OB && {
    redirect: true,
    path: 'accountant',
    pathTo: '/admin/accountant/opening-balance',
    name: 'Accountant',
  },

  Config.BANKING_BA && {
    path: 'banking/bank-account/transaction/create',
    name: 'Add Transaction',
    component: CreateBankTransaction.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account/transaction/detail',
    name: 'Update Transaction',
    component: DetailBankTransaction.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account/transaction/reconcile',
    name: 'View Reconcile',
    component: ReconcileTransaction.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account/transaction',
    name: 'View Transaction',
    component: BankTransactions.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account/create',
    name: 'Add Bank Account',
    component: CreateBankAccount.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account/detail',
    name: 'Update Bank Account',
    component: DetailBankAccount.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/bank-account',
    name: 'View Bank Account',
    component: BankAccount.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/upload-statement/transaction',
    name: 'Add Bank Statement',
    component: ImportTransaction.screen,
  },
  Config.BANKING_BA && {
    path: 'banking/upload-statement',
    name: 'Add Bank Statement',
    component: ImportBankStatement.screen,
  },
  Config.BANKING_BA && {
    redirect: true,
    path: 'banking',
    pathTo: '/admin/banking/bank-account',
    name: 'Banking',
  },

  Config.INCOME_Q && {
    path: 'income/quotation/create',
    name: 'Add Quotation',
    component: CreateQuotation.screen,
  },
  Config.INCOME_Q && {
    path: 'income/quotation/view',
    name: 'View Quotation',
    component: ViewQuotation.screen,
  },
  Config.INCOME_Q && {
    path: 'income/quotation/detail',
    name: 'Update Quotation',
    component: DetailQuotation.screen,
  },
  Config.INCOME_Q && {
    path: 'income/quotation',
    name: 'Quotation',
    component: Quotation.screen,
  },

  Config.INCOME_CI && {
    path: 'income/customer-invoice/create',
    name: 'Add Customer Invoice',
    component: CreateCustomerInvoice.screen,
  },
  Config.INCOME_CI && {
    path: 'income/customer-invoice/view',
    name: 'View Customer Invoice',
    component: ViewCustomerInvoice.screen,
  },

  Config.INCOME_CI && {
    path: 'income/customer-invoice/detail',
    name: 'Update Customer Invoice',
    component: DetailCustomerInvoice.screen,
  },
  Config.INCOME_CI && {
    path: 'income/customer-invoice/record-payment',
    name: 'Record Customer Payment',
    component: RecordCustomerPayment.screen,
  },
  Config.INCOME_CI && {
    path: 'income/customer-invoice',
    name: 'Customer Invoices',
    component: CustomerInvoice.screen,
  },
  Config.INCOME_IR && {
    path: 'income/receipt/create',
    name: 'Create Reciept',
    component: CreateReceipt.screen,
  },
  Config.INCOME_IR && {
    path: 'income/receipt/detail',
    name: 'Detail',
    component: DetailReceipt.screen,
  },
  Config.INCOME_IR && {
    path: 'income/receipt',
    name: 'Customer Receipts',
    component: Receipt.screen,
  },
  //

  Config.INCOME_TCN && {
    path: 'income/credit-notes/create',
    name: 'Add Credit Notes',
    component: CreateCreditNote.screen,
  },
  Config.INCOME_TCN && {
    path: 'income/credit-notes/view',
    name: 'View Credit Notes',
    component: ViewCreditNote.screen,
  },
  Config.INCOME_TCN && {
    path: 'income/credit-notes/detail',
    name: 'Update Credit Notes',
    component: DetailCreditNote.screen,
  },
  Config.INCOME_TCN && {
    path: 'income/credit-notes/applyToInvoice',
    name: 'Apply To Invoice',
    component: ApplyToInvoice.screen,
  },

  Config.INCOME_TCN && {
    path: 'income/credit-notes/refund',
    name: 'Refund',
    component: Refund.screen,
  },
  Config.INCOME_TCN && {
    path: 'income/credit-notes',
    name: 'Credit Notes',
    component: CreditNotes.screen,
  },

  Config.EXPENSE_RFQ && {
    path: 'expense/request-for-quotation/create',
    name: 'Add Request For Quotation',
    component: CreateRequestForQuotation.screen,
  },
  Config.EXPENSE_RFQ && {
    path: 'expense/request-for-quotation/view',
    name: 'View Request For Quotation',
    component: ViewRequestForQuotation.screen,
  },
  Config.EXPENSE_RFQ && {
    path: 'expense/request-for-quotation/detail',
    name: 'Update Request For Quotation',
    component: DetailRequestForQuotation.screen,
  },
  Config.EXPENSE_RFQ && {
    path: 'expense/request-for-quotation',
    name: 'Quotation',
    component: RequestForQuotation.screen,
  },
  Config.EXPENSE_PO && {
    path: 'expense/purchase-order/create',
    name: 'Add Purchase Order',
    component: CreatePurchaseOrder.screen,
  },
  Config.EXPENSE_PO && {
    path: 'expense/purchase-order/view',
    name: 'View Purchase Order',
    component: ViewPurchaseOrder.screen,
  },
  Config.EXPENSE_PO && {
    path: 'expense/purchase-order/detail',
    name: 'Update Purchase Order',
    component: DetailPurchaseOrder.screen,
  },
  Config.EXPENSE_PO && {
    path: 'expense/purchase-order',
    name: 'Purchase Order',
    component: PurchaseOrder.screen,
  },
  Config.EXPENSE_GRN && {
    path: 'expense/goods-received-note/create',
    name: 'Add Goods Receive Notes',
    component: CreateGoodsReceivedNote.screen,
  },
  Config.EXPENSE_GRN && {
    path: 'expense/goods-received-note/view',
    name: 'View Goods Receive Notes',
    component: ViewGoodsReceivedNote.screen,
  },
  Config.EXPENSE_GRN && {
    path: 'expense/goods-received-note/detail',
    name: 'Update Goods Receive Notes',
    component: DetailGoodsReceivedNote.screen,
  },
  Config.EXPENSE_GRN && {
    path: 'expense/goods-received-note',
    name: 'Goods Receive Notes',
    component: GoodsReceivedNote.screen,
  },
  Config.EXPENSE_SI && {
    path: 'expense/supplier-invoice/create',
    name: 'Add Supplier Invoice',
    component: CreateSupplierInvoice.screen,
  },
  Config.EXPENSE_SI && {
    path: 'expense/supplier-invoice/view',
    name: 'View Supplier Invoice',
    component: ViewInvoice.screen,
  },
  Config.EXPENSE_SI && {
    path: 'expense/supplier-invoice/detail',
    name: 'Update Supplier Invoice',
    component: DetailSupplierInvoice.screen,
  },
  Config.EXPENSE_SI && {
    path: 'expense/supplier-invoice/record-payment',
    name: 'Record Supplier Payment',
    component: RecordSupplierPayment.screen,
  },
  Config.EXPENSE_SI && {
    path: 'expense/supplier-invoice',
    name: 'Supplier Invoices',
    component: SupplierInvoice.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes/create',
    name: 'Add Debit Notes',
    component: CreateDebitNote.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes/update',
    name: 'Update Debit Notes',
    component: DetailDebitNote.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes/refund',
    name: 'Refund Debit Notes',
    component: DebitNoteRefund.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes/applyToInvoice',
    name: 'Apply To Supplier Invoice',
    component: ApplyToSupplierInvoice.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes/view',
    name: 'View Debit Notes',
    component: ViewDebitNote.screen,
  },
  Config.EXPENSE_DN && {
    path: 'expense/debit-notes',
    name: 'Debit Notes',
    component: DebitNotes.screen,
  },
  Config.EXPENSE_EXPENSES && {
    path: 'expense/expense/create',
    name: 'Add Expense',
    component: CreateExpense.screen,
  },
  Config.EXPENSE_EXPENSES && {
    path: 'expense/expense/detail',
    name: 'Update Expense',
    component: DetailExpense.screen,
  },
  Config.EXPENSE_EXPENSES && {
    path: 'expense/expense/view',
    name: 'View Expense',
    component: ViewExpense.screen,
  },
  Config.EXPENSE_EXPENSES && {
    path: 'expense/expense',
    name: 'Expenses',
    component: Expense.screen,
  },

  Config.EXPENSE_PR && {
    path: 'expense/payment/create',
    name: 'Create Purchase Reciept',
    component: CreatePayment.screen,
  },
  Config.EXPENSE_PR && {
    path: 'expense/payment/detail',
    name: 'Update Supplier Receipt',
    component: DetailPayment.screen,
  },
  Config.EXPENSE_PR && {
    path: 'expense/purchase',
    name: 'Supplier Receipts',
    component: Payment.screen,
  },
  Config.EXPENSE_EXPENSES && {
    redirect: true,
    path: 'expense',
    pathTo: '/admin/expense/expense',
    name: 'Expense',
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/viewEmployee',
    name: 'Overview Employee',
    component: ViewEmployee.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/updateEmployeePersonal',
    name: 'Update Employee',
    component: UpdateEmployeePersonal.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/updateEmployeeBank',
    name: 'Update Employee',
    component: UpdateEmployeeBank.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/updateEmployeeEmployment',
    name: 'Update Employee',
    component: UpdateEmployeeEmployment.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/updateSalaryComponent',
    name: 'Update Employee',
    component: UpdateSalaryComponent.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee/create',
    name: 'Add Employee',
    component: CreatePayrollEmployee.screen,
  },
  Config.MASTER_EMPLOYEE && {
    path: 'master/employee',
    name: 'Employee',
    component: PayrollEmployee.screen,
  },

  Config.PAYROLL_PR && {
    path: 'payroll/payrollrun/updatePayroll',
    name: 'Update Payroll',
    component: UpdatePayroll.screen,
  },
  Config.PAYROLL_PR && {
    path: 'payroll/payrollrun/createPayrollList',
    name: 'Generate Payroll',
    component: CreatePayroll.screen,
  },
  Config.PAYROLL_PR && {
    path: 'payroll/payrollrun/ViewPayroll',
    name: 'View Payroll',
    component: UpdatePayroll.screen,
  },
  Config.PAYROLL_MODULE && {
    path: 'payroll/payrollApproverScreen',
    name: 'Approve Payroll',
    component: PayrollApproverScreen.screen,
  },
  Config.PAYROLL_PR && {
    path: 'payroll/ViewPayroll',
    name: 'View Payroll',
    component: PayrollApproverScreen.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/createSalaryRoles',
    name: 'Create Salary Role',
    component: CreateSalaryRoles.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/detailSalaryRoles',
    name: 'Update Salary Role',
    component: DetailSalaryRole.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/detailSalaryStructure',
    name: 'Update Salary Structure',
    component: DetailSalaryStructure.screen,
  },
  Config.PAYROLL_MODULE && {
    path: 'payroll/salaryTemplate/detail',
    name: 'Update Salary Template',
    component: DetailSalaryTemplate.screen,
  },

  Config.PAYROLL_MODULE && {
    path: 'payroll/salaryTemplate/create',
    name: 'Create Salary Template',
    component: CreateSalaryTemplate.screen,
  },
  Config.PAYROLL_MODULE && {
    path: 'payroll/salaryTemplate',
    name: 'View Salary Template',
    component: SalaryTemplate.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/createSalaryStructure',
    name: 'Create Salary Structure',
    component: CreateSalaryStucture.screen,
  },
  Config.PAYROLL_MODULE && {
    path: 'payroll/salaryStructure',
    name: 'View Salary Structure',
    component: SalaryStucture.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/createEmployeeDesignation',
    name: 'Create Employee Designation',
    component: CreateDesignation.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/detailEmployeeDesignation',
    name: 'Update Employee Designation',
    component: DetailDesignation.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/createSalaryComponent',
    name: 'Add Salary Component',
    component: CreateSalaryComponent.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config/detailSalaryComponent',
    name: 'Update Salary Component',
    component: DetailSalaryComponent.screen,
  },
  Config.PAYROLL_MODULE && {
    path: 'payroll/employeeDesignation',
    name: 'View Employee Designation',
    component: Designation.screen,
  },
  Config.PAYROLL_PC && {
    path: 'payroll/config',
    name: 'Payroll Config',
    component: PayrollConfigurations.screen,
  },
  Config.PAYROLL_PR && {
    path: 'payroll/payrollrun',
    name: 'Payroll Run',
    component: PayrollRun.screen,
  },
  Config.PAYROLL_PR && {
    redirect: true,
    path: 'payroll',
    pathTo: '/admin/payroll/payrollrun',
    name: 'Payroll',
  },

  {
    path: 'taxes/reports-filing',
    name: 'Reports Filing',
    component: ReportsFiling.screen,
  },
  // {
  // 	redirect: true,
  // 	path: 'taxes',
  // 	pathTo: '/admin/taxes/vat-transactions',
  // 	name: 'Taxes',
  // },
  Config.REPORTS_MODULE && {
    path: 'report/vat-transactions',
    name: 'Vat Transactions',
    component: VatTransactions.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/customer-account-statement',
    name: 'Statement of Accounts for Customer',
    component: CustomerAccountStatement.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/transactions',
    name: 'Transactions',
    component: TransactionsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/reports-page',
    name: 'Financial',
    component: FinancialReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/profitandloss',
    name: 'Profit And Loss',
    component: ProfitAndLossReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/balancesheet',
    name: 'Balance Sheet',
    component: BalanceSheet.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/horizontalbalancesheet',
    name: 'Horizontal Balance Sheet',
    component: HorizontalBalanceSheet.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/trailbalances',
    name: 'Trial Balance',
    component: TrailBalances.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/cash-flow',
    name: 'Cash Flow',
    component: Cashflow.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/ftaAuditReports',
    name: 'FTA Reports',
    component: FtaAuditReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/ftaAuditReports/generateftaAuditReport',
    name: 'Generate FTA Report',
    component: GenerateAuditFile.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/ftaAuditReports/view',
    name: 'View FTA Report',
    component: ViewFtaAuditReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/exciseTaxAuditReports',
    name: 'Excise Tax Audit Reports',
    component: ExciseTaxAuditReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/exciseTaxAuditReports/generateexcisetaxAuditReport',
    name: 'Generate FTA Report',
    component: GenerateAuditFile.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/exciseTaxAuditReports/view',
    name: 'View FTA Report',
    component: ViewFtaExciseAuditReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/vatreports/view',
    name: 'View Vat Report',
    component: VatReturnsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/vatreports',
    name: 'Vat Reports',
    component: VatReports.screen,
  },

  Config.REPORTS_MODULE && {
    path: 'report/vatreports/vatpaymentrecordhistory',
    name: 'Vat Payment History',
    component: VatPaymentRecord.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/vatreports/vatreturnsubreports',
    name: 'Vat Payment History',
    component: SubReports.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/vatreports/recordclaimtax',
    name: 'Record Tax Claim',
    component: RecordTaxClaim.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/vatreports/recordtaxpayment',
    name: 'Record Tax Payment',
    component: RecordVatPayment.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/corporate-tax',
    name: 'Corporate Tax',
    component: CorporateTax.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/corporate-tax/view',
    name: 'View Corporate Tax',
    component: ViewCorporateTax.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/corporate-tax/payment-history',
    name: 'Corporate Tax Payment History',
    component: CorporateTaxPaymentHistory.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/corporate-tax/payment',
    name: 'Corporate Tax Payment',
    component: CorporateTaxPaymentRecord.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/arAgingReport',
    name: 'Aged Receivable Summary',
    component: ARAgingReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/salesbycustomer',
    name: 'Sales By Customer',
    component: SalesByCustomer.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/salesbyproduct',
    name: 'Sales By Product',
    component: SalesByProduct.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/purchasebyvendor',
    name: 'Purchase By Vendor',
    component: PurchaseByVendor.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/purchasebyitem',
    name: 'Purchase By Product',
    component: PurchaseByitem.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/detailed-general-ledger',
    name: 'Detailed General Ledger',
    component: DetailedGeneralLedgerReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/receivable-invoice-details',
    name: 'Receivable Invoice Detail',
    component: ReceivableInvoiceDetailsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/credit-note-details',
    name: 'Credit Notes Details',
    component: CreditNoteDetailsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/debit-note-details',
    name: 'Debit Note Report',
    component: DebitNoteDetailsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/invoice-details',
    name: 'Invoice Details',
    component: InvoiceDetails.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/receivable-invoice-summary',
    name: 'Receivable Invoice Summary',
    component: ReceivableInvoiceSummary.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/payable-invoice-details',
    name: 'Payable Invoice Detail',
    component: PayablesInvoiceDetailsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/payable-invoice-summary',
    name: 'Payable Invoice Summary',
    component: PayablesInvoiceSummary.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/payroll-summary',
    name: 'Payroll Summary Report',
    component: PayrollSummaryReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/statementOfAccount',
    name: 'Statement Of Account',
    component: SOAReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/expense-details',
    name: 'Expense Details',
    component: ExpenseDetailsReport.screen,
  },
  Config.REPORTS_MODULE && {
    path: 'report/expense-by-category',
    name: 'Expense By Category Details',
    component: ExpenseByCategory.screen,
  },
  Config.REPORTS_MODULE && {
    redirect: true,
    path: 'report',
    pathTo: '/admin/report/reports-page',
    name: 'Report',
  },

  Config.MASTER_COA && {
    path: 'master/chart-account/create',
    name: 'Add Chart Of Accounts',
    component: CreateChartAccount.screen,
  },
  Config.MASTER_COA && {
    path: 'master/chart-account/detail',
    name: 'Update Chart Of Accounts',
    component: DetailChartAccount.screen,
  },
  Config.MASTER_COA && {
    path: 'master/chart-account',
    name: 'Chart Of Accounts',
    component: ChartAccount.screen,
  },
  Config.MASTER_CONTACT && {
    path: 'master/contact/create',
    name: 'Add Contact',
    component: CreateContact.screen,
  },
  Config.MASTER_CONTACT && {
    path: 'master/contact/detail',
    name: 'Update Contact',
    component: DetailContact.screen,
  },
  Config.MASTER_CONTACT && {
    path: 'master/contact',
    name: 'Contact',
    component: Contact.screen,
  },
  // {
  // 	path: 'master/employee/create',
  // 	name: 'Create',
  // 	component: CreateEmployee.screen,
  // },
  // {
  // 	path: 'master/employee/detail',
  // 	name: 'Detail',
  // 	component: DetailEmployee.screen,
  // },
  // {
  // 	path: 'master/employee',
  // 	name: 'Employee',
  // 	component: Employee.screen,
  // },
  Config.MASTER_PRODUCTS && {
    path: 'master/product/create',
    name: 'Add Product',
    component: CreateProduct.screen,
  },
  Config.MASTER_PRODUCTS && {
    path: 'master/product/detail',
    name: 'Update Product',
    component: DetailProduct.screen,
  },
  Config.MASTER_PRODUCTS && {
    path: 'master/product/detail/inventoryedit',
    name: 'Update Inventory',
    component: InventoryEdit.screen,
  },
  Config.MASTER_PRODUCTS && {
    path: 'master/product/detail/inventoryhistory',
    name: 'Inventory History',
    component: InventoryHistory.screen,
  },
  Config.MASTER_PRODUCTS && {
    path: 'master/product',
    name: 'Product',
    component: Product.screen,
  },
  {
    path: 'master/project/create',
    name: 'Create',
    component: CreateProject.screen,
  },
  {
    path: 'master/project/detail',
    name: 'Detail',
    component: DetailProject.screen,
  },
  {
    path: 'master/project',
    name: 'Project',
    component: Project.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currencyConvert/create',
    name: 'Add Currency Conversion',
    component: CreateCurrencyConvert.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currencyConvert/detail',
    name: 'Update Currency Conversion',
    component: DetailCurrencyConvert.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currencyConvert',
    name: 'Currency Conversion',
    component: CurrencyConvert.screen,
  },
  Config.MASTER_VAT && {
    path: 'master/vat-category/create',
    name: 'Add Vat Category',
    component: CreateVatCode.screen,
  },
  Config.MASTER_VAT && {
    path: 'master/vat-category/detail',
    name: 'Update Vat Category',
    component: DetailVatCode.screen,
  },
  Config.MASTER_VAT && {
    path: 'master/vat-category',
    name: 'Vat Category',
    component: VatCode.screen,
  },
  Config.MASTER_PC && {
    path: 'master/product-category/create',
    name: 'Add Product Category',
    component: CreateProductCategory.screen,
  },
  Config.MASTER_PC && {
    path: 'master/product-category/detail',
    name: 'Update Product Category',
    component: DetailProductCategory.screen,
  },
  Config.MASTER_PC && {
    path: 'master/product-category',
    name: 'Product Category',
    component: ProductCategory.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currency/create',
    name: 'Create',
    component: CreateCurrency.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currency/detail',
    name: 'Detail',
    component: DetailCurrency.screen,
  },
  Config.MASTER_CR && {
    path: 'master/currency',
    name: 'Currencies',
    component: Currency.screen,
  },
  Config.MASTER_COA && {
    redirect: true,
    path: 'master',
    pathTo: '/admin/master/chart-account',
    name: 'Master',
  },

  {
    path: 'settings/user/create',
    name: 'Add User',
    component: CreateUser.screen,
  },
  {
    path: 'settings/user/detail',
    name: 'Update User',
    component: DetailUser.screen,
  },
  {
    path: 'settings/user',
    name: 'View User',
    component: User.screen,
  },
  {
    path: 'settings/notesSettings',
    name: 'Save Note Settings',
    component: NotesSettings.screen,
  },
  {
    path: 'settings/payrollsettings',
    name: 'Save Payroll Settings',
    component: PayrollSettings.screen,
  },

  Config.SETTING_IMPORT && {
    path: 'settings/import',
    name: 'Migration',
    component: Import.screen,
  },
  {
    path: 'settings/migrate',
    name: 'Migration',
    component: Migrate.screen,
  },
  {
    path: 'settings/migrateHistory',
    name: 'Migration',
    component: MigrateHistory.screen,
  },
  {
    path: 'settings/organization',
    name: 'Organization',
    component: Organization.screen,
  },

  {
    path: 'settings/general',
    name: 'Save General Setting',
    component: GeneralSettings.screen,
  },
  // {
  //   path: 'settings/transaction-category/create',
  //   name: 'Create',
  //   component: CreateTransactionCategory.screen
  // },
  // {
  //   path: 'settings/transaction-category/detail',
  //   name: 'Detail',
  //   component: DetailTransactionCategory.screen
  // },
  // {
  //   path: 'settings/transaction-category',
  //   name: 'Transaction Category',
  //   component: TransactionCategory.screen
  // },
  Config.ADD_ROLES && {
    path: 'settings/user-role/create',
    name: 'Add Role',
    component: CreateRole.screen,
  },
  Config.ADD_ROLES && {
    path: 'settings/user-role/update',
    name: 'Update Role',
    component: UpdateRole.screen,
  },
  {
    path: 'settings/user-role',
    name: 'View Role',
    component: UsersRoles.screen,
  },
  {
    path: 'settings/notification',
    name: 'Notifications',
    component: Notification.screen,
  },
  {
    path: 'settings/data-backup',
    name: 'Data Backup',
    component: DataBackup.screen,
  },
  {
    path: 'settings/help/Faq',
    name: 'Faq',
    component: Faq.screen,
  },
  {
    path: 'settings/help',
    name: 'Help',
    component: Help.screen,
  },
  {
    redirect: true,
    path: 'settings',
    pathTo: '/admin/settings/user',
    name: 'Settings',
  },

  {
    path: 'profile',
    name: 'Update Profile',
    component: Profile.screen,
  },

  {
    redirect: true,
    path: '',
    pathTo: Config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice',
    name: 'Index',
  },
  {
    redirect: true,
    path: '*',
    pathTo: Config.DASHBOARD ? '/admin/dashboard' : '/admin/income/customer-invoice',
    name: 'Catch All',
  },
].filter(i => i.path !== undefined && i.path !== false);

export default adminRoutes;
