import lazyLoad from '../utils/lazyLoad';

// Authentication Screens
const LogIn = lazyLoad(() => import('./log_in'));
const LogInTwo = lazyLoad(() => import('./log_in/screen-two.jsx'));
const Register = lazyLoad(() => import('./register'));
const ResetPassword = lazyLoad(() => import('./reset_password'));
const NewPassword = lazyLoad(() => import('./new_password'));

// Dashboard Screens
const Dashboard = lazyLoad(() => import('./dashboard'));
const DashboardTwo = lazyLoad(() => import('./dashboard/screen-two'));

// Journal Screens
const Journal = lazyLoad(() => import('./journal'));
const CreateJournal = lazyLoad(() => import('./journal/screens/create'));
const DetailJournal = lazyLoad(() => import('./journal/screens/detail'));

// Opening Balance Screens
const OpeningBalance = lazyLoad(() => import('./opening_balance'));
const CreateOpeningBalance = lazyLoad(() => import('./opening_balance/screens/create'));
const DetailOpeningBalance = lazyLoad(() => import('./opening_balance/screens/detail'));

// Bank Account Screens
const BankAccount = lazyLoad(() => import('./bank_account'));
const CreateBankAccount = lazyLoad(() => import('./bank_account/screens/create'));
const DetailBankAccount = lazyLoad(() => import('./bank_account/screens/detail'));
const BankTransactions = lazyLoad(() => import('./bank_account/screens/transactions'));
const CreateBankTransaction = lazyLoad(
  () => import('./bank_account/screens/transactions/screens/create')
);
const DetailBankTransaction = lazyLoad(
  () => import('./bank_account/screens/transactions/screens/detail')
);
const ReconcileTransaction = lazyLoad(
  () => import('./bank_account/screens/transactions/screens/reconcile')
);
const ImportBankStatement = lazyLoad(() => import('./import_bank_statement'));
const ImportTransaction = lazyLoad(() => import('./import_transaction'));

// Customer Invoice Screens
const CustomerInvoice = lazyLoad(() => import('./customer_invoice'));
const CreateCustomerInvoice = lazyLoad(() => import('./customer_invoice/screens/create'));
const DetailCustomerInvoice = lazyLoad(() => import('./customer_invoice/screens/detail'));
const ViewCustomerInvoice = lazyLoad(() => import('./customer_invoice/screens/view'));
const RecordCustomerPayment = lazyLoad(() => import('./customer_invoice/screens/record_payment'));

// Receipt Screens
const Receipt = lazyLoad(() => import('./receipt'));
const CreateReceipt = lazyLoad(() => import('./receipt/screens/create'));
const DetailReceipt = lazyLoad(() => import('./receipt/screens/detail'));

// Supplier Invoice Screens
const SupplierInvoice = lazyLoad(() => import('./supplier_invoice'));
const CreateSupplierInvoice = lazyLoad(() => import('./supplier_invoice/screens/create'));
const DetailSupplierInvoice = lazyLoad(() => import('./supplier_invoice/screens/detail'));
const ViewInvoice = lazyLoad(() => import('./supplier_invoice/screens/view'));
const RecordSupplierPayment = lazyLoad(() => import('./supplier_invoice/screens/record_payment'));

// Request for Quotation Screens
const RequestForQuotation = lazyLoad(() => import('./request_for_quotation'));
const CreateRequestForQuotation = lazyLoad(() => import('./request_for_quotation/screens/create'));
const DetailRequestForQuotation = lazyLoad(() => import('./request_for_quotation/screens/detail'));
const ViewRequestForQuotation = lazyLoad(() => import('./request_for_quotation/screens/view'));

// Purchase Order Screens
const PurchaseOrder = lazyLoad(() => import('./purchase_order'));
const CreatePurchaseOrder = lazyLoad(() => import('./purchase_order/screens/create'));
const DetailPurchaseOrder = lazyLoad(() => import('./purchase_order/screens/detail'));
const ViewPurchaseOrder = lazyLoad(() => import('./purchase_order/screens/view'));

// Goods Received Note Screens
const GoodsReceivedNote = lazyLoad(() => import('./goods_received_note'));
const CreateGoodsReceivedNote = lazyLoad(() => import('./goods_received_note/screens/create'));
const DetailGoodsReceivedNote = lazyLoad(() => import('./goods_received_note/screens/detail'));
const ViewGoodsReceivedNote = lazyLoad(() => import('./goods_received_note/screens/view'));

// Debit Notes Screens
const CreateDebitNote = lazyLoad(() => import('./debitNotes/screens/create'));
const DebitNotes = lazyLoad(() => import('./debitNotes'));
const DetailDebitNote = lazyLoad(() => import('./debitNotes/screens/detail'));
const DebitNoteRefund = lazyLoad(() => import('./debitNotes/screens/refund'));
const ApplyToSupplierInvoice = lazyLoad(() => import('./debitNotes/screens/applyToInvoice'));
const ViewDebitNote = lazyLoad(() => import('./debitNotes/screens/view'));

// Quotation Screens
const Quotation = lazyLoad(() => import('./quotation'));
const CreateQuotation = lazyLoad(() => import('./quotation/screens/create'));
const DetailQuotation = lazyLoad(() => import('./quotation/screens/detail'));
const ViewQuotation = lazyLoad(() => import('./quotation/screens/view'));

// Expense Screens
const Expense = lazyLoad(() => import('./expense'));
const CreateExpense = lazyLoad(() => import('./expense/screens/create'));
const DetailExpense = lazyLoad(() => import('./expense/screens/detail'));
const ViewExpense = lazyLoad(() => import('./expense/screens/view'));

// Payment Screens
const Payment = lazyLoad(() => import('./payment'));
const CreatePayment = lazyLoad(() => import('./payment/screens/create'));
const DetailPayment = lazyLoad(() => import('./payment/screens/detail'));

// VAT Screens
const VatTransactions = lazyLoad(() => import('./vat_transactions'));
const ReportsFiling = lazyLoad(() => import('./reports_filing'));

// Reports Screens
const TransactionsReport = lazyLoad(() => import('./transactions_report'));
const FinancialReport = lazyLoad(() => import('./financial_report'));
const Inventory = lazyLoad(() => import('./inventory'));
const Template = lazyLoad(() => import('./template'));
const ProfitAndLossReport = lazyLoad(() => import('./financial_report/sections/profit_and_loss'));
const BalanceSheet = lazyLoad(() => import('./financial_report/sections/balance_sheet'));
const HorizontalBalanceSheet = lazyLoad(
  () => import('./financial_report/sections/horizontal_balance_sheet')
);
const TrailBalances = lazyLoad(() => import('./financial_report/sections/trail_Balances'));
const CustomerAccountStatement = lazyLoad(
  () => import('./financial_report/sections/customer_account_statement')
);
const Cashflow = lazyLoad(() => import('./financial_report/sections/cashflow'));
const VatReturnsReport = lazyLoad(() => import('./financial_report/sections/vat_return'));
const DetailedGeneralLedgerReport = lazyLoad(() => import('./detailed_general_ledger_report'));
const SalesByCustomer = lazyLoad(() => import('./financial_report/sections/sales_by_customer'));
const SalesByProduct = lazyLoad(() => import('./financial_report/sections/sales_by_product'));
const PurchaseByitem = lazyLoad(() => import('./financial_report/sections/purchase_by_item'));
const PurchaseByVendor = lazyLoad(() => import('./financial_report/sections/purchase_by_vendor'));
const ReceivableInvoiceDetailsReport = lazyLoad(
  () => import('./financial_report/sections/receivable_invoice_details')
);
const ReceivableInvoiceSummary = lazyLoad(
  () => import('./financial_report/sections/receivable_invoice_summary')
);
const PayablesInvoiceDetailsReport = lazyLoad(
  () => import('./financial_report/sections/payables_invoice_details')
);
const PayablesInvoiceSummary = lazyLoad(
  () => import('./financial_report/sections/payables_invoice_summary')
);
const CreditNoteDetailsReport = lazyLoad(
  () => import('./financial_report/sections/credit_note_details')
);
const ExpenseDetailsReport = lazyLoad(() => import('./financial_report/sections/expense_details'));
const ExpenseByCategory = lazyLoad(() => import('./financial_report/sections/expense_by_catogery'));
const InvoiceDetails = lazyLoad(() => import('./financial_report/sections/invoice_details'));
const PayrollSummaryReport = lazyLoad(() => import('./financial_report/sections/payroll_summary'));
const SOAReport = lazyLoad(() => import('./financial_report/sections/soa_statementsOfAccounts'));
const VatReports = lazyLoad(() => import('./financial_report/sections/vat_reports'));
const VatPaymentRecord = lazyLoad(
  () => import('./financial_report/sections/vat_reports/screens/vatPaymentRecord')
);
const RecordTaxClaim = lazyLoad(
  () => import('./financial_report/sections/vat_reports/screens/record_claim_tax')
);
const RecordVatPayment = lazyLoad(
  () => import('./financial_report/sections/vat_reports/screens/record_tax_payment')
);
const CorporateTax = lazyLoad(() => import('./financial_report/sections/corporate_tax'));
const CorporateTaxPaymentHistory = lazyLoad(
  () => import('./financial_report/sections/corporate_tax/screens/payment_history')
);
const CorporateTaxPaymentRecord = lazyLoad(
  () => import('./financial_report/sections/corporate_tax/screens/payment_record')
);
const ViewCorporateTax = lazyLoad(
  () => import('./financial_report/sections/corporate_tax/screens/view')
);
const FtaAuditReport = lazyLoad(
  () => import('./financial_report/sections/fta_audit_report_MainPage')
);
const GenerateAuditFile = lazyLoad(
  () =>
    import('./financial_report/sections/fta_audit_report_MainPage/screens/generate_Fta_audit_report')
);
const ViewFtaAuditReport = lazyLoad(() => import('./financial_report/sections/Fta_Audit_Report'));
const ExciseTaxAuditReport = lazyLoad(
  () => import('./financial_report/sections/excise_tax_audit_report_MainPage')
);
const ViewFtaExciseAuditReport = lazyLoad(
  () => import('./financial_report/sections/Excise_Audit_Report')
);
const ARAgingReport = lazyLoad(() => import('./financial_report/sections/ar_aging_report'));
const SubReports = lazyLoad(
  () => import('./financial_report/sections/vat_return/screens/subReports')
);
const DebitNoteDetailsReport = lazyLoad(
  () => import('./financial_report/sections/debit_note_details')
);

// Master Data Screens
const ChartAccount = lazyLoad(() => import('./chart_account'));
const CreateChartAccount = lazyLoad(() => import('./chart_account/screens/create'));
const DetailChartAccount = lazyLoad(() => import('./chart_account/screens/detail'));
const Contact = lazyLoad(() => import('./contact'));
const CreateContact = lazyLoad(() => import('./contact/screens/create'));
const DetailContact = lazyLoad(() => import('./contact/screens/detail'));
const Employee = lazyLoad(() => import('./employee'));
const CreateEmployee = lazyLoad(() => import('./employee/screens/create'));
const DetailEmployee = lazyLoad(() => import('./employee/screens/detail'));
const Product = lazyLoad(() => import('./product'));
const CreateProduct = lazyLoad(() => import('./product/screens/create'));
const DetailProduct = lazyLoad(() => import('./product/screens/detail'));
const InventoryEdit = lazyLoad(() => import('./product/screens/inventory_edit'));
const InventoryHistory = lazyLoad(() => import('./product/screens/inventory_history'));
const CurrencyConvert = lazyLoad(() => import('./currencyConvert'));
const CreateCurrencyConvert = lazyLoad(() => import('./currencyConvert/screens/create'));
const DetailCurrencyConvert = lazyLoad(() => import('./currencyConvert/screens/detail'));
const Project = lazyLoad(() => import('./project'));
const CreateProject = lazyLoad(() => import('./project/screens/create'));
const DetailProject = lazyLoad(() => import('./project/screens/detail'));
const VatCode = lazyLoad(() => import('./vat_code'));
const CreateVatCode = lazyLoad(() => import('./vat_code/screens/create'));
const DetailVatCode = lazyLoad(() => import('./vat_code/screens/detail'));
const ProductCategory = lazyLoad(() => import('./product_category'));
const CreateProductCategory = lazyLoad(() => import('./product_category/screens/create'));
const DetailProductCategory = lazyLoad(() => import('./product_category/screens/detail'));
const Currency = lazyLoad(() => import('./currency'));
const CreateCurrency = lazyLoad(() => import('./currency/screens/create'));
const DetailCurrency = lazyLoad(() => import('./currency/screens/detail'));

// User & Settings Screens
const User = lazyLoad(() => import('./user'));
const CreateUser = lazyLoad(() => import('./user/screens/create'));
const DetailUser = lazyLoad(() => import('./user/screens/detail'));
const Organization = lazyLoad(() => import('./organization'));
const Profile = lazyLoad(() => import('./profile'));
const GeneralSettings = lazyLoad(() => import('./general_settings'));
const TransactionCategory = lazyLoad(() => import('./transaction_category'));
const CreateTransactionCategory = lazyLoad(() => import('./transaction_category/screens/create'));
const DetailTransactionCategory = lazyLoad(() => import('./transaction_category/screens/detail'));
const UsersRoles = lazyLoad(() => import('./users_roles'));
const CreateRole = lazyLoad(() => import('./users_roles/screens/create'));
const UpdateRole = lazyLoad(() => import('./users_roles/screens/detail'));
const ComponentLibrary = lazyLoad(() => import('./theme_reference'));
const UnderConstruction = lazyLoad(() => import('./under_const'));
const Notification = lazyLoad(() => import('./notification'));
const DataBackup = lazyLoad(() => import('./data_backup'));
const Help = lazyLoad(() => import('./help'));
const Faq = lazyLoad(() => import('./help/screens/faq'));
const NotesSettings = lazyLoad(() => import('./notesSetting'));
const PayrollSettings = lazyLoad(() => import('./payrollsettings'));

// Payroll Screens
const PayrollEmployee = lazyLoad(() => import('./payrollemp'));
const CreatePayrollEmployee = lazyLoad(() => import('./payrollemp/screens/create'));
const Employment = lazyLoad(() => import('./employment'));
const CreateEmployment = lazyLoad(() => import('./employment/screens/create'));
const EmployeeFinancial = lazyLoad(() => import('./employee_Bank_Details'));
const CreateEmployeeFinancial = lazyLoad(() => import('./employee_Bank_Details/screens/create'));
const SalaryRoles = lazyLoad(() => import('./salaryRoles'));
const CreateSalaryRoles = lazyLoad(() => import('./salaryRoles/screens/create'));
const DetailSalaryRole = lazyLoad(() => import('./salaryRoles/screens/detail'));
const SalaryTemplate = lazyLoad(() => import('./salaryTemplate'));
const CreateSalaryTemplate = lazyLoad(() => import('./salaryTemplate/screens/create'));
const CreateSalaryStucture = lazyLoad(() => import('./salaryStructure/screens/create'));
const SalaryStucture = lazyLoad(() => import('./salaryStructure'));
const PayrollRun = lazyLoad(() => import('./payroll_run'));
const ViewEmployee = lazyLoad(() => import('./payrollemp/screens/view'));
const UpdateEmployeePersonal = lazyLoad(() => import('./payrollemp/screens/update_emp_personal'));
const UpdateEmployeeBank = lazyLoad(() => import('./payrollemp/screens/update_emp_bank'));
const UpdateEmployeeEmployment = lazyLoad(
  () => import('./payrollemp/screens/update_emp_employemet')
);
const UpdateSalaryComponent = lazyLoad(
  () => import('./payrollemp/screens/update_salary_component')
);
const Designation = lazyLoad(() => import('./designation'));
const CreateDesignation = lazyLoad(() => import('./designation/screens/create'));
const CreateSalaryComponent = lazyLoad(() => import('./salary_component/screens/create'));
const DetailSalaryStructure = lazyLoad(() => import('./salaryStructure/screens/detail'));
const DetailSalaryComponent = lazyLoad(() => import('./salary_component/screens/detail'));
const DetailSalaryTemplate = lazyLoad(() => import('./salaryTemplate/screens/detail'));
const DetailDesignation = lazyLoad(() => import('./designation/screens/detail'));
const PayrollConfigurations = lazyLoad(() => import('./payroll_configurations'));
const CreatePayroll = lazyLoad(() => import('./payroll_run/screens/createPayrollList'));
const PayrollApproverScreen = lazyLoad(() => import('./payroll_run/screens/approver'));
const UpdatePayroll = lazyLoad(() => import('./payroll_run/screens/updatePayroll'));

// Credit Notes Screens
const DetailCreditNote = lazyLoad(() => import('./creditNotes/screens/detail'));
const CreateCreditNote = lazyLoad(() => import('./creditNotes/screens/create'));
const ViewCreditNote = lazyLoad(() => import('./creditNotes/screens/view'));
const CreditNotes = lazyLoad(() => import('./creditNotes'));
const ApplyToInvoice = lazyLoad(() => import('./creditNotes/screens/applyToInvoice'));
const Refund = lazyLoad(() => import('./creditNotes/screens/refund'));

// Import/Migration Screens
const Import = lazyLoad(() => import('./import'));
const Migrate = lazyLoad(() => import('./import/sections/migrate'));
const MigrateHistory = lazyLoad(() => import('./import/sections/migrate_history'));

export {
  LogIn,
  LogInTwo,
  Register,
  ResetPassword,
  NewPassword,
  Dashboard,
  DashboardTwo,
  ViewExpense,
  Journal,
  CreateJournal,
  DetailJournal,
  OpeningBalance,
  CreateOpeningBalance,
  DetailOpeningBalance,
  BankAccount,
  CreateBankAccount,
  DetailBankAccount,
  BankTransactions,
  CreateBankTransaction,
  DetailBankTransaction,
  ReconcileTransaction,
  ImportBankStatement,
  ImportTransaction,
  CustomerInvoice,
  CreateCustomerInvoice,
  DetailCustomerInvoice,
  ViewCustomerInvoice,
  RecordCustomerPayment,
  Receipt,
  CreateReceipt,
  DetailReceipt,
  SupplierInvoice,
  CreateSupplierInvoice,
  DetailSupplierInvoice,
  ViewInvoice,
  RecordSupplierPayment,
  RequestForQuotation,
  CreateRequestForQuotation,
  DetailRequestForQuotation,
  ViewRequestForQuotation,
  PurchaseOrder,
  CreatePurchaseOrder,
  DetailPurchaseOrder,
  ViewPurchaseOrder,
  GoodsReceivedNote,
  CreateGoodsReceivedNote,
  DetailGoodsReceivedNote,
  ViewGoodsReceivedNote,
  DetailQuotation,
  Quotation,
  CreateQuotation,
  ViewQuotation,
  Expense,
  CreateExpense,
  DetailExpense,
  Payment,
  CreatePayment,
  DetailPayment,
  VatTransactions,
  ReportsFiling,
  TransactionsReport,
  FinancialReport,
  ProfitAndLossReport,
  BalanceSheet,
  HorizontalBalanceSheet,
  TrailBalances,
  CustomerAccountStatement,
  Cashflow,
  VatReturnsReport,
  SalesByCustomer,
  SalesByProduct,
  PurchaseByitem,
  PurchaseByVendor,
  Inventory,
  Template,
  DetailedGeneralLedgerReport,
  ChartAccount,
  CreateChartAccount,
  DetailChartAccount,
  CurrencyConvert,
  CreateCurrencyConvert,
  DetailCurrencyConvert,
  Contact,
  CreateContact,
  DetailContact,
  Employee,
  CreateEmployee,
  DetailEmployee,
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
  ProductCategory,
  CreateProductCategory,
  DetailProductCategory,
  Currency,
  CreateCurrency,
  DetailCurrency,
  User,
  CreateUser,
  DetailUser,
  Organization,
  Profile,
  GeneralSettings,
  TransactionCategory,
  CreateTransactionCategory,
  DetailTransactionCategory,
  UsersRoles,
  CreateRole,
  UpdateRole,
  Notification,
  DataBackup,
  Help,
  Faq,
  Employment,
  CreateEmployment,
  EmployeeFinancial,
  CreateEmployeeFinancial,
  CreateSalaryRoles,
  SalaryRoles,
  SalaryTemplate,
  CreateSalaryTemplate,
  SalaryStucture,
  CreateSalaryStucture,
  PayrollRun,
  UnderConstruction,
  ReceivableInvoiceDetailsReport,
  CreditNoteDetailsReport,
  ReceivableInvoiceSummary,
  Designation,
  CreateDesignation,
  PayablesInvoiceDetailsReport,
  PayablesInvoiceSummary,
  DetailSalaryRole,
  DetailSalaryStructure,
  DetailSalaryTemplate,
  DetailDesignation,
  DetailSalaryComponent,
  CreateSalaryComponent,
  CreditNotes,
  CreateCreditNote,
  DetailCreditNote,
  ViewCreditNote,
  ApplyToInvoice,
  CreatePayrollEmployee,
  PayrollEmployee,
  Refund,
  ViewEmployee,
  UpdateEmployeePersonal,
  UpdateEmployeeBank,
  UpdateEmployeeEmployment,
  UpdateSalaryComponent,
  PayrollConfigurations,
  ExpenseDetailsReport,
  ExpenseByCategory,
  InvoiceDetails,
  Import,
  CreatePayroll,
  PayrollApproverScreen,
  UpdatePayroll,
  MigrateHistory,
  Migrate,
  PayrollSummaryReport,
  SOAReport,
  VatReports,
  VatPaymentRecord,
  RecordTaxClaim,
  RecordVatPayment,
  CorporateTax,
  CorporateTaxPaymentHistory,
  CorporateTaxPaymentRecord,
  ViewCorporateTax,
  FtaAuditReport,
  GenerateAuditFile,
  ViewFtaAuditReport,
  ExciseTaxAuditReport,
  ViewFtaExciseAuditReport,
  ARAgingReport,
  SubReports,
  NotesSettings,
  DebitNotes,
  CreateDebitNote,
  DetailDebitNote,
  DebitNoteRefund,
  ApplyToSupplierInvoice,
  ViewDebitNote,
  DebitNoteDetailsReport,
  PayrollSettings,
  ComponentLibrary,
};
