import { data } from '../screens/Language/index'
import LocalizedStrings from 'react-localization';
import { Dashboard } from '@material-ui/icons';
import config from './config'
let strings = new LocalizedStrings(data);
// var language= window['localStorage'].getItem('language');

if (localStorage.getItem('language') == null) {
	strings.setLanguage('en');
}
else {
	strings.setLanguage(localStorage.getItem('language'));
}


export default {

	items: [


		...(config.DASHBOARD ? [{
			name: strings.Dashboard,
			url: '/admin/dashboard',
			icon: 'icon-speedometer',
			path: 'Dashboard',
		}] : []),
		...(config.INCOME_MODULE ? [{
			name: strings.Income,
			url: '/admin/income',
			icon: 'far fa-address-book',
			children: [

				...(config.INCOME_CI ? [{
					name: strings.CustomerInvoices,
					url: '/admin/income/customer-invoice',
					icon: 'fas fa-file-invoice',
					path: 'Customer Invoices',
				}] : []),
				...(config.INCOME_IR ? [{
					name: strings.IncomeReceipts,
					url: '/admin/income/receipt',
					icon: 'fas fa-receipt',
					path: 'Customer Receipts',
				}] : []),
				...(config.INCOME_Q ? [{
					name: strings.Quotation,
					url: '/admin/income/quotation',
					icon: 'fas fa-box-open',
					path: 'Quotation',
				}] : []),
				...(config.INCOME_TCN ? [{
					name: strings.CreditNotes,
					url: '/admin/income/credit-notes',
					icon: 'fas fa-donate',
					path: 'Credit Notes',
				}] : []),
			],
		}] : []),
		...(config.EXPENSE_MODULE ? [{
			name: strings.Expense,
			url: '/admin/expense',
			icon: 'fas fa-receipt',
			children: [
				...(config.EXPENSE_EXPENSES ? [{
					name: strings.Expenses,
					url: '/admin/expense/expense',
					icon: 'fab fa-stack-exchange',
					path: 'Expenses',
				}] : []),
				...(config.EXPENSE_SI ? [{
					name: strings.SupplierInvoices,
					url: '/admin/expense/supplier-invoice',
					icon: 'fas fa-file-invoice',
					path: 'Supplier Invoices',
				}] : []),
				...(config.EXPENSE_DN ? [{
					name: strings.DebitNotes,
					url: '/admin/expense/debit-notes',
					icon: 'fa fa-credit-card',
					path: 'Debit Notes',
				}] : []),
				...(config.EXPENSE_PR ? [{
					name: strings.Purchasereceipts,
					url: '/admin/expense/purchase',
					icon: 'fas fa-receipt',
					path: 'Supplier Receipts',
				}] : []),
				// ...(config.EXPENSE_RFQ ? [{
				// 	name: strings.RFQ,
				// 	url: '/admin/expense/request-for-quotation',
				// 	icon: 'fas fa-shopping-basket',
				// 	path: 'Request For Quotation',
				// }] : []),
				// ...(config.EXPENSE_PO ? [{
				// 	name: strings.PurchaseOrder,
				// 	url: '/admin/expense/purchase-order',
				// 	icon: 'fas fa-cash-register',
				// 	path: 'Purchase Order',
				// }] : []),
				// ...(config.EXPENSE_GRN ? [{
				// 	name: strings.GRN,
				// 	url: '/admin/expense/goods-received-note',
				// 	icon: 'fas fa-archive',
				// 	path: 'Goods Receive Notes',
				// }] : []),
			],
		}] : []),
		...(config.BANKING_MODULE ? [{
			name: strings.Banking,
			url: '/admin/banking',
			icon: 'fas fa-university',
			children: [
				...(config.BANKING_BA ? [{
					name: strings.BankAccount,
					url: '/admin/banking/bank-account',
					icon: 'fas fa-university',
					path: 'Bank Accounts',
				}] : []),
				// {
				//   name: 'Upload Statement',
				//   url: '/admin/banking/upload-statement',
				//   icon: 'fa fa-upload',
				// }
			],
		}] : []),

		...(config.ACCOUNTANT_MODULE ? [{
			name: strings.Accountant,
			url: '/admin/accountant',
			icon: 'fas fa-user',
			children: [
				...(config.ACCOUNTANT_OB ? [{
					name: strings.OpeningBalance,
					url: '/admin/accountant/opening-balance',
					icon: 'fas fa-balance-scale',
					path: 'Opening Balances',
				}] : []),

				...(config.ACCOUNTANT_JOURNALS ? [{
					name: strings.Journals,
					url: '/admin/accountant/journal',
					icon: 'fas fa-gem',
					path: 'Journals',
				}] : []),

			],
		}] : []),


		// {
		// 	name: 'Taxes',
		// 	url: '/admin/taxes',
		// 	icon: 'fas fa-chart-line',
		// 	children: [
		// 		{
		// 			name: 'VAT Transactions',
		// 			url: '/admin/taxes/vat-transactions',
		// 			icon: 'fas fa-exchange-alt',
		// 			path: 'vatTransactions',
		// 		},
		// 		// {
		// 		// 	name: 'VAT Filings',
		// 		// 	url: '/admin/taxes/reports-filing',
		// 		// 	icon: 'fas fa-file-text',
		// 		// },
		// 	],
		// },
		...(config.REPORTS_MODULE ? [{
			name: strings.Report,
			url: '/admin/report',
			icon: 'fas fa-file-contract',
			path: 'Reports',
		}] : []),
		// {
		// 	name: 'Report',
		// 	url: '/admin/report',
		// 	icon: 'fas fa-chart-bar',
		// 	children: [
		// 		// {
		// 		// 	name: 'Transactions',
		// 		// 	url: '/admin/report/transactions',
		// 		// 	icon: 'fas fa-exchange-alt',
		// 		// },
		// 		{
		// 			name: 'Financial',
		// 			url: '/admin/report/reports-page',
		// 			icon: 'fas fa-usd',
		// 			path: 'Financial',
		// 		},
		// 		// {
		// 		// 	name: 'Detailed General Ledger',
		// 		// 	url: '/admin/report/detailed-general-ledger',
		// 		// 	icon: 'fas fa-file-text',
		// 		// 	path: 'DetailedGeneralLedger',
		// 		// },
		// 	],
		// },
		...(config.MASTER_MODULE ? [{
			name: strings.Master,
			url: '/admin/master',
			icon: 'fas fa-database',
			path: 'Chart Of Accounts',
			children: [
				...(config.MASTER_COA ? [{
					name: strings.ChartofAccounts,
					url: '/admin/master/chart-account',
					icon: 'fas fa-area-chart',
					path: 'Chart Of Accounts',
				}] : []),
				...(config.MASTER_CONTACT ? [{
					name: strings.Contact,
					url: '/admin/master/contact',
					icon: 'fas fa-id-card-alt',
					path: 'Contact',
				}] : []),
				...(config.MASTER_EMPLOYEE ? [{
					name: strings.Employee,
					url: '/admin/master/employee',
					icon: 'fas fa-user-plus',
					path: 'Employee',
				}] : []),
				...(config.MASTER_PRODUCTS ? [{
					name: strings.Product,
					url: '/admin/master/product',
					icon: 'fas fa-box',
					path: 'Product',
				}] : []),
				// {
				//   name: 'Project',
				//   url: '/admin/master/project',
				//   icon: 'fas fa-project-diagram',
				// },
				...(config.MASTER_VAT ? [{
					name: strings.VATCategory,
					url: '/admin/master/vat-category',
					icon: 'fas fa-briefcase',
					path: 'Vat Category',
				}] : []),
				...(config.MASTER_PC ? [{
					name: strings.ProductCategory,
					url: '/admin/master/product-category',
					icon: 'fas fa-boxes',
					path: 'Product Category',
				}] : []),
				...(config.MASTER_CR ? [{
					name: strings.CurrencyRate,
					url: '/admin/master/currencyConvert',
					icon: 'nav-icon fas fa-money',
					path: 'Currency Conversion',
				}] : []),
				// {
				//   name: 'Currencies',
				//   url: '/admin/master/currency',
				//   icon: 'fas fa-money',
				// },
			],
		}] : []),
		...(config.INVENTORY_MODULE ? [{
			name: strings.Inventory,
			url: '/admin/Inventory',
			icon: 'fas fa-warehouse',
			path: 'Inventory',
		}] : []),
		{
			name: strings.Template,
			url: '/admin/settings/template',
			icon: 'fas fa-boxes',
			path: 'Template',
		},

		...(config.PAYROLL_MODULE ? [{
			name: strings.Payroll,
			url: '/admin/payroll',
			icon: 'fas fa-users-cog',
			children: [
				...(config.PAYROLL_PR ? [{
					name: strings.PayrollRun,
					url: '/admin/payroll/payrollrun',
					icon: 'fas fa-money-check-alt',
					path: 'Payroll Run',
				}] : []),
				...(config.PAYROLL_PC ? [{
					name: strings.PayrollConfigurations,
					url: '/admin/payroll/config',
					icon: 'fas fa-cogs',
					path: 'Payroll Config',
				}] : [])
			],
		}] : []),
		// {
		//   name: 'Settings',
		//   url: '/admin/settings',
		//   icon: 'icon-settings',
		//   children: [
		//     {
		//       name: 'Users',
		//       url: '/admin/settings/user',
		//       icon: 'fas fa-users',
		//     },
		//     // {
		//     //   name: 'Organization',
		//     //   url: '/admin/settings/organization',
		//     //   icon: 'fas fa-sitemap',
		//     // }
		//   ]
		// }
	]
};
