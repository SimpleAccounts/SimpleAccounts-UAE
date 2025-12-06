import TempReducer from '../reducer';
import { TEMP } from 'constants/types';

describe('TempReducer (Detailed General Ledger Report)', () => {
	const initialState = {
		customer_invoice_report: [],
		contact_list: [],
		account_balance_report: [],
		account_type_list: [],
		transaction_type_list: [],
		transaction_category_list: [],
	};

	it('should return the initial state', () => {
		expect(TempReducer(undefined, {})).toEqual(initialState);
	});

	it('should return initial state when undefined is passed', () => {
		const result = TempReducer(undefined, { type: 'UNKNOWN' });
		expect(result).toEqual(initialState);
	});

	describe('ACCOUNT_BALANCE_REPORT', () => {
		it('should handle ACCOUNT_BALANCE_REPORT action with valid data', () => {
			const mockReports = [
				{
					accountId: 1,
					accountName: 'Cash Account',
					balance: 50000,
					currency: 'AED',
				},
				{
					accountId: 2,
					accountName: 'Bank Account',
					balance: 100000,
					currency: 'AED',
				},
			];

			const action = {
				type: TEMP.ACCOUNT_BALANCE_REPORT,
				payload: { data: mockReports },
			};

			const expectedState = {
				...initialState,
				account_balance_report: mockReports,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing account balance report', () => {
			const existingState = {
				...initialState,
				account_balance_report: [{ accountId: 99, balance: 999 }],
			};

			const newReports = [
				{ accountId: 1, balance: 1000 },
				{ accountId: 2, balance: 2000 },
			];

			const action = {
				type: TEMP.ACCOUNT_BALANCE_REPORT,
				payload: { data: newReports },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.account_balance_report).toEqual(newReports);
			expect(newState.account_balance_report).toHaveLength(2);
		});

		it('should handle empty account balance report', () => {
			const action = {
				type: TEMP.ACCOUNT_BALANCE_REPORT,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.account_balance_report).toEqual([]);
		});

		it('should preserve other state properties', () => {
			const stateWithData = {
				...initialState,
				contact_list: [{ id: 1, name: 'Contact' }],
			};

			const action = {
				type: TEMP.ACCOUNT_BALANCE_REPORT,
				payload: { data: [{ accountId: 1 }] },
			};

			const newState = TempReducer(stateWithData, action);
			expect(newState.contact_list).toEqual([{ id: 1, name: 'Contact' }]);
		});
	});

	describe('CUSTOMER_INVOICE_REPORT', () => {
		it('should handle CUSTOMER_INVOICE_REPORT action with valid data', () => {
			const mockInvoices = [
				{
					invoiceId: 1,
					invoiceNumber: 'INV-001',
					customerName: 'ABC Trading',
					amount: 5000,
					status: 'Paid',
				},
				{
					invoiceId: 2,
					invoiceNumber: 'INV-002',
					customerName: 'XYZ Corp',
					amount: 7500,
					status: 'Pending',
				},
			];

			const action = {
				type: TEMP.CUSTOMER_INVOICE_REPORT,
				payload: { data: mockInvoices },
			};

			const expectedState = {
				...initialState,
				customer_invoice_report: mockInvoices,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing customer invoice report', () => {
			const existingState = {
				...initialState,
				customer_invoice_report: [{ invoiceId: 99 }],
			};

			const newInvoices = [
				{ invoiceId: 1, amount: 1000 },
				{ invoiceId: 2, amount: 2000 },
			];

			const action = {
				type: TEMP.CUSTOMER_INVOICE_REPORT,
				payload: { data: newInvoices },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.customer_invoice_report).toEqual(newInvoices);
		});

		it('should handle empty customer invoice report', () => {
			const action = {
				type: TEMP.CUSTOMER_INVOICE_REPORT,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.customer_invoice_report).toEqual([]);
		});
	});

	describe('CONTACT_LIST', () => {
		it('should handle CONTACT_LIST action with valid data', () => {
			const mockContacts = [
				{ id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', type: 'Customer' },
				{ id: 2, name: 'Fatima Hassan', email: 'fatima@example.com', type: 'Supplier' },
			];

			const action = {
				type: TEMP.CONTACT_LIST,
				payload: { data: mockContacts },
			};

			const expectedState = {
				...initialState,
				contact_list: mockContacts,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing contact list', () => {
			const existingState = {
				...initialState,
				contact_list: [{ id: 99, name: 'Old Contact' }],
			};

			const newContacts = [{ id: 1, name: 'New Contact' }];

			const action = {
				type: TEMP.CONTACT_LIST,
				payload: { data: newContacts },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.contact_list).toEqual(newContacts);
		});

		it('should handle empty contact list', () => {
			const action = {
				type: TEMP.CONTACT_LIST,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.contact_list).toEqual([]);
		});
	});

	describe('ACCOUNT_TYPE_LIST', () => {
		it('should handle ACCOUNT_TYPE_LIST action with valid data', () => {
			const mockTypes = [
				{ id: 1, typeName: 'Asset', category: 'Balance Sheet' },
				{ id: 2, typeName: 'Liability', category: 'Balance Sheet' },
				{ id: 3, typeName: 'Revenue', category: 'Income Statement' },
			];

			const action = {
				type: TEMP.ACCOUNT_TYPE_LIST,
				payload: { data: mockTypes },
			};

			const expectedState = {
				...initialState,
				account_type_list: mockTypes,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing account type list', () => {
			const existingState = {
				...initialState,
				account_type_list: [{ id: 99, typeName: 'Old Type' }],
			};

			const newTypes = [
				{ id: 1, typeName: 'Asset' },
				{ id: 2, typeName: 'Liability' },
			];

			const action = {
				type: TEMP.ACCOUNT_TYPE_LIST,
				payload: { data: newTypes },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.account_type_list).toEqual(newTypes);
		});

		it('should handle empty account type list', () => {
			const action = {
				type: TEMP.ACCOUNT_TYPE_LIST,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.account_type_list).toEqual([]);
		});
	});

	describe('TRANSACTION_TYPE_LIST', () => {
		it('should handle TRANSACTION_TYPE_LIST action with valid data', () => {
			const mockTypes = [
				{ id: 1, typeName: 'Payment', category: 'Outflow' },
				{ id: 2, typeName: 'Receipt', category: 'Inflow' },
				{ id: 3, typeName: 'Journal', category: 'Adjustment' },
			];

			const action = {
				type: TEMP.TRANSACTION_TYPE_LIST,
				payload: { data: mockTypes },
			};

			const expectedState = {
				...initialState,
				transaction_type_list: mockTypes,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing transaction type list', () => {
			const existingState = {
				...initialState,
				transaction_type_list: [{ id: 99 }],
			};

			const newTypes = [{ id: 1 }, { id: 2 }];

			const action = {
				type: TEMP.TRANSACTION_TYPE_LIST,
				payload: { data: newTypes },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.transaction_type_list).toEqual(newTypes);
		});

		it('should handle empty transaction type list', () => {
			const action = {
				type: TEMP.TRANSACTION_TYPE_LIST,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.transaction_type_list).toEqual([]);
		});
	});

	describe('TRANSACTION_CATEGORY_LIST', () => {
		it('should handle TRANSACTION_CATEGORY_LIST action with valid data', () => {
			const mockCategories = [
				{ id: 1, categoryName: 'Sales', categoryType: 'Income' },
				{ id: 2, categoryName: 'Purchases', categoryType: 'Expense' },
				{ id: 3, categoryName: 'Salaries', categoryType: 'Expense' },
			];

			const action = {
				type: TEMP.TRANSACTION_CATEGORY_LIST,
				payload: { data: mockCategories },
			};

			const expectedState = {
				...initialState,
				transaction_category_list: mockCategories,
			};

			expect(TempReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing transaction category list', () => {
			const existingState = {
				...initialState,
				transaction_category_list: [{ id: 99 }],
			};

			const newCategories = [{ id: 1 }, { id: 2 }];

			const action = {
				type: TEMP.TRANSACTION_CATEGORY_LIST,
				payload: { data: newCategories },
			};

			const newState = TempReducer(existingState, action);
			expect(newState.transaction_category_list).toEqual(newCategories);
		});

		it('should handle empty transaction category list', () => {
			const action = {
				type: TEMP.TRANSACTION_CATEGORY_LIST,
				payload: { data: [] },
			};

			const newState = TempReducer(initialState, action);
			expect(newState.transaction_category_list).toEqual([]);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action type', () => {
			const action = {
				type: 'UNKNOWN_ACTION_TYPE',
				payload: { data: 'test' },
			};

			const newState = TempReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				contact_list: [{ id: 1 }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = TempReducer(currentState, action);
			expect(newState).toEqual(currentState);
			expect(newState).toBe(currentState);
		});

		it('should handle action with missing type', () => {
			const currentState = { ...initialState };
			const action = { payload: { data: 'test' } };

			const newState = TempReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state', () => {
			const originalState = { ...initialState };
			const action = {
				type: TEMP.CONTACT_LIST,
				payload: { data: [{ id: 1 }] },
			};

			TempReducer(originalState, action);
			expect(originalState.contact_list).toEqual([]);
		});

		it('should create new state object reference', () => {
			const originalState = { ...initialState };
			const action = {
				type: TEMP.ACCOUNT_BALANCE_REPORT,
				payload: { data: [{ accountId: 1 }] },
			};

			const newState = TempReducer(originalState, action);
			expect(newState).not.toBe(originalState);
		});

		it('should preserve other state properties on updates', () => {
			const stateWithAllData = {
				customer_invoice_report: [{ id: 1 }],
				contact_list: [{ id: 2 }],
				account_balance_report: [{ id: 3 }],
				account_type_list: [{ id: 4 }],
				transaction_type_list: [{ id: 5 }],
				transaction_category_list: [{ id: 6 }],
			};

			const action = {
				type: TEMP.CONTACT_LIST,
				payload: { data: [{ id: 99 }] },
			};

			const newState = TempReducer(stateWithAllData, action);
			expect(newState.customer_invoice_report).toEqual([{ id: 1 }]);
			expect(newState.account_balance_report).toEqual([{ id: 3 }]);
			expect(newState.contact_list).toEqual([{ id: 99 }]);
		});
	});
});
