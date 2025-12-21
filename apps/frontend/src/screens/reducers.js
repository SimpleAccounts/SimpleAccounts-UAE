// Export screen module objects (not lazy-loaded) for use in Redux reducers
// This file imports the actual module objects so we can access .reducer properties

import Dashboard from './dashboard/index.js';
import Journal from './journal/index.js';
import BankAccount from './bank_account/index.js';
import Employee from './employee/index.js';
import Contact from './contact/index.js';
import Expense from './expense/index.js';
import GeneralSettings from './general_settings/index.js';
import CustomerInvoice from './customer_invoice/index.js';
import Receipt from './receipt/index.js';
import SupplierInvoice from './supplier_invoice/index.js';
import Product from './product/index.js';
import Project from './project/index.js';
import Payment from './payment/index.js';
import TransactionCategory from './transaction_category/index.js';
import User from './user/index.js';
import VatCode from './vat_code/index.js';
import Currency from './currency/index.js';
import CurrencyConvert from './currencyConvert/index.js';
import Help from './help/index.js';
import Notification from './notification/index.js';
import Organization from './organization/index.js';
import UsersRoles from './users_roles/index.js';
import DataBackup from './data_backup/index.js';
import TransactionsReport from './transactions_report/index.js';
import ChartAccount from './chart_account/index.js';
import ProductCategory from './product_category/index.js';
import Profile from './profile/index.js';
import ImportTransaction from './import_transaction/index.js';
import OpeningBalance from './opening_balance/index.js';
import VatTransactions from './vat_transactions/index.js';
import Inventory from './inventory/index.js';
import Quotation from './quotation/index.js';
import RequestForQuotation from './request_for_quotation/index.js';
import PurchaseOrder from './purchase_order/index.js';
import GoodsReceivedNote from './goods_received_note/index.js';
import FinancialReport from './financial_report/index.js';
import SalaryRoles from './salaryRoles/index.js';
import SalaryStucture from './salaryStructure/index.js';
import SalaryTemplate from './salaryTemplate/index.js';
import Designation from './designation/index.js';
import PayrollEmployee from './payrollemp/index.js';
import CreditNotes from './creditNotes/index.js';
import Import from './import/index.js';
import PayrollRun from './payroll_run/index.js';
import DebitNotes from './debitNotes/index.js';

export {
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
};

