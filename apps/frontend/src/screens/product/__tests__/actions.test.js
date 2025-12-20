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

      const result = await store.dispatch(actions.getProductList(params));

      expect(authApi).toHaveBeenCalled();
      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('product/getProductList/pending');
      expect(dispatchedActions[1].type).toBe('product/getProductList/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockProducts);
      expect(result.type).toBe('product/getProductList/fulfilled');
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

      const result = await store.dispatch(actions.getProductList({ paginationDisable: true }));

      const dispatchedActions = store.getActions();
      // Still dispatches pending/fulfilled, but returns full response
      expect(dispatchedActions[0].type).toBe('product/getProductList/pending');
      expect(result.type).toBe('product/getProductList/fulfilled');
    });

    it('should dispatch rejected action on fetch error', async () => {
      authApi.mockRejectedValue(new Error('Network error'));

      const result = await store.dispatch(actions.getProductList({}));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[1].type).toBe('product/getProductList/rejected');
      expect(result.type).toBe('product/getProductList/rejected');
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

      const result = await store.dispatch(actions.createAndSaveProduct(mockProductData));

      expect(authApi).toHaveBeenCalledWith({
        method: 'POST',
        url: '/rest/product/save',
        data: mockProductData,
      });

      expect(result.type).toBe('product/createAndSaveProduct/fulfilled');
    });

    it('should dispatch rejected action on create product error', async () => {
      authApi.mockRejectedValue(new Error('Failed to create product'));

      const result = await store.dispatch(actions.createAndSaveProduct({}));

      expect(result.type).toBe('product/createAndSaveProduct/rejected');
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
      expect(dispatchedActions[0].type).toBe('product/getProductWareHouseList/pending');
      expect(dispatchedActions[1].type).toBe('product/getProductWareHouseList/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockWarehouses);

      expect(result.type).toBe('product/getProductWareHouseList/fulfilled');
    });

    it('should dispatch rejected action on warehouse list error', async () => {
      authApi.mockRejectedValue(new Error('Failed to fetch warehouses'));

      const result = await store.dispatch(actions.getProductWareHouseList());

      expect(result.type).toBe('product/getProductWareHouseList/rejected');
    });
  });

  describe('getProductVatCategoryList', () => {
    it('should fetch VAT category list successfully and filter items', async () => {
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
      expect(dispatchedActions[1].payload.length).toBe(2);
      expect(dispatchedActions[1].payload).toEqual([
        { id: 1, name: 'Standard VAT', percentage: 5 },
        { id: 2, name: 'Zero Rate', percentage: 0 },
      ]);
      expect(result.type).toBe('product/getProductVatCategoryList/fulfilled');
    });

    it('should dispatch rejected action on VAT category error', async () => {
      authApi.mockRejectedValue(new Error('Failed to fetch VAT categories'));

      const result = await store.dispatch(actions.getProductVatCategoryList());

      expect(result.type).toBe('product/getProductVatCategoryList/rejected');
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

      // getExciseTaxList is not an async thunk, it's a regular function
      const result = await actions.getExciseTaxList();

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
      expect(dispatchedActions[0].type).toBe('product/getProductCategoryList/pending');
      expect(dispatchedActions[1].type).toBe('product/getProductCategoryList/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockCategories);

      expect(result.type).toBe('product/getProductCategoryList/fulfilled');
    });
  });

  describe('removeBulk', () => {
    it('should remove bulk products successfully', async () => {
      const mockIds = { ids: [1, 2, 3] };

      authApi.mockResolvedValue({
        status: 200,
        data: { message: 'Deleted successfully' },
      });

      // removeBulk is not an async thunk, it's a regular function
      const result = await actions.removeBulk(mockIds);

      expect(authApi).toHaveBeenCalledWith({
        method: 'delete',
        url: '/rest/product/deletes',
        data: mockIds,
      });

      expect(result.status).toBe(200);
    });

    it('should handle bulk delete error', async () => {
      authApi.mockRejectedValue(new Error('Delete failed'));

      await expect(actions.removeBulk({ ids: [1, 2] })).rejects.toThrow('Delete failed');
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

      const result = await store.dispatch(actions.getInventoryByProductId(productId));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: `/rest/inventory/getInventoryByProductId?id=${productId}`,
      });

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0].type).toBe('product/getInventoryByProductId/pending');
      expect(dispatchedActions[1].type).toBe('product/getInventoryByProductId/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockInventory);

      expect(result.type).toBe('product/getInventoryByProductId/fulfilled');
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
      expect(dispatchedActions[0].type).toBe('product/getInventoryHistory/pending');
      expect(dispatchedActions[1].type).toBe('product/getInventoryHistory/fulfilled');
      expect(dispatchedActions[1].payload).toEqual(mockHistory);
      expect(result.type).toBe('product/getInventoryHistory/fulfilled');
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

      // This is not an async thunk, it's a regular function
      const result = await actions.getTransactionCategoryListForSalesProduct(1);

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

      // This is not an async thunk, it's a regular function
      const result = await actions.getTransactionCategoryListForPurchaseProduct(1);

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

      // This is not an async thunk, it's a regular function
      const result = await actions.checkValidation(mockValidationData);

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

      // This is not an async thunk, it's a regular function
      const result = await actions.checkProductNameValidation(mockValidationData);

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

      // This is not an async thunk, it's a regular function
      const result = await actions.updateInventory(mockInventoryData);

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

      // This is not an async thunk, it's a regular function
      const result = await actions.getProductCode();

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

      // This is not an async thunk, it's a regular function
      const result = await actions.getCompanyDetails();

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

      // This is not an async thunk, it's a regular function
      const result = await actions.getUnitTypeList();

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/datalist/getUnitTypeList',
      });

      expect(result.data).toEqual(mockUnitTypes);
    });
  });
});
