import ChartAccountReducer from '../reducer';
import { CHART_ACCOUNT } from 'constants/types';

describe('ChartAccountReducer', () => {
	const initialState = {
		transaction_type_list: [],
		sub_transaction_type_list: [],
		transaction_category_list: [],
	};

	it('should return the initial state', () => {
		expect(ChartAccountReducer(undefined, {})).toEqual(initialState);
	});

	describe('TRANSACTION_CATEGORY_LIST', () => {
		it('should handle TRANSACTION_CATEGORY_LIST action', () => {
			const mockCategories = [
				{
					id: 1,
					transactionCategoryCode: 'CAT001',
					transactionCategoryName: 'Sales Revenue',
					chartOfAccountId: 1,
				},
				{
					id: 2,
					transactionCategoryCode: 'CAT002',
					transactionCategoryName: 'Operating Expenses',
					chartOfAccountId: 2,
				},
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: mockCategories,
			};

			const expectedState = {
				...initialState,
				transaction_category_list: mockCategories,
			};

			expect(ChartAccountReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing transaction category list', () => {
			const existingState = {
				...initialState,
				transaction_category_list: [{ id: 99, transactionCategoryCode: 'OLD' }],
			};

			const newCategories = [
				{ id: 1, transactionCategoryCode: 'NEW001' },
				{ id: 2, transactionCategoryCode: 'NEW002' },
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: newCategories,
			};

			const newState = ChartAccountReducer(existingState, action);
			expect(newState.transaction_category_list).toEqual(newCategories);
			expect(newState.transaction_category_list).toHaveLength(2);
		});

		it('should handle empty transaction category list', () => {
			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: [],
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.transaction_category_list).toEqual([]);
		});

		it('should handle transaction categories with pagination', () => {
			const mockData = {
				data: [
					{ id: 1, transactionCategoryName: 'Category 1' },
					{ id: 2, transactionCategoryName: 'Category 2' },
				],
				totalRecords: 2,
				pageNo: 1,
			};

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: mockData,
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.transaction_category_list).toEqual(mockData);
		});
	});

	describe('TRANSACTION_TYPES', () => {
		it('should handle TRANSACTION_TYPES action', () => {
			const mockTypes = [
				{ id: 1, typeName: 'Asset', typeCode: 'AST' },
				{ id: 2, typeName: 'Liability', typeCode: 'LIA' },
				{ id: 3, typeName: 'Equity', typeCode: 'EQU' },
				{ id: 4, typeName: 'Revenue', typeCode: 'REV' },
				{ id: 5, typeName: 'Expense', typeCode: 'EXP' },
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload: mockTypes,
			};

			const expectedState = {
				...initialState,
				transaction_type_list: mockTypes,
			};

			expect(ChartAccountReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing transaction types', () => {
			const existingState = {
				...initialState,
				transaction_type_list: [{ id: 99, typeName: 'Old Type' }],
			};

			const newTypes = [
				{ id: 1, typeName: 'New Type 1' },
				{ id: 2, typeName: 'New Type 2' },
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload: newTypes,
			};

			const newState = ChartAccountReducer(existingState, action);
			expect(newState.transaction_type_list).toEqual(newTypes);
		});

		it('should handle empty transaction types list', () => {
			const action = {
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload: [],
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.transaction_type_list).toEqual([]);
		});
	});

	describe('SUB_TRANSACTION_TYPES', () => {
		it('should handle SUB_TRANSACTION_TYPES action', () => {
			const mockSubTypes = [
				{ id: 1, subTypeName: 'Current Asset', parentType: 'Asset' },
				{ id: 2, subTypeName: 'Fixed Asset', parentType: 'Asset' },
				{ id: 3, subTypeName: 'Current Liability', parentType: 'Liability' },
			];

			const action = {
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: mockSubTypes,
			};

			const expectedState = {
				...initialState,
				sub_transaction_type_list: mockSubTypes,
			};

			expect(ChartAccountReducer(initialState, action)).toEqual(expectedState);
		});

		it('should replace existing sub transaction types', () => {
			const existingState = {
				...initialState,
				sub_transaction_type_list: [{ id: 99, subTypeName: 'Old SubType' }],
			};

			const newSubTypes = [
				{ id: 1, subTypeName: 'New SubType 1' },
				{ id: 2, subTypeName: 'New SubType 2' },
			];

			const action = {
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: newSubTypes,
			};

			const newState = ChartAccountReducer(existingState, action);
			expect(newState.sub_transaction_type_list).toEqual(newSubTypes);
		});

		it('should handle empty sub transaction types list', () => {
			const action = {
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: [],
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.sub_transaction_type_list).toEqual([]);
		});
	});

	describe('default case', () => {
		it('should return current state for unknown action', () => {
			const action = {
				type: 'UNKNOWN_ACTION',
				payload: { data: 'test' },
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState).toEqual(initialState);
		});

		it('should preserve state for undefined action type', () => {
			const currentState = {
				...initialState,
				transaction_type_list: [{ id: 1, typeName: 'Asset' }],
			};

			const action = {
				type: 'RANDOM_TYPE',
				payload: [],
			};

			const newState = ChartAccountReducer(currentState, action);
			expect(newState).toEqual(currentState);
		});
	});

	describe('state immutability', () => {
		it('should not mutate the original state', () => {
			const originalState = { ...initialState };
			const payload = [{ id: 1, transactionCategoryName: 'Test Category' }];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload,
			};

			ChartAccountReducer(originalState, action);
			expect(originalState.transaction_category_list).toEqual([]);
		});

		it('should preserve other state properties when updating transaction_category_list', () => {
			const stateWithData = {
				...initialState,
				transaction_category_list: [{ id: 1 }],
				transaction_type_list: [{ id: 2 }],
				sub_transaction_type_list: [{ id: 3 }],
			};

			const payload = [{ id: 99 }];
			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload,
			};

			const newState = ChartAccountReducer(stateWithData, action);
			expect(newState.transaction_category_list).toEqual([{ id: 99 }]);
			expect(newState.transaction_type_list).toEqual([{ id: 2 }]);
			expect(newState.sub_transaction_type_list).toEqual([{ id: 3 }]);
		});

		it('should preserve other state properties when updating transaction_type_list', () => {
			const stateWithData = {
				...initialState,
				transaction_category_list: [{ id: 1 }],
				transaction_type_list: [{ id: 2 }],
				sub_transaction_type_list: [{ id: 3 }],
			};

			const payload = [{ id: 88 }];
			const action = {
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload,
			};

			const newState = ChartAccountReducer(stateWithData, action);
			expect(newState.transaction_type_list).toEqual([{ id: 88 }]);
			expect(newState.transaction_category_list).toEqual([{ id: 1 }]);
			expect(newState.sub_transaction_type_list).toEqual([{ id: 3 }]);
		});

		it('should preserve other state properties when updating sub_transaction_type_list', () => {
			const stateWithData = {
				...initialState,
				transaction_category_list: [{ id: 1 }],
				transaction_type_list: [{ id: 2 }],
				sub_transaction_type_list: [{ id: 3 }],
			};

			const payload = [{ id: 77 }];
			const action = {
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload,
			};

			const newState = ChartAccountReducer(stateWithData, action);
			expect(newState.sub_transaction_type_list).toEqual([{ id: 77 }]);
			expect(newState.transaction_category_list).toEqual([{ id: 1 }]);
			expect(newState.transaction_type_list).toEqual([{ id: 2 }]);
		});
	});

	describe('complex chart of accounts scenarios', () => {
		it('should handle transaction categories with complete details', () => {
			const complexCategories = [
				{
					transactionCategoryId: 1,
					transactionCategoryCode: 'REV-001',
					transactionCategoryName: 'Product Sales',
					transactionCategoryDescription: 'Revenue from product sales',
					chartOfAccountId: 101,
					accountType: 'Revenue',
					isActive: true,
					createdDate: '2023-01-01',
				},
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_CATEGORY_LIST,
				payload: complexCategories,
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.transaction_category_list[0]).toHaveProperty(
				'transactionCategoryCode',
				'REV-001'
			);
			expect(newState.transaction_category_list[0]).toHaveProperty('isActive', true);
		});

		it('should handle all account types correctly', () => {
			const allAccountTypes = [
				{ id: 1, typeName: 'Asset', description: 'Resources owned' },
				{ id: 2, typeName: 'Liability', description: 'Obligations owed' },
				{ id: 3, typeName: 'Equity', description: 'Owner\'s stake' },
				{ id: 4, typeName: 'Revenue', description: 'Income earned' },
				{ id: 5, typeName: 'Expense', description: 'Costs incurred' },
			];

			const action = {
				type: CHART_ACCOUNT.TRANSACTION_TYPES,
				payload: allAccountTypes,
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.transaction_type_list).toHaveLength(5);
			expect(newState.transaction_type_list.map(t => t.typeName)).toEqual([
				'Asset',
				'Liability',
				'Equity',
				'Revenue',
				'Expense',
			]);
		});

		it('should handle hierarchical sub-account types', () => {
			const hierarchicalSubTypes = [
				{
					id: 1,
					subTypeName: 'Current Asset',
					parentType: 'Asset',
					level: 1,
					accounts: ['Cash', 'Accounts Receivable'],
				},
				{
					id: 2,
					subTypeName: 'Fixed Asset',
					parentType: 'Asset',
					level: 1,
					accounts: ['Equipment', 'Buildings'],
				},
			];

			const action = {
				type: CHART_ACCOUNT.SUB_TRANSACTION_TYPES,
				payload: hierarchicalSubTypes,
			};

			const newState = ChartAccountReducer(initialState, action);
			expect(newState.sub_transaction_type_list).toHaveLength(2);
			expect(newState.sub_transaction_type_list[0].accounts).toContain('Cash');
		});
	});
});
