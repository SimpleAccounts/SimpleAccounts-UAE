import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { PRODUCT } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
	authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Product Actions', () => {
	let store;

	beforeEach(() => {
		store = mockStore({});
		jest.clearAllMocks();
	});

	describe('getProductList', () => {
		it('should fetch product list successfully', async () => {
			const mockProducts = [
				{ id: 1, productName: 'Product A', price: 100 },
				{ id: 2, productName: 'Product B', price: 200 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockProducts,
			});

			const params = {
				name: 'Product',
				productCode: 'P001',
				pageNo: 1,
				pageSize: 10,
				order: 'asc',
				sortingCol: 'name',
				paginationDisable: false,
			};

			await store.dispatch(actions.getProductList(params));

			expect(authApi).toHaveBeenCalled();
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PRODUCT.PRODUCT_LIST,
				payload: mockProducts,
			});
		});

		it('should build URL with all parameters', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			const params = {
				name: 'Test Product',
				productCode: 'TP-001',
				vatPercentage: { value: '5' },
				pageNo: 1,
				pageSize: 15,
				paginationDisable: false,
			};

			await store.dispatch(actions.getProductList(params));

			expect(authApi).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: expect.stringContaining('name=Test Product'),
				})
			);
		});

		it('should not dispatch when paginationDisable is true', async () => {
			authApi.mockResolvedValue({ status: 200, data: [] });

			await store.dispatch(
				actions.getProductList({ paginationDisable: true })
			);

			const dispatchedActions = store.getActions();
			expect(dispatchedActions.length).toBe(0);
		});

		it('should handle fetch error', async () => {
			authApi.mockRejectedValue(new Error('Network error'));

			await expect(
				store.dispatch(actions.getProductList({}))
			).rejects.toThrow('Network error');
		});
	});

	describe('createAndSaveProduct', () => {
		it('should create and save product successfully', async () => {
			const mockProductData = {
				productName: 'New Product',
				productCode: 'NP-001',
				price: 500,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { id: 1, ...mockProductData },
			});

			const result = await store.dispatch(
				actions.createAndSaveProduct(mockProductData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'POST',
				url: '/rest/product/save',
				data: mockProductData,
			});

			expect(result.status).toBe(200);
		});

		it('should handle create product error', async () => {
			authApi.mockRejectedValue(new Error('Failed to create product'));

			await expect(
				store.dispatch(actions.createAndSaveProduct({}))
			).rejects.toThrow('Failed to create product');
		});
	});

	describe('getProductWareHouseList', () => {
		it('should fetch warehouse list successfully', async () => {
			const mockWarehouses = [
				{ id: 1, warehouseName: 'Warehouse A' },
				{ id: 2, warehouseName: 'Warehouse B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockWarehouses,
			});

			const result = await store.dispatch(actions.getProductWareHouseList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/productwarehouse/getWareHouse',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PRODUCT.PRODUCT_WHARE_HOUSE,
				payload: mockWarehouses,
			});

			expect(result.status).toBe(200);
		});

		it('should handle warehouse list error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch warehouses'));

			await expect(
				store.dispatch(actions.getProductWareHouseList())
			).rejects.toThrow('Failed to fetch warehouses');
		});
	});

	describe('getProductVatCategoryList', () => {
		it('should fetch VAT category list successfully', async () => {
			const mockVatCategories = [
				{ id: 1, name: 'Standard VAT', percentage: 5 },
				{ id: 2, name: 'Zero Rate', percentage: 0 },
				{ id: 4, name: 'Excluded Item', percentage: 0 },
				{ id: 10, name: 'Another Excluded', percentage: 0 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockVatCategories,
			});

			const result = await store.dispatch(actions.getProductVatCategoryList());

			const dispatchedActions = store.getActions();

			// Should filter out items with id 4 and 10
			expect(dispatchedActions[0].payload.length).toBe(2);
			expect(dispatchedActions[0].payload).toEqual([
				{ id: 1, name: 'Standard VAT', percentage: 5 },
				{ id: 2, name: 'Zero Rate', percentage: 0 },
			]);
		});

		it('should handle VAT category error', async () => {
			authApi.mockRejectedValue(new Error('Failed to fetch VAT categories'));

			await expect(
				store.dispatch(actions.getProductVatCategoryList())
			).rejects.toThrow('Failed to fetch VAT categories');
		});
	});

	describe('getExciseTaxList', () => {
		it('should fetch excise tax list successfully', async () => {
			const mockExciseTaxes = [
				{ id: 1, name: 'Excise A', rate: 50 },
				{ id: 2, name: 'Excise B', rate: 100 },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockExciseTaxes,
			});

			const result = await store.dispatch(actions.getExciseTaxList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/exciseTax',
			});

			expect(result.data).toEqual(mockExciseTaxes);
		});
	});

	describe('getProductCategoryList', () => {
		it('should fetch product category list successfully', async () => {
			const mockCategories = [
				{ id: 1, categoryName: 'Electronics' },
				{ id: 2, categoryName: 'Furniture' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const result = await store.dispatch(actions.getProductCategoryList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getProductCategoryList',
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PRODUCT.PRODUCT_CATEGORY,
				payload: mockCategories,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('removeBulk', () => {
		it('should remove bulk products successfully', async () => {
			const mockIds = { ids: [1, 2, 3] };

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Deleted successfully' },
			});

			const result = await store.dispatch(actions.removeBulk(mockIds));

			expect(authApi).toHaveBeenCalledWith({
				method: 'delete',
				url: '/rest/product/deletes',
				data: mockIds,
			});

			expect(result.status).toBe(200);
		});

		it('should handle bulk delete error', async () => {
			authApi.mockRejectedValue(new Error('Delete failed'));

			await expect(
				store.dispatch(actions.removeBulk({ ids: [1, 2] }))
			).rejects.toThrow('Delete failed');
		});
	});

	describe('getInventoryByProductId', () => {
		it('should fetch inventory by product ID successfully', async () => {
			const productId = 123;
			const mockInventory = [
				{ id: 1, productId: 123, quantity: 100, location: 'Warehouse A' },
				{ id: 2, productId: 123, quantity: 50, location: 'Warehouse B' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockInventory,
			});

			const result = await store.dispatch(
				actions.getInventoryByProductId(productId)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/inventory/getInventoryByProductId?id=${productId}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PRODUCT.INVENTORY_LIST,
				payload: mockInventory,
			});

			expect(result.data).toEqual(mockInventory);
		});
	});

	describe('getInventoryHistory', () => {
		it('should fetch inventory history successfully', async () => {
			const params = {
				p_id: 123,
				s_id: 456,
			};

			const mockHistory = [
				{ id: 1, action: 'Added', quantity: 10, date: '2023-12-01' },
				{ id: 2, action: 'Removed', quantity: -5, date: '2023-12-05' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockHistory,
			});

			const result = await store.dispatch(actions.getInventoryHistory(params));

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: `/rest/inventory/getInventoryHistoryByProductIdAndSupplierId?productId=${params.p_id}&supplierId=${params.s_id}`,
			});

			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainEqual({
				type: PRODUCT.INVENTORY_HISTORY_LIST,
				payload: mockHistory,
			});
		});
	});

	describe('getTransactionCategoryListForSalesProduct', () => {
		it('should fetch transaction category list for sales successfully', async () => {
			const mockCategories = [
				{ id: 1, name: 'Sales Revenue' },
				{ id: 2, name: 'Sales - Electronics' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const result = await store.dispatch(
				actions.getTransactionCategoryListForSalesProduct(1)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/product/getTransactionCategoryListForSalesProduct',
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getTransactionCategoryListForPurchaseProduct', () => {
		it('should fetch transaction category list for purchase successfully', async () => {
			const mockCategories = [
				{ id: 1, name: 'Purchase - Raw Materials' },
				{ id: 2, name: 'Purchase - Finished Goods' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockCategories,
			});

			const result = await store.dispatch(
				actions.getTransactionCategoryListForPurchaseProduct(1)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: '/rest/product/getTransactionCategoryListForPurchaseProduct',
			});

			expect(result.status).toBe(200);
		});
	});

	describe('checkValidation', () => {
		it('should check validation successfully', async () => {
			const mockValidationData = {
				name: 'Product Name',
				moduleType: 'PRODUCT',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { isValid: true },
			});

			const result = await store.dispatch(
				actions.checkValidation(mockValidationData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/validation/validate?name=${mockValidationData.name}&moduleType=${mockValidationData.moduleType}`,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('checkProductNameValidation', () => {
		it('should check product name validation successfully', async () => {
			const mockValidationData = {
				productCode: 'PROD-001',
				moduleType: 'PRODUCT',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { isValid: true },
			});

			const result = await store.dispatch(
				actions.checkProductNameValidation(mockValidationData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'get',
				url: `/rest/validation/validate?moduleType=${mockValidationData.moduleType}&productCode=${mockValidationData.productCode}`,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('updateInventory', () => {
		it('should update inventory successfully', async () => {
			const mockInventoryData = {
				id: 1,
				productId: 123,
				quantity: 150,
			};

			authApi.mockResolvedValue({
				status: 200,
				data: { message: 'Updated successfully' },
			});

			const result = await store.dispatch(
				actions.updateInventory(mockInventoryData)
			);

			expect(authApi).toHaveBeenCalledWith({
				method: 'POST',
				url: '/rest/inventory/update',
				data: mockInventoryData,
			});

			expect(result.status).toBe(200);
		});
	});

	describe('getProductCode', () => {
		it('should fetch next product code successfully', async () => {
			authApi.mockResolvedValue({
				status: 200,
				data: { nextCode: 'PROD-0010' },
			});

			const result = await store.dispatch(actions.getProductCode());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=9',
			});

			expect(result.data.nextCode).toBe('PROD-0010');
		});
	});

	describe('getCompanyDetails', () => {
		it('should fetch company details successfully', async () => {
			const mockCompanyDetails = {
				companyName: 'Test Company LLC',
				address: '123 Main Street',
			};

			authApi.mockResolvedValue({
				status: 200,
				data: mockCompanyDetails,
			});

			const result = await store.dispatch(actions.getCompanyDetails());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/company/getCompanyDetails',
			});

			expect(result.data).toEqual(mockCompanyDetails);
		});
	});

	describe('getUnitTypeList', () => {
		it('should fetch unit type list successfully', async () => {
			const mockUnitTypes = [
				{ id: 1, name: 'Pieces' },
				{ id: 2, name: 'Kilograms' },
				{ id: 3, name: 'Liters' },
			];

			authApi.mockResolvedValue({
				status: 200,
				data: mockUnitTypes,
			});

			const result = await store.dispatch(actions.getUnitTypeList());

			expect(authApi).toHaveBeenCalledWith({
				method: 'GET',
				url: '/rest/datalist/getUnitTypeList',
			});

			expect(result.data).toEqual(mockUnitTypes);
		});
	});
});
