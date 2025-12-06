import OpeningBalanceReducer from '../reducer';
import { OPENING_BALANCE } from 'constants/types';

describe('Opening Balance Reducer', () => {
	const initialState = {
		transaction_category_list: [],
		opening_balance_list: [],
	};

	it('should return the initial state', () => {
		expect(OpeningBalanceReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle OPENING_BALANCE.TRANSACTION_CATEGORY_LIST action', () => {
		const mockCategories = [
			{ id: 1, name: 'Assets', code: 'AST' },
			{ id: 2, name: 'Liabilities', code: 'LIA' },
			{ id: 3, name: 'Equity', code: 'EQT' },
		];

		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: mockCategories,
			},
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.transaction_category_list).toEqual(mockCategories);
		expect(newState.transaction_category_list).toHaveLength(3);
		expect(newState.opening_balance_list).toEqual([]);
	});

	it('should handle OPENING_BALANCE.OPENING_BALANCE_LIST action', () => {
		const mockBalances = [
			{ id: 1, categoryId: 1, balance: 10000, currency: 'AED' },
			{ id: 2, categoryId: 2, balance: 5000, currency: 'AED' },
		];

		const action = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: mockBalances,
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.opening_balance_list).toEqual(mockBalances);
		expect(newState.opening_balance_list).toHaveLength(2);
		expect(newState.transaction_category_list).toEqual([]);
	});

	it('should update transaction category list without affecting opening balance list', () => {
		const stateWithBalances = {
			transaction_category_list: [],
			opening_balance_list: [{ id: 1, balance: 1000 }],
		};

		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [{ id: 1, name: 'Assets' }],
			},
		};

		const newState = OpeningBalanceReducer(stateWithBalances, action);

		expect(newState.transaction_category_list).toHaveLength(1);
		expect(newState.opening_balance_list).toHaveLength(1);
	});

	it('should update opening balance list without affecting transaction category list', () => {
		const stateWithCategories = {
			transaction_category_list: [{ id: 1, name: 'Assets' }],
			opening_balance_list: [],
		};

		const action = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: [{ id: 1, balance: 5000 }],
		};

		const newState = OpeningBalanceReducer(stateWithCategories, action);

		expect(newState.opening_balance_list).toHaveLength(1);
		expect(newState.transaction_category_list).toHaveLength(1);
	});

	it('should handle empty transaction category list payload', () => {
		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [],
			},
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.transaction_category_list).toEqual([]);
		expect(newState.transaction_category_list).toHaveLength(0);
	});

	it('should handle empty opening balance list payload', () => {
		const action = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: [],
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.opening_balance_list).toEqual([]);
		expect(newState.opening_balance_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [{ id: 1, name: 'Assets' }],
			},
		};

		const stateBefore = { ...initialState };
		OpeningBalanceReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle unknown action types', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: { test: 'data' },
		};

		const newState = OpeningBalanceReducer(initialState, action);
		expect(newState).toEqual(initialState);
	});

	it('should maintain state immutability on updates', () => {
		const currentState = {
			transaction_category_list: [{ id: 1 }],
			opening_balance_list: [{ id: 1 }],
		};

		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [{ id: 2 }],
			},
		};

		const newState = OpeningBalanceReducer(currentState, action);

		expect(newState).not.toBe(currentState);
		expect(newState.transaction_category_list).not.toBe(currentState.transaction_category_list);
	});

	it('should handle large transaction category list', () => {
		const largeList = Array.from({ length: 100 }, (_, i) => ({
			id: i + 1,
			name: `Category ${i + 1}`,
			code: `CAT${i + 1}`,
		}));

		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: largeList,
			},
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.transaction_category_list).toHaveLength(100);
		expect(newState.transaction_category_list[0].name).toBe('Category 1');
		expect(newState.transaction_category_list[99].name).toBe('Category 100');
	});

	it('should handle opening balances with nested properties', () => {
		const mockBalances = [
			{
				id: 1,
				categoryId: 1,
				balance: 10000,
				currency: 'AED',
				metadata: {
					createdAt: '2024-01-01',
					createdBy: 'admin',
				},
			},
		];

		const action = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: mockBalances,
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.opening_balance_list[0].metadata.createdBy).toBe('admin');
		expect(newState.opening_balance_list[0].balance).toBe(10000);
	});

	it('should preserve state shape after actions', () => {
		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [{ id: 1 }],
			},
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState).toHaveProperty('transaction_category_list');
		expect(newState).toHaveProperty('opening_balance_list');
		expect(Object.keys(newState)).toHaveLength(2);
	});

	it('should handle multiple consecutive updates', () => {
		let state = initialState;

		const action1 = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [{ id: 1, name: 'Assets' }],
			},
		};

		state = OpeningBalanceReducer(state, action1);
		expect(state.transaction_category_list).toHaveLength(1);

		const action2 = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: [{ id: 1, balance: 1000 }],
		};

		state = OpeningBalanceReducer(state, action2);
		expect(state.opening_balance_list).toHaveLength(1);

		const action3 = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: [
					{ id: 1, name: 'Assets' },
					{ id: 2, name: 'Liabilities' },
					{ id: 3, name: 'Equity' },
				],
			},
		};

		state = OpeningBalanceReducer(state, action3);
		expect(state.transaction_category_list).toHaveLength(3);
	});

	it('should handle payload with data wrapper correctly', () => {
		const mockCategories = [
			{ id: 1, name: 'Test Category' },
		];

		const action = {
			type: OPENING_BALANCE.TRANSACTION_CATEGORY_LIST,
			payload: {
				data: mockCategories,
				meta: { total: 1 },
			},
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.transaction_category_list).toEqual(mockCategories);
		expect(newState.transaction_category_list).toHaveLength(1);
	});

	it('should handle opening balance with decimal values', () => {
		const mockBalances = [
			{ id: 1, balance: 1234.56, currency: 'AED' },
			{ id: 2, balance: 7890.12, currency: 'USD' },
		];

		const action = {
			type: OPENING_BALANCE.OPENING_BALANCE_LIST,
			payload: mockBalances,
		};

		const newState = OpeningBalanceReducer(initialState, action);

		expect(newState.opening_balance_list[0].balance).toBe(1234.56);
		expect(newState.opening_balance_list[1].balance).toBe(7890.12);
	});
});
