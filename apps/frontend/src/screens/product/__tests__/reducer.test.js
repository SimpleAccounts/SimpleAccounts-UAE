import ProductReducer from '../reducer';
import { PRODUCT } from 'constants/types';

describe('ProductReducer', () => {
	const initialState = {
		product_list: [],
		vat_list: [],
		product_warehouse_list: [],
		product_category_list: [],
		inventory_account_list: [],
		inventory_list: [],
		inventory_history_list: [],
	};

	it('should return the initial state', () => {
		expect(ProductReducer(undefined, {})).toEqual(initialState);
	});

	it('should handle PRODUCT.PRODUCT_LIST', () => {
		const mockProducts = [
			{ id: 1, productName: 'Product A', price: 100, stock: 50 },
			{ id: 2, productName: 'Product B', price: 200, stock: 30 },
		];

		const action = {
			type: PRODUCT.PRODUCT_LIST,
			payload: mockProducts,
		};

		const expectedState = {
			...initialState,
			product_list: mockProducts,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.PRODUCT_VAT_CATEGORY', () => {
		const mockVatList = [
			{ id: 1, name: 'Standard VAT', percentage: 5 },
			{ id: 2, name: 'Zero Rated', percentage: 0 },
			{ id: 3, name: 'Exempt', percentage: 0 },
		];

		const action = {
			type: PRODUCT.PRODUCT_VAT_CATEGORY,
			payload: mockVatList,
		};

		const expectedState = {
			...initialState,
			vat_list: mockVatList,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.PRODUCT_WHARE_HOUSE', () => {
		const mockWarehouses = [
			{ id: 1, warehouseName: 'Warehouse A', location: 'Dubai' },
			{ id: 2, warehouseName: 'Warehouse B', location: 'Abu Dhabi' },
		];

		const action = {
			type: PRODUCT.PRODUCT_WHARE_HOUSE,
			payload: mockWarehouses,
		};

		const expectedState = {
			...initialState,
			product_warehouse_list: mockWarehouses,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.PRODUCT_CATEGORY', () => {
		const mockCategories = [
			{ id: 1, categoryName: 'Electronics', description: 'Electronic items' },
			{ id: 2, categoryName: 'Furniture', description: 'Office furniture' },
		];

		const action = {
			type: PRODUCT.PRODUCT_CATEGORY,
			payload: mockCategories,
		};

		const expectedState = {
			...initialState,
			product_category_list: mockCategories,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.INVENTORY_ACCOUNT_LIST', () => {
		const mockInventoryAccounts = [
			{ id: 1, accountName: 'Inventory Account A', balance: 50000 },
			{ id: 2, accountName: 'Inventory Account B', balance: 30000 },
		];

		const action = {
			type: PRODUCT.INVENTORY_ACCOUNT_LIST,
			payload: mockInventoryAccounts,
		};

		const expectedState = {
			...initialState,
			inventory_account_list: mockInventoryAccounts,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.INVENTORY_LIST', () => {
		const mockInventory = [
			{ id: 1, productId: 1, quantity: 100, location: 'Warehouse A' },
			{ id: 2, productId: 2, quantity: 50, location: 'Warehouse B' },
		];

		const action = {
			type: PRODUCT.INVENTORY_LIST,
			payload: mockInventory,
		};

		const expectedState = {
			...initialState,
			inventory_list: mockInventory,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle PRODUCT.INVENTORY_HISTORY_LIST', () => {
		const mockInventoryHistory = [
			{
				id: 1,
				productId: 1,
				quantity: 10,
				action: 'Added',
				date: '2023-12-01',
			},
			{
				id: 2,
				productId: 1,
				quantity: -5,
				action: 'Removed',
				date: '2023-12-05',
			},
		];

		const action = {
			type: PRODUCT.INVENTORY_HISTORY_LIST,
			payload: mockInventoryHistory,
		};

		const expectedState = {
			...initialState,
			inventory_history_list: mockInventoryHistory,
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should handle unknown action type', () => {
		const action = {
			type: 'UNKNOWN_ACTION',
			payload: 'some data',
		};

		expect(ProductReducer(initialState, action)).toEqual(initialState);
	});

	it('should not mutate state', () => {
		const mockProducts = [{ id: 1, productName: 'Product A' }];
		const action = {
			type: PRODUCT.PRODUCT_LIST,
			payload: mockProducts,
		};

		const stateBefore = { ...initialState };
		ProductReducer(initialState, action);

		expect(initialState).toEqual(stateBefore);
	});

	it('should handle multiple actions in sequence', () => {
		const products = [{ id: 1, productName: 'Product A' }];
		const warehouses = [{ id: 1, warehouseName: 'Warehouse A' }];
		const categories = [{ id: 1, categoryName: 'Category A' }];

		let state = ProductReducer(initialState, {
			type: PRODUCT.PRODUCT_LIST,
			payload: products,
		});

		state = ProductReducer(state, {
			type: PRODUCT.PRODUCT_WHARE_HOUSE,
			payload: warehouses,
		});

		state = ProductReducer(state, {
			type: PRODUCT.PRODUCT_CATEGORY,
			payload: categories,
		});

		expect(state.product_list).toEqual(products);
		expect(state.product_warehouse_list).toEqual(warehouses);
		expect(state.product_category_list).toEqual(categories);
	});

	it('should override previous data when same action is dispatched', () => {
		const firstProducts = [{ id: 1, productName: 'Product A' }];
		const secondProducts = [
			{ id: 2, productName: 'Product B' },
			{ id: 3, productName: 'Product C' },
		];

		let state = ProductReducer(initialState, {
			type: PRODUCT.PRODUCT_LIST,
			payload: firstProducts,
		});

		state = ProductReducer(state, {
			type: PRODUCT.PRODUCT_LIST,
			payload: secondProducts,
		});

		expect(state.product_list).toEqual(secondProducts);
		expect(state.product_list.length).toBe(2);
	});

	it('should handle empty arrays', () => {
		const action = {
			type: PRODUCT.PRODUCT_LIST,
			payload: [],
		};

		const expectedState = {
			...initialState,
			product_list: [],
		};

		expect(ProductReducer(initialState, action)).toEqual(expectedState);
	});

	it('should maintain other state properties when updating one', () => {
		const stateWithData = {
			...initialState,
			product_list: [{ id: 1, productName: 'Existing Product' }],
			vat_list: [{ id: 1, name: 'Existing VAT' }],
		};

		const newWarehouses = [{ id: 1, warehouseName: 'New Warehouse' }];

		const state = ProductReducer(stateWithData, {
			type: PRODUCT.PRODUCT_WHARE_HOUSE,
			payload: newWarehouses,
		});

		expect(state.product_list).toEqual(stateWithData.product_list);
		expect(state.vat_list).toEqual(stateWithData.vat_list);
		expect(state.product_warehouse_list).toEqual(newWarehouses);
	});

	it('should handle complex nested data in inventory history', () => {
		const complexInventoryHistory = [
			{
				id: 1,
				productId: 1,
				changes: {
					before: { quantity: 100, price: 50 },
					after: { quantity: 110, price: 55 },
				},
				metadata: {
					user: 'admin',
					timestamp: '2023-12-01T10:00:00Z',
				},
			},
		];

		const action = {
			type: PRODUCT.INVENTORY_HISTORY_LIST,
			payload: complexInventoryHistory,
		};

		const state = ProductReducer(initialState, action);

		expect(state.inventory_history_list).toEqual(complexInventoryHistory);
		expect(state.inventory_history_list[0].changes.after.quantity).toBe(110);
	});

	it('should handle large product lists efficiently', () => {
		const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
			id: i + 1,
			productName: `Product ${i + 1}`,
			price: Math.random() * 1000,
		}));

		const action = {
			type: PRODUCT.PRODUCT_LIST,
			payload: largeProductList,
		};

		const state = ProductReducer(initialState, action);

		expect(state.product_list.length).toBe(1000);
		expect(state.product_list[999].id).toBe(1000);
	});
});
