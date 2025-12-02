import LogIn from './log_in';
import LogInTwo from './log_in/screen-two';
import Register from './register';
import ResetPassword from './reset_password';
import NewPassword from './new_password';

import Dashboard from './dashboard';
import DashboardTwo from './dashboard/screen-two';


import Journal from './journal';
import CreateJournal from './journal/screens/create';
import DetailJournal from './journal/screens/detail';
import OpeningBalance from './opening_balance';
import CreateOpeningBalance from './opening_balance/screens/create'
import DetailOpeningBalance from './opening_balance/screens/detail'

import BankAccount from './bank_account';
import CreateBankAccount from './bank_account/screens/create';
import DetailBankAccount from './bank_account/screens/detail';
import BankTransactions from './bank_account/screens/transactions';
import CreateBankTransaction from './bank_account/screens/transactions/screens/create';
import DetailBankTransaction from './bank_account/screens/transactions/screens/detail';
import ReconcileTransaction from './bank_account/screens/transactions/screens/reconcile';
import ImportBankStatement from './import_bank_statement';
import ImportTransaction from './import_transaction';

import CustomerInvoice from './customer_invoice';
import CreateCustomerInvoice from './customer_invoice/screens/create';
import DetailCustomerInvoice from './customer_invoice/screens/detail';
import ViewCustomerInvoice from './customer_invoice/screens/view';
import RecordCustomerPayment from './customer_invoice/screens/record_payment';

import Receipt from './receipt';
import CreateReceipt from './receipt/screens/create';
import DetailReceipt from './receipt/screens/detail';

import SupplierInvoice from './supplier_invoice';
import CreateSupplierInvoice from './supplier_invoice/screens/create';
import DetailSupplierInvoice from './supplier_invoice/screens/detail';
import ViewInvoice from './supplier_invoice/screens/view';
import RecordSupplierPayment from './supplier_invoice/screens/record_payment';

import RequestForQuotation from './request_for_quotation';
import CreateRequestForQuotation from './request_for_quotation/screens/create';
import DetailRequestForQuotation from './request_for_quotation/screens/detail';
import ViewRequestForQuotation from './request_for_quotation/screens/view';

import PurchaseOrder from './purchase_order';
import CreatePurchaseOrder from './purchase_order/screens/create';
import DetailPurchaseOrder from './purchase_order/screens/detail';
import ViewPurchaseOrder from './purchase_order/screens/view';

import GoodsReceivedNote from './goods_received_note';
import CreateGoodsReceivedNote from './goods_received_note/screens/create';
import DetailGoodsReceivedNote from './goods_received_note/screens/detail';
import ViewGoodsReceivedNote from './goods_received_note/screens/view';

import CreateDebitNote from './debitNotes/screens/create'
import DebitNotes from './debitNotes'
import DetailDebitNote  from './debitNotes/screens/detail'
import DebitNoteRefund from './debitNotes/screens/refund'
import ApplyToSupplierInvoice from './debitNotes/screens/applyToInvoice'
import ViewDebitNote from './debitNotes/screens/view'

import Quotation from './quotation';
import CreateQuotation from './quotation/screens/create';
import DetailQuotation from './quotation/screens/detail';
import ViewQuotation from './quotation/screens/view';


import Expense from './expense';
import CreateExpense from './expense/screens/create';
import DetailExpense from './expense/screens/detail';
import ViewExpense from './expense/screens/view';

import Payment from './payment';
import CreatePayment from './payment/screens/create';
import DetailPayment from './payment/screens/detail';

import VatTransactions from './vat_transactions';
import ReportsFiling from './reports_filing';

import TransactionsReport from './transactions_report';
import FinancialReport from './financial_report';
import Inventory from './inventory'
import Template from './template'
import ProfitAndLossReport from './financial_report/sections/profit_and_loss';
import BalanceSheet from './financial_report/sections/balance_sheet';
import HorizontalBalanceSheet from './financial_report/sections/horizontal_balance_sheet';
import TrailBalances from './financial_report/sections/trail_Balances';
import CustomerAccountStatement from './financial_report/sections/customer_account_statement';
import Cashflow from './financial_report/sections/cashflow';
import VatReturnsReport from './financial_report/sections/vat_return';
import DetailedGeneralLedgerReport from './detailed_general_ledger_report';
import SalesByCustomer from './financial_report/sections/sales_by_customer';
import SalesByProduct from './financial_report/sections/sales_by_product';
import PurchaseByitem from './financial_report/sections/purchase_by_item';
import PurchaseByVendor from './financial_report/sections/purchase_by_vendor';
import ReceivableInvoiceDetailsReport from './financial_report/sections/receivable_invoice_details';
import ReceivableInvoiceSummary from './financial_report/sections/receivable_invoice_summary';
import PayablesInvoiceDetailsReport from './financial_report/sections/payables_invoice_details';
import PayablesInvoiceSummary from './financial_report/sections/payables_invoice_summary';
import CreditNoteDetailsReport from './financial_report/sections/credit_note_details';
import ExpenseDetailsReport from './financial_report/sections/expense_details';
import ExpenseByCategory from './financial_report/sections/expense_by_catogery';
import InvoiceDetails from './financial_report/sections/invoice_details';
import PayrollSummaryReport from './financial_report/sections/payroll_summary';
import ChartAccount from './chart_account';
import CreateChartAccount from './chart_account/screens/create';
import DetailChartAccount from './chart_account/screens/detail';
import Contact from './contact';
import CreateContact from './contact/screens/create';
import DetailContact from './contact/screens/detail';
import Employee from './employee';
import CreateEmployee from './employee/screens/create';
import DetailEmployee from './employee/screens/detail';
import Product from './product';
import CreateProduct from './product/screens/create';
import DetailProduct from './product/screens/detail';
import InventoryEdit from './product/screens/inventory_edit';
import InventoryHistory from './product/screens/inventory_history';
import CurrencyConvert from './currencyConvert';
import CreateCurrencyConvert from './currencyConvert/screens/create';
import DetailCurrencyConvert from './currencyConvert/screens/detail';
import Project from './project';
import CreateProject from './project/screens/create';
import DetailProject from './project/screens/detail';
import VatCode from './vat_code';
import CreateVatCode from './vat_code/screens/create';
import DetailVatCode from './vat_code/screens/detail';
import ProductCategory from './product_category';
import CreateProductCategory from './product_category/screens/create';
import DetailProductCategory from './product_category/screens/detail';
import Currency from './currency';
import CreateCurrency from './currency/screens/create';
import DetailCurrency from './currency/screens/detail';

import User from './user';
import CreateUser from './user/screens/create';
import DetailUser from './user/screens/detail';
import Organization from './organization';

import Profile from './profile';
import GeneralSettings from './general_settings';
import TransactionCategory from './transaction_category';
import CreateTransactionCategory from './transaction_category/screens/create';
import DetailTransactionCategory from './transaction_category/screens/detail';

import UsersRoles from './users_roles';
import CreateRole from './users_roles/screens/create';
import UpdateRole from './users_roles/screens/detail';
import UnderConstruction from './under_const';

import Notification from './notification';
import DataBackup from './data_backup';
import Help from './help';
import Faq from './help/screens/faq';
import PayrollEmployee from './payrollemp';
import CreatePayrollEmployee from './payrollemp/screens/create';
import Employment from './employment'
import CreateEmployment from './employment/screens/create'
import EmployeeFinancial from './employee_Bank_Details'
import CreateEmployeeFinancial from './employee_Bank_Details/screens/create'
import SalaryRoles from './salaryRoles'
import CreateSalaryRoles from './salaryRoles/screens/create'
import DetailSalaryRole from './salaryRoles/screens/detail'
import SalaryTemplate from './salaryTemplate'
import CreateSalaryTemplate from './salaryTemplate/screens/create'
import CreateSalaryStucture from './salaryStructure/screens/create'
import SalaryStucture from './salaryStructure'
import PayrollRun from './payroll_run'
import ViewEmployee from './payrollemp/screens/view'
// import SalarySlip from './employeePayroll/screens/salarySlip'
import UpdateEmployeePersonal from './payrollemp/screens/update_emp_personal'
import UpdateEmployeeBank from './payrollemp/screens/update_emp_bank'
import UpdateEmployeeEmployment from './payrollemp/screens/update_emp_employemet'
import UpdateSalaryComponent from './payrollemp/screens/update_salary_component'
import Designation from './designation'
import CreateDesignation from './designation/screens/create'
import CreateSalaryComponent from './salary_component/screens/create'
import DetailSalaryStructure from './salaryStructure/screens/detail'
import DetailSalaryComponent from './salary_component/screens/detail'
import DetailSalaryTemplate from './salaryTemplate/screens/detail'
import DetailDesignation from './designation/screens/detail'
import DetailCreditNote from './creditNotes/screens/detail'
import CreateCreditNote from './creditNotes/screens/create'
import ViewCreditNote from './creditNotes/screens/view'
import CreditNotes from './creditNotes'
import ApplyToInvoice from './creditNotes/screens/applyToInvoice'
import Refund from './creditNotes/screens/refund'
import PayrollConfigurations from './payroll_configurations'
import Import from './import'
import CreatePayroll from './payroll_run/screens/createPayrollList';
import Migrate from './import/sections/migrate';
import MigrateHistory from './import/sections/migrate_history';
import PayrollApproverScreen from './payroll_run/screens/approver';
import UpdatePayroll from './payroll_run/screens/updatePayroll';
import SOAReport from './financial_report/sections/soa_statementsOfAccounts'
import VatReports from './financial_report/sections/vat_reports'
import VatPaymentRecord from './financial_report/sections/vat_reports/screens/vatPaymentRecord'
import RecordTaxClaim from './financial_report/sections/vat_reports/screens/record_claim_tax'
import RecordVatPayment from './financial_report/sections/vat_reports/screens/record_tax_payment'
import CorporateTax from './financial_report/sections/corporate_tax'
import CorporateTaxPaymentHistory from './financial_report/sections/corporate_tax/screens/payment_history'
import CorporateTaxPaymentRecord from './financial_report/sections/corporate_tax/screens/payment_record'
import ViewCorporateTax from './financial_report/sections/corporate_tax/screens/view'
import FtaAuditReport from './financial_report/sections/fta_audit_report_MainPage'
import GenerateAuditFile from './financial_report/sections/fta_audit_report_MainPage/screens/generate_Fta_audit_report'
import ViewFtaAuditReport from './financial_report/sections/Fta_Audit_Report';
import ExciseTaxAuditReport from './financial_report/sections/excise_tax_audit_report_MainPage'
import ViewFtaExciseAuditReport from './financial_report/sections/Excise_Audit_Report'
import ARAgingReport from './financial_report/sections/ar_aging_report'
import SubReports from './financial_report/sections/vat_return/screens/subReports'
import NotesSettings from './notesSetting'
import DebitNoteDetailsReport from './financial_report/sections/debit_note_details'
import PayrollSettings from './payrollsettings';
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
	//SalarySlip,
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

};
