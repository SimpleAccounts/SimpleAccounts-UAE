import VatTransactionsReducer from '../reducer';
import { VAT_TRANSACTIONS } from 'constants/types';

describe('VatTransactionsReducer', () => {
	const initialState = {
		vat_transaction_list: [],
	};

	it('should return the initial state', () => {
		expect(VatTransactionsReducer(undefined, {})).toEqual(initialState);
	});

	it('should return initial state when undefined is passed', () => {
		const result = VatTransactionsReducer(undefined, { type: 'UNKNOWN' });
		expect(result).toEqual(initialState);
	});

	describe('VAT_TRANSACTION_LIST', () => {
		it('should handle VAT_TRANSACTION_LIST action with valid data', () => {
			const mockTransactions = [
				{
					id: 1,
					referenceNumber: 'VAT-001',
					amount: 1000,
					vatAmount: 50,
					status: 'Filed',
					transactionDate: '2024-01-15',
				},
				{
					id: 2,
					referenceNumber: 'VAT-002',
					amount: 2000,
					vatAmount: 100,
					status: 'Pending',
					transactionDate: '2024-01-20',
				},
			];

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: mockTransactions },
			};

			const expectedState = {
				...initialState,
				vat_transaction_list: mockTransactions,
			};

			expect(VatTransactionsReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing VAT transaction list', () => {
			const existingState = {
				...initialState,
				vat_transaction_list: [
					{ id: 99, referenceNumber: 'VAT-OLD', amount: 500 }
				],
			};

			const newTransactions = [
				{ id: 1, referenceNumber: 'VAT-NEW-001', amount: 1500 },
				{ id: 2, referenceNumber: 'VAT-NEW-002', amount: 2500 },
			];

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: newTransactions },
			};

			const newState = VatTransactionsReducer(existingState, action);
			expect(newState.vat_transaction_list).toEqual(newTransactions);
			expect(newState.vat_transaction_list).toHaveLength(2);
		});

		it('should handle empty VAT transaction list', () => {
			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: [] },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list).toEqual([]);
			expect(newState.vat_transaction_list).toHaveLength(0);
		});

		it('should extract data from nested payload structure', () => {
			const transactionData = [
				{ id: 1, referenceNumber: 'VAT-001', amount: 1000 },
				{ id: 2, referenceNumber: 'VAT-002', amount: 2000 },
			];

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: {
					data: transactionData,
					totalRecords: 2,
					pageNo: 1,
					pageSize: 10,
				},
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list).toEqual(transactionData);
		});

		it('should create a new array reference using Object.assign', () => {
			const mockTransactions = [{ id: 1, referenceNumber: 'VAT-001' }];
			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: mockTransactions },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list).not.toBe(mockTransactions);
			expect(newState.vat_transaction_list).toEqual(mockTransactions);
		});

		it('should handle VAT transactions with complete information', () => {
			const complexTransactions = [
				{
					id: 1,
					referenceNumber: 'VAT-2024-001',
					customerName: 'ABC Trading LLC',
					invoiceDate: '2024-01-15',
					dueDate: '2024-02-15',
					amount: 10000,
					vatAmount: 500,
					totalAmount: 10500,
					vatRate: 5,
					status: 'Filed',
					taxPeriod: 'Q1-2024',
					filingDate: '2024-03-31',
				},
			];

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: complexTransactions },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list[0]).toHaveProperty('referenceNumber', 'VAT-2024-001');
			expect(newState.vat_transaction_list[0]).toHaveProperty('vatAmount', 500);
			expect(newState.vat_transaction_list[0]).toHaveProperty('status', 'Filed');
		});

		it('should handle VAT transactions with different statuses', () => {
			const transactions = [
				{ id: 1, referenceNumber: 'VAT-001', status: 'Filed', amount: 1000 },
				{ id: 2, referenceNumber: 'VAT-002', status: 'Pending', amount: 2000 },
				{ id: 3, referenceNumber: 'VAT-003', status: 'Draft', amount: 3000 },
				{ id: 4, referenceNumber: 'VAT-004', status: 'Cancelled', amount: 4000 },
			];

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: transactions },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list).toHaveLength(4);
			expect(newState.vat_transaction_list[0].status).toBe('Filed');
			expect(newState.vat_transaction_list[3].status).toBe('Cancelled');
		});

		it('should handle large VAT transaction lists', () => {
			const largeList = Array.from({ length: 100 }, (_, i) => ({
				id: i + 1,
				referenceNumber: `VAT-${String(i + 1).padStart(3, '0')}`,
				amount: (i + 1) * 1000,
			}));

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: largeList },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState.vat_transaction_list).toHaveLength(100);
			expect(newState.vat_transaction_list[99].referenceNumber).toBe('VAT-100');
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action type', () => {
			const action = {
				type: 'UNKNOWN_ACTION_TYPE',
				payload: { data: 'test' },
			};

			const newState = VatTransactionsReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				vat_transaction_list: [
					{ id: 1, referenceNumber: 'VAT-001', amount: 1000 }
				],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = VatTransactionsReducer(currentState, action);
			expect(newState).toEqual(currentState);
			expect(newState).toBe(currentState);
		});

		it('should handle action with missing type', () => {
			const currentState = { ...initialState };
			const action = { payload: { data: 'test' } };

			const newState = VatTransactionsReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});

		it('should handle null action type', () => {
			const currentState = {
				vat_transaction_list: [{ id: 1 }],
			};
			const action = { type: null, payload: {} };

			const newState = VatTransactionsReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state', () => {
			const originalState = { ...initialState };
			const payload = { data: [{ id: 1, referenceNumber: 'VAT-001' }] };

			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload,
			};

			VatTransactionsReducer(originalState, action);
			expect(originalState.vat_transaction_list).toEqual([]);
		});

		it('should create new state object reference', () => {
			const originalState = { ...initialState };
			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: [{ id: 1 }] },
			};

			const newState = VatTransactionsReducer(originalState, action);
			expect(newState).not.toBe(originalState);
		});

		it('should not mutate existing transaction list', () => {
			const existingTransactions = [{ id: 1, referenceNumber: 'VAT-001' }];
			const stateWithData = {
				...initialState,
				vat_transaction_list: existingTransactions,
			};

			const newTransactions = [{ id: 2, referenceNumber: 'VAT-002' }];
			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: newTransactions },
			};

			VatTransactionsReducer(stateWithData, action);
			expect(existingTransactions).toEqual([{ id: 1, referenceNumber: 'VAT-001' }]);
		});

		it('should create independent array copies', () => {
			const sourceData = [{ id: 1, amount: 1000 }];
			const action = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: sourceData },
			};

			const newState = VatTransactionsReducer(initialState, action);

			// Modify source data
			sourceData.push({ id: 2, amount: 2000 });

			// New state should not be affected
			expect(newState.vat_transaction_list).toHaveLength(1);
		});

		it('should preserve state immutability on multiple updates', () => {
			let currentState = { ...initialState };

			// First update
			const action1 = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: [{ id: 1 }] },
			};
			const state1 = VatTransactionsReducer(currentState, action1);

			// Second update
			const action2 = {
				type: VAT_TRANSACTIONS.VAT_TRANSACTION_LIST,
				payload: { data: [{ id: 2 }] },
			};
			const state2 = VatTransactionsReducer(state1, action2);

			// All states should be different references
			expect(currentState).not.toBe(state1);
			expect(state1).not.toBe(state2);
			expect(currentState.vat_transaction_list).toEqual([]);
			expect(state1.vat_transaction_list).toEqual([{ id: 1 }]);
			expect(state2.vat_transaction_list).toEqual([{ id: 2 }]);
		});
	});
});
