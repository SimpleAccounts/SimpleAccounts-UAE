import BankAccountReducer from '../reducer';
import { BANK_ACCOUNT } from 'constants/types';

describe('BankAccountReducer', () => {
	const initialState = {
		bank_account_list: [],
		bank_transaction_list: [],
		account_type_list: [],
		currency_list: [],
		country_list: [],
		transaction_type_list: [],
		transaction_category_list: [],
		project_list: [],
		customer_invoice_list: [],
		expense_list: [],
		expense_categories_list: [],
		user_list: [],
		vendor_list: [],
		vat_list: [],
		reconcile_list: [],
		UnPaidPayrolls_List: [],
		bank_list: [],
	};

	it('should return the initial state', () => {
		expect(BankAccountReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle BANK_ACCOUNT.BANK_ACCOUNT_LIST', () => {
		const mockBankAccounts = [
			{ id: 1, bankName: 'Emirates NBD', accountNumber: '123456' },
			{ id: 2, bankName: 'Dubai Islamic Bank', accountNumber: '789012' },
		];

		const action = {
			type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
			payload: { data: mockBankAccounts },
		};

		const expectedState = {
			...initialState,
			bank_account_list: mockBankAccounts,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.BANK_TRANSACTION_LIST', () => {
		const mockTransactions = [
			{ id: 1, amount: 5000, transactionType: 'deposit' },
			{ id: 2, amount: 2000, transactionType: 'withdrawal' },
		];

		const action = {
			type: BANK_ACCOUNT.BANK_TRANSACTION_LIST,
			payload: { data: mockTransactions },
		};

		const expectedState = {
			...initialState,
			bank_transaction_list: mockTransactions,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.ACCOUNT_TYPE_LIST', () => {
		const mockAccountTypes = [
			{ id: 1, accountType: 'Savings' },
			{ id: 2, accountType: 'Current' },
			{ id: 3, accountType: 'Business' },
		];

		const action = {
			type: BANK_ACCOUNT.ACCOUNT_TYPE_LIST,
			payload: { data: mockAccountTypes },
		};

		const expectedState = {
			...initialState,
			account_type_list: mockAccountTypes,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.CURRENCY_LIST', () => {
		const mockCurrencies = [
			{ code: 'AED', name: 'UAE Dirham' },
			{ code: 'USD', name: 'US Dollar' },
			{ code: 'EUR', name: 'Euro' },
		];

		const action = {
			type: BANK_ACCOUNT.CURRENCY_LIST,
			payload: { data: mockCurrencies },
		};

		const expectedState = {
			...initialState,
			currency_list: mockCurrencies,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.COUNTRY_LIST', () => {
		const mockCountries = [
			{ code: 'AE', name: 'United Arab Emirates' },
			{ code: 'US', name: 'United States' },
			{ code: 'GB', name: 'United Kingdom' },
		];

		const action = {
			type: BANK_ACCOUNT.COUNTRY_LIST,
			payload: { data: mockCountries },
		};

		const expectedState = {
			...initialState,
			country_list: mockCountries,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.TRANSACTION_CATEGORY_LIST', () => {
		const mockCategories = [
			{ id: 1, category: 'Sales' },
			{ id: 2, category: 'Expenses' },
		];

		const action = {
			type: BANK_ACCOUNT.TRANSACTION_CATEGORY_LIST,
			payload: mockCategories,
		};

		const expectedState = {
			...initialState,
			transaction_category_list: mockCategories,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.VENDOR_LIST', () => {
		const mockVendors = [
			{ vendorId: 1, vendorName: 'Vendor A' },
			{ vendorId: 2, vendorName: 'Vendor B' },
		];

		const action = {
			type: BANK_ACCOUNT.VENDOR_LIST,
			payload: { data: mockVendors },
		};

		const expectedState = {
			...initialState,
			vendor_list: mockVendors,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.PROJECT_LIST', () => {
		const mockProjects = [
			{ projectId: 1, projectName: 'Project Alpha' },
			{ projectId: 2, projectName: 'Project Beta' },
		];

		const action = {
			type: BANK_ACCOUNT.PROJECT_LIST,
			payload: mockProjects,
		};

		const expectedState = {
			...initialState,
			project_list: mockProjects,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.BANK_LIST', () => {
		const mockBanks = [
			{ bankId: 1, bankName: 'Emirates NBD' },
			{ bankId: 2, bankName: 'Dubai Islamic Bank' },
		];

		const action = {
			type: BANK_ACCOUNT.BANK_LIST,
			payload: mockBanks,
		};

		const expectedState = {
			...initialState,
			bank_list: mockBanks,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.CUSTOMER_INVOICE_LIST', () => {
		const mockInvoices = [
			{ invoiceId: 1, invoiceNumber: 'INV-001', amount: 10000 },
			{ invoiceId: 2, invoiceNumber: 'INV-002', amount: 15000 },
		];

		const action = {
			type: BANK_ACCOUNT.CUSTOMER_INVOICE_LIST,
			payload: mockInvoices,
		};

		const expectedState = {
			...initialState,
			customer_invoice_list: mockInvoices,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.VENDOR_INVOICE_LIST', () => {
		const mockVendorInvoices = [
			{ invoiceId: 1, vendorName: 'Vendor A', amount: 5000 },
			{ invoiceId: 2, vendorName: 'Vendor B', amount: 7500 },
		];

		const action = {
			type: BANK_ACCOUNT.VENDOR_INVOICE_LIST,
			payload: mockVendorInvoices,
		};

		const expectedState = {
			...initialState,
			vendor_invoice_list: mockVendorInvoices,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.EXPENSE_LIST', () => {
		const mockExpenses = [
			{ expenseId: 1, description: 'Office supplies', amount: 500 },
			{ expenseId: 2, description: 'Travel', amount: 2000 },
		];

		const action = {
			type: BANK_ACCOUNT.EXPENSE_LIST,
			payload: mockExpenses,
		};

		const expectedState = {
			...initialState,
			expense_list: mockExpenses,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.EXPENSE_CATEGORIES_LIST', () => {
		const mockExpenseCategories = [
			{ id: 1, categoryName: 'Travel' },
			{ id: 2, categoryName: 'Office Supplies' },
		];

		const action = {
			type: BANK_ACCOUNT.EXPENSE_CATEGORIES_LIST,
			payload: mockExpenseCategories,
		};

		const expectedState = {
			...initialState,
			expense_categories_list: mockExpenseCategories,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.USER_LIST', () => {
		const mockUsers = [
			{ userId: 1, userName: 'John Doe' },
			{ userId: 2, userName: 'Jane Smith' },
		];

		const action = {
			type: BANK_ACCOUNT.USER_LIST,
			payload: mockUsers,
		};

		const expectedState = {
			...initialState,
			user_list: mockUsers,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.TRANSACTION_TYPE_LIST', () => {
		const mockTransactionTypes = [
			{ id: 1, type: 'Deposit' },
			{ id: 2, type: 'Withdrawal' },
		];

		const action = {
			type: BANK_ACCOUNT.TRANSACTION_TYPE_LIST,
			payload: mockTransactionTypes,
		};

		const expectedState = {
			...initialState,
			transaction_type_list: mockTransactionTypes,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.RECONCILE_LIST', () => {
		const mockReconcileList = [
			{ id: 1, reconciliationDate: '2023-12-01', status: 'completed' },
			{ id: 2, reconciliationDate: '2023-12-15', status: 'pending' },
		];

		const action = {
			type: BANK_ACCOUNT.RECONCILE_LIST,
			payload: mockReconcileList,
		};

		const expectedState = {
			...initialState,
			reconcile_list: mockReconcileList,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.VAT_LIST', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard Rate', rate: 5 },
			{ id: 2, name: 'Zero Rate', rate: 0 },
		];

		const action = {
			type: BANK_ACCOUNT.VAT_LIST,
			payload: { data: mockVatList },
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle BANK_ACCOUNT.UNPAID_PAYROLLS', () => {
		const mockUnpaidPayrolls = [
			{ payrollId: 1, employeeName: 'John Doe', amount: 10000 },
			{ payrollId: 2, employeeName: 'Jane Smith', amount: 12000 },
		];

		const action = {
			type: BANK_ACCOUNT.UNPAID_PAYROLLS,
			payload: { data: mockUnpaidPayrolls },
		};

		const expectedState = {
			...initialState,
			UnPaidPayrolls_List: mockUnpaidPayrolls,
		};

		expect(BankAccountReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(BankAccountReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate original state', () => {
		const mockData = [{ id: 1, name: 'Test' }];
		const action = {
			type: BANK_ACCOUNT.BANK_ACCOUNT_LIST,
			payload: { data: mockData },
		};

		const stateBefore = { ...initialState };
		BankAccountReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});
});
