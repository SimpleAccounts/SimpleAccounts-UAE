import TempReducer from '../reducer';
import { TEMP } from 'constants/types';

describe('Transactions Report Reducer', () => {
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

	it('should handle TEMP.CUSTOMER_INVOICE_REPORT action', () => {
		const mockReportData = [
			{ id: 1, invoiceNo: 'INV-001', amount: 1000, customer: 'Customer A' },
			{ id: 2, invoiceNo: 'INV-002', amount: 2000, customer: 'Customer B' },
		];

		const action = {
			type: TEMP.CUSTOMER_INVOICE_REPORT,
			payload: { data: mockReportData },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.customer_invoice_report).toEqual(mockReportData);
		expect(newState.customer_invoice_report).toHaveLength(2);
	});

	it('should handle TEMP.ACCOUNT_BALANCE_REPORT action', () => {
		const mockBalanceData = [
			{ accountId: 1, accountName: 'Cash', balance: 50000 },
			{ accountId: 2, accountName: 'Bank', balance: 100000 },
		];

		const action = {
			type: TEMP.ACCOUNT_BALANCE_REPORT,
			payload: { data: mockBalanceData },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.account_balance_report).toEqual(mockBalanceData);
		expect(newState.account_balance_report).toHaveLength(2);
	});

	it('should handle TEMP.CONTACT_LIST action', () => {
		const mockContacts = [
			{ id: 1, name: 'Contact A', email: 'contacta@example.com' },
			{ id: 2, name: 'Contact B', email: 'contactb@example.com' },
			{ id: 3, name: 'Contact C', email: 'contactc@example.com' },
		];

		const action = {
			type: TEMP.CONTACT_LIST,
			payload: { data: mockContacts },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.contact_list).toEqual(mockContacts);
		expect(newState.contact_list).toHaveLength(3);
	});

	it('should handle TEMP.ACCOUNT_TYPE_LIST action', () => {
		const mockAccountTypes = [
			{ id: 1, type: 'Savings', code: 'SAV' },
			{ id: 2, type: 'Current', code: 'CUR' },
		];

		const action = {
			type: TEMP.ACCOUNT_TYPE_LIST,
			payload: { data: mockAccountTypes },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.account_type_list).toEqual(mockAccountTypes);
		expect(newState.account_type_list).toHaveLength(2);
	});

	it('should handle TEMP.TRANSACTION_TYPE_LIST action', () => {
		const mockTransactionTypes = [
			{ id: 1, name: 'Income', code: 'INC' },
			{ id: 2, name: 'Expense', code: 'EXP' },
			{ id: 3, name: 'Transfer', code: 'TRF' },
		];

		const action = {
			type: TEMP.TRANSACTION_TYPE_LIST,
			payload: { data: mockTransactionTypes },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.transaction_type_list).toEqual(mockTransactionTypes);
		expect(newState.transaction_type_list).toHaveLength(3);
	});

	it('should handle TEMP.TRANSACTION_CATEGORY_LIST action', () => {
		const mockCategories = [
			{ id: 1, name: 'Sales', parentId: null },
			{ id: 2, name: 'Services', parentId: null },
		];

		const action = {
			type: TEMP.TRANSACTION_CATEGORY_LIST,
			payload: { data: mockCategories },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.transaction_category_list).toEqual(mockCategories);
		expect(newState.transaction_category_list).toHaveLength(2);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: TEMP.CONTACT_LIST,
			payload: { data: [{ id: 1, name: 'Test' }] },
		};

		const stateBefore = { ...initialState };
		TempReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION_TYPE',
			payload: { data: [] },
		};

		const newState = TempReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should update customer invoice report without affecting other state', () => {
		const stateWithData = {
			...initialState,
			contact_list: [{ id: 1, name: 'Existing Contact' }],
		};

		const action = {
			type: TEMP.CUSTOMER_INVOICE_REPORT,
			payload: { data: [{ id: 1, invoiceNo: 'INV-001' }] },
		};

		const newState = TempReducer(stateWithData, action);

		expect(newState.customer_invoice_report).toHaveLength(1);
		expect(newState.contact_list).toHaveLength(1);
		expect(newState.contact_list[0].name).toBe('Existing Contact');
	});

	it('should handle empty data arrays', () => {
		const action = {
			type: TEMP.CUSTOMER_INVOICE_REPORT,
			payload: { data: [] },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.customer_invoice_report).toEqual([]);
		expect(newState.customer_invoice_report).toHaveLength(0);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			...initialState,
			contact_list: [{ id: 1, name: 'Old Contact' }],
		};

		const action = {
			type: TEMP.CONTACT_LIST,
			payload: { data: [{ id: 2, name: 'New Contact' }] },
		};

		const newState = TempReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.contact_list).not.toBe(currentState.contact_list);
	});

	it('should handle large datasets', () => {
		const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
			id: i + 1,
			invoiceNo: `INV-${String(i + 1).padStart(4, '0')}`,
			amount: (i + 1) * 100,
		}));

		const action = {
			type: TEMP.CUSTOMER_INVOICE_REPORT,
			payload: { data: largeDataset },
		};

		const newState = TempReducer(initialState, action);

		expect(newState.customer_invoice_report).toHaveLength(1000);
		expect(newState.customer_invoice_report[0].invoiceNo).toBe('INV-0001');
		expect(newState.customer_invoice_report[999].invoiceNo).toBe('INV-1000');
	});

	it('should handle sequential updates to different state properties', () => {
		let state = initialState;

		const action1 = {
			type: TEMP.CONTACT_LIST,
			payload: { data: [{ id: 1, name: 'Contact 1' }] },
		};

		state = TempReducer(state, action1);
		expect(state.contact_list).toHaveLength(1);

		const action2 = {
			type: TEMP.TRANSACTION_TYPE_LIST,
			payload: { data: [{ id: 1, name: 'Type 1' }] },
		};

		state = TempReducer(state, action2);
		expect(state.contact_list).toHaveLength(1);
		expect(state.transaction_type_list).toHaveLength(1);

		const action3 = {
			type: TEMP.ACCOUNT_TYPE_LIST,
			payload: { data: [{ id: 1, type: 'Savings' }] },
		};

		state = TempReducer(state, action3);
		expect(state.contact_list).toHaveLength(1);
		expect(state.transaction_type_list).toHaveLength(1);
		expect(state.account_type_list).toHaveLength(1);
	});

	it('should preserve state shape after all actions', () => {
		const action = {
			type: TEMP.CUSTOMER_INVOICE_REPORT,
			payload: { data: [{ id: 1 }] },
		};

		const newState = TempReducer(initialState, action);

		expect(newState).toHaveProperty('customer_invoice_report');
		expect(newState).toHaveProperty('contact_list');
		expect(newState).toHaveProperty('account_balance_report');
		expect(newState).toHaveProperty('account_type_list');
		expect(newState).toHaveProperty('transaction_type_list');
		expect(newState).toHaveProperty('transaction_category_list');
		expect(Object.keys(newState)).toHaveLength(6);
	});
});
