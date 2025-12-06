import TransactionReducer from '../reducer';
import { TRANSACTION } from 'constants/types';

describe('Transaction Category Reducer', () => {
	const initialState = {
		transaction_list: [],
		transaction_row: {},
	};

	it('should return the initial state', () => {
		expect(TransactionReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle TRANSACTION.TRANSACTION_LIST action', () => {
		const mockTransactions = [
			{
				transactionCategoryId: 1,
				transactionCategoryCode: 'TC001',
				transactionCategoryName: 'Revenue',
				transactionCategoryDescription: 'Revenue transactions',
			},
			{
				transactionCategoryId: 2,
				transactionCategoryCode: 'TC002',
				transactionCategoryName: 'Expenses',
				transactionCategoryDescription: 'Expense transactions',
			},
		];

		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: mockTransactions,
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_list).toEqual(mockTransactions);
		expect(newState.transaction_list).toHaveLength(2);
		expect(newState.transaction_row).toEqual({});
	});

	it('should handle TRANSACTION.TRANSACTION_ROW action', () => {
		const mockTransaction = {
			transactionCategoryId: 1,
			transactionCategoryCode: 'TC001',
			transactionCategoryName: 'Revenue',
			transactionCategoryDescription: 'Revenue transactions',
		};

		const action = {
			type: TRANSACTION.TRANSACTION_ROW,
			payload: mockTransaction,
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_row).toEqual(mockTransaction);
		expect(newState.transaction_list).toEqual([]);
	});

	it('should update transaction list without affecting transaction row', () => {
		const stateWithRow = {
			transaction_list: [],
			transaction_row: { id: 1, name: 'Test' },
		};

		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 1 }, { id: 2 }],
		};

		const newState = TransactionReducer(stateWithRow, action);

		expect(newState.transaction_list).toHaveLength(2);
		expect(newState.transaction_row).toEqual({ id: 1, name: 'Test' });
	});

	it('should update transaction row without affecting transaction list', () => {
		const stateWithList = {
			transaction_list: [{ id: 1 }, { id: 2 }],
			transaction_row: {},
		};

		const action = {
			type: TRANSACTION.TRANSACTION_ROW,
			payload: { id: 3, name: 'New Transaction' },
		};

		const newState = TransactionReducer(stateWithList, action);

		expect(newState.transaction_row).toEqual({ id: 3, name: 'New Transaction' });
		expect(newState.transaction_list).toHaveLength(2);
	});

	it('should handle empty transaction list payload', () => {
		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [],
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_list).toEqual([]);
		expect(newState.transaction_list).toHaveLength(0);
	});

	it('should handle empty transaction row payload', () => {
		const action = {
			type: TRANSACTION.TRANSACTION_ROW,
			payload: {},
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_row).toEqual({});
	});

	it('should not mutate the original state', () => {
		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 1 }],
		};

		const stateBefore = { ...initialState };
		TransactionReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = TransactionReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			transaction_list: [{ id: 1 }],
			transaction_row: { id: 1 },
		};

		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 2 }],
		};

		const newState = TransactionReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.transaction_list).not.toBe(currentState.transaction_list);
	});

	it('should handle transaction with nested properties', () => {
		const mockTransactions = [
			{
				transactionCategoryId: 1,
				transactionCategoryCode: 'TC001',
				transactionCategoryName: 'Revenue',
				parentTransactionCategory: {
					transactionCategoryDescription: 'Parent Category',
				},
				transactionType: {
					transactionTypeName: 'Income',
				},
			},
		];

		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: mockTransactions,
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_list[0].parentTransactionCategory.transactionCategoryDescription).toBe('Parent Category');
		expect(newState.transaction_list[0].transactionType.transactionTypeName).toBe('Income');
	});

	it('should handle large transaction list', () => {
		const largeList = Array.from({ length: 100 }, (_, i) => ({
			transactionCategoryId: i + 1,
			transactionCategoryCode: `TC${i + 1}`,
			transactionCategoryName: `Transaction ${i + 1}`,
		}));

		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: largeList,
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_list).toHaveLength(100);
		expect(newState.transaction_list[0].transactionCategoryName).toBe('Transaction 1');
		expect(newState.transaction_list[99].transactionCategoryName).toBe('Transaction 100');
	});

	it('should preserve state shape after actions', () => {
		const action = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 1 }],
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState).toHaveProperty('transaction_list');
		expect(newState).toHaveProperty('transaction_row');
		expect(Object.keys(newState)).toHaveLength(2);
	});

	it('should handle multiple consecutive updates', () => {
		let state = initialState;

		const action1 = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 1 }],
		};

		state = TransactionReducer(state, action1);
		expect(state.transaction_list).toHaveLength(1);

		const action2 = {
			type: TRANSACTION.TRANSACTION_ROW,
			payload: { id: 1, name: 'Test' },
		};

		state = TransactionReducer(state, action2);
		expect(state.transaction_row.name).toBe('Test');

		const action3 = {
			type: TRANSACTION.TRANSACTION_LIST,
			payload: [{ id: 1 }, { id: 2 }, { id: 3 }],
		};

		state = TransactionReducer(state, action3);
		expect(state.transaction_list).toHaveLength(3);
	});

	it('should handle transaction row with complex data', () => {
		const complexTransaction = {
			transactionCategoryId: 1,
			transactionCategoryCode: 'TC001',
			transactionCategoryName: 'Complex Transaction',
			metadata: {
				createdAt: '2024-01-01',
				updatedAt: '2024-01-02',
				createdBy: 'user123',
			},
			tags: ['tag1', 'tag2', 'tag3'],
		};

		const action = {
			type: TRANSACTION.TRANSACTION_ROW,
			payload: complexTransaction,
		};

		const newState = TransactionReducer(initialState, action);

		expect(newState.transaction_row.metadata.createdBy).toBe('user123');
		expect(newState.transaction_row.tags).toHaveLength(3);
	});
});
