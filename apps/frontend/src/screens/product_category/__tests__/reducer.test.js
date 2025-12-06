import VatReducer from '../reducer';
import { PRODUCT_CATEGORY } from 'constants/types';

describe('Product Category Reducer', () => {
	const initialState = {
		product_category_list: [],
	};

	it('should return the initial state', () => {
		expect(VatReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PRODUCT_CATEGORY_LIST action', () => {
		const payload = [
			{ id: 1, categoryCode: 'CAT-001', categoryName: 'Electronics', description: 'Electronic items' },
			{ id: 2, categoryCode: 'CAT-002', categoryName: 'Furniture', description: 'Furniture items' },
			{ id: 3, categoryCode: 'CAT-003', categoryName: 'Office Supplies', description: 'Office items' },
		];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).toEqual(payload);
		expect(newState.product_category_list).toHaveLength(3);
	});

	it('should handle PRODUCT_CATEGORY_LIST with empty array', () => {
		const payload = [];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).toEqual([]);
		expect(newState.product_category_list).toHaveLength(0);
	});

	it('should not mutate the original state', () => {
		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [{ id: 1, categoryName: 'Test Category' }],
		};

		const stateBefore = { ...initialState };
		VatReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple sequential PRODUCT_CATEGORY_LIST actions', () => {
		const action1 = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [{ id: 1, categoryName: 'Category 1' }],
		};

		const action2 = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [
				{ id: 2, categoryName: 'Category 2' },
				{ id: 3, categoryName: 'Category 3' },
			],
		};

		let state = VatReducer(initialState, action1);
		expect(state.product_category_list).toHaveLength(1);

		state = VatReducer(state, action2);
		expect(state.product_category_list).toHaveLength(2);
		expect(state.product_category_list[0].id).toBe(2);
	});

	it('should replace existing product_category_list on new action', () => {
		const stateWithData = {
			product_category_list: [
				{ id: 1, categoryName: 'Old Category 1' },
				{ id: 2, categoryName: 'Old Category 2' },
			],
		};

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [{ id: 3, categoryName: 'New Category' }],
		};

		const newState = VatReducer(stateWithData, action);

		expect(newState.product_category_list).toHaveLength(1);
		expect(newState.product_category_list[0].id).toBe(3);
	});

	it('should handle PRODUCT_CATEGORY_LIST with complex category data', () => {
		const payload = [
			{
				id: 1,
				categoryCode: 'COMP-001',
				categoryName: 'Complex Category',
				description: 'A complex category',
				isActive: true,
				parentCategoryId: null,
				createdDate: '2024-09-25',
				modifiedDate: '2024-09-25',
			},
		];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list[0]).toHaveProperty('categoryCode', 'COMP-001');
		expect(newState.product_category_list[0]).toHaveProperty('isActive', true);
		expect(newState.product_category_list[0]).toHaveProperty('description', 'A complex category');
	});

	it('should handle PRODUCT_CATEGORY_LIST with null values in payload', () => {
		const payload = [
			{
				id: 1,
				categoryCode: 'CAT-001',
				categoryName: 'Category with nulls',
				description: null,
				parentCategoryId: null,
			},
		];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).toHaveLength(1);
		expect(newState.product_category_list[0].description).toBeNull();
	});

	it('should return current state for unknown action types', () => {
		const action = {
			type: 'UNKNOWN_PRODUCT_CATEGORY_ACTION',
			payload: { test: 'data' },
		};

		const newState = VatReducer(initialState, action);

		expect(newState).toEqual(initialState);
	});

	it('should maintain state structure when handling unknown actions', () => {
		const stateWithData = {
			product_category_list: [{ id: 1, categoryName: 'Existing Category' }],
		};

		const action = {
			type: 'UNKNOWN_ACTION',
			payload: {},
		};

		const newState = VatReducer(stateWithData, action);

		expect(newState).toEqual(stateWithData);
		expect(newState.product_category_list).toHaveLength(1);
	});

	it('should handle PRODUCT_CATEGORY_LIST with large dataset', () => {
		const payload = Array.from({ length: 500 }, (_, i) => ({
			id: i + 1,
			categoryCode: `CAT-${String(i + 1).padStart(4, '0')}`,
			categoryName: `Category ${i + 1}`,
			description: `Description for category ${i + 1}`,
		}));

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).toHaveLength(500);
		expect(newState.product_category_list[0].id).toBe(1);
		expect(newState.product_category_list[499].id).toBe(500);
	});

	it('should create new array reference for product_category_list', () => {
		const payload = [{ id: 1, categoryName: 'Test' }];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).not.toBe(payload);
		expect(newState.product_category_list).toEqual(payload);
	});

	it('should handle PRODUCT_CATEGORY_LIST with duplicate category IDs', () => {
		const payload = [
			{ id: 1, categoryName: 'Category A' },
			{ id: 1, categoryName: 'Category A Duplicate' },
			{ id: 2, categoryName: 'Category B' },
		];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list).toHaveLength(3);
	});

	it('should handle state with undefined properties gracefully', () => {
		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [{ id: 1 }],
		};

		const newState = VatReducer(undefined, action);

		expect(newState).toHaveProperty('product_category_list');
		expect(newState.product_category_list).toHaveLength(1);
	});

	it('should preserve state spread operation behavior', () => {
		const existingState = {
			product_category_list: [{ id: 1, categoryName: 'Old' }],
			additionalProperty: 'should not exist',
		};

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload: [{ id: 2, categoryName: 'New' }],
		};

		const newState = VatReducer(existingState, action);

		expect(newState.product_category_list).toHaveLength(1);
		expect(newState.product_category_list[0].id).toBe(2);
	});

	it('should handle nested category structures', () => {
		const payload = [
			{
				id: 1,
				categoryName: 'Parent Category',
				children: [
					{ id: 2, categoryName: 'Child 1' },
					{ id: 3, categoryName: 'Child 2' },
				],
			},
		];

		const action = {
			type: PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST,
			payload,
		};

		const newState = VatReducer(initialState, action);

		expect(newState.product_category_list[0]).toHaveProperty('children');
		expect(newState.product_category_list[0].children).toHaveLength(2);
	});
});
