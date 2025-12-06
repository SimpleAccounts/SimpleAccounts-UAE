import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import { INVENTORY } from 'constants/types';
import { authApi } from 'utils';

jest.mock('utils', () => ({
  authApi: jest.fn(),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Inventory Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getProductInventoryList', () => {
    it('should dispatch SUMMARY_LIST action on successful API call', async () => {
      const mockResponse = {
        data: [
          { productId: 1, productName: 'Product A', stockInHand: 100 },
          { productId: 2, productName: 'Product B', stockInHand: 50 },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const obj = { pageNo: 1, pageSize: 10 };
      await store.dispatch(actions.getProductInventoryList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(1);
      expect(dispatchedActions[0]).toEqual({
        type: INVENTORY.SUMMARY_LIST,
        payload: mockResponse.data,
      });
    });

    it('should call authApi with correct parameters', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {
        pageNo: 1,
        pageSize: 20,
        order: 'desc',
        sortingCol: 'productName',
      };

      await store.dispatch(actions.getProductInventoryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/rest/inventory/getInventoryProductList'),
      });
      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=1&pageSize=20&order=desc&sortingCol=productName'),
      });
    });

    it('should not dispatch action when paginationDisable is true', async () => {
      const mockResponse = { data: [] };
      authApi.mockResolvedValue(mockResponse);

      const obj = { paginationDisable: true };
      await store.dispatch(actions.getProductInventoryList(obj));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      authApi.mockRejectedValue(error);

      const obj = { pageNo: 1, pageSize: 10 };

      await expect(store.dispatch(actions.getProductInventoryList(obj))).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle empty parameters object', async () => {
      authApi.mockResolvedValue({ data: [] });

      const obj = {};
      await store.dispatch(actions.getProductInventoryList(obj));

      expect(authApi).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('pageNo=&pageSize=&order=&sortingCol='),
      });
    });
  });

  describe('getAllProductCount', () => {
    it('should fetch product count successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { count: 150 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getAllProductCount());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getProductCountForInventory',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle product count API error', async () => {
      const error = new Error('Count fetch failed');
      authApi.mockRejectedValue(error);

      await expect(store.dispatch(actions.getAllProductCount())).rejects.toThrow(
        'Count fetch failed'
      );
    });

    it('should not dispatch any actions', async () => {
      authApi.mockResolvedValue({ status: 200, data: {} });

      await store.dispatch(actions.getAllProductCount());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions).toHaveLength(0);
    });
  });

  describe('getTotalInventoryValue', () => {
    it('should fetch total inventory value successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { totalValue: 250000.0 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTotalInventoryValue());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getTotalInventoryValue',
      });
      expect(result.data.totalValue).toBe(250000.0);
    });

    it('should handle errors when fetching inventory value', async () => {
      authApi.mockRejectedValue(new Error('Value fetch failed'));

      await expect(store.dispatch(actions.getTotalInventoryValue())).rejects.toThrow(
        'Value fetch failed'
      );
    });
  });

  describe('getQuantityAvailable', () => {
    it('should fetch total stock on hand successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { totalStock: 5000 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getQuantityAvailable());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getTotalStockOnHand',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('getOutOfStockCountOfInventory', () => {
    it('should fetch out of stock count successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { outOfStockCount: 25 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getOutOfStockCountOfInventory());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getOutOfStockCountOfInventory',
      });
      expect(result.data.outOfStockCount).toBe(25);
    });

    it('should handle out of stock fetch errors', async () => {
      authApi.mockRejectedValue(new Error('Fetch failed'));

      await expect(store.dispatch(actions.getOutOfStockCountOfInventory())).rejects.toThrow(
        'Fetch failed'
      );
    });
  });

  describe('getTopSellingProductsForInventory', () => {
    it('should fetch top selling products successfully', async () => {
      const mockResponse = {
        status: 200,
        data: [
          { productId: 1, productName: 'Bestseller 1', salesCount: 1000 },
          { productId: 2, productName: 'Bestseller 2', salesCount: 800 },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTopSellingProductsForInventory());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getTopSellingProductsForInventory',
      });
      expect(result.data.length).toBe(2);
    });
  });

  describe('getLowSellingProductsForInventory', () => {
    it('should fetch low selling products successfully', async () => {
      const mockResponse = {
        status: 200,
        data: [
          { productId: 3, productName: 'Slow Mover 1', salesCount: 10 },
          { productId: 4, productName: 'Slow Mover 2', salesCount: 5 },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getLowSellingProductsForInventory());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getLowSellingProductsForInventory',
      });
      expect(result.status).toBe(200);
    });
  });

  describe('getTopProfitGeneratingProductsForInventory', () => {
    it('should fetch top profit generating products successfully', async () => {
      const mockResponse = {
        status: 200,
        data: [
          { productId: 1, productName: 'High Profit Product', profit: 5000 },
          { productId: 2, productName: 'Medium Profit Product', profit: 3000 },
        ],
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTopProfitGeneratingProductsForInventory());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getTopProfitGeneratingProductsForInventory',
      });
      expect(result.data[0].profit).toBe(5000);
    });

    it('should handle errors in profit products fetch', async () => {
      authApi.mockRejectedValue(new Error('Profit fetch error'));

      await expect(
        store.dispatch(actions.getTopProfitGeneratingProductsForInventory())
      ).rejects.toThrow('Profit fetch error');
    });
  });

  describe('getTotalRevenueOfInventory', () => {
    it('should fetch total revenue successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { totalRevenue: 500000.0 },
      };

      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTotalRevenueOfInventory());

      expect(authApi).toHaveBeenCalledWith({
        method: 'get',
        url: '/rest/inventory/getTotalRevenueOfInventory',
      });
      expect(result.data.totalRevenue).toBe(500000.0);
    });

    it('should handle revenue fetch errors', async () => {
      authApi.mockRejectedValue(new Error('Revenue fetch failed'));

      await expect(store.dispatch(actions.getTotalRevenueOfInventory())).rejects.toThrow(
        'Revenue fetch failed'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for all actions', async () => {
      const networkError = new Error('Network error');
      authApi.mockRejectedValue(networkError);

      await expect(store.dispatch(actions.getAllProductCount())).rejects.toThrow('Network error');
      await expect(store.dispatch(actions.getTotalInventoryValue())).rejects.toThrow(
        'Network error'
      );
      await expect(store.dispatch(actions.getQuantityAvailable())).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle 500 server errors', async () => {
      const serverError = new Error('Internal server error');
      authApi.mockRejectedValue(serverError);

      await expect(store.dispatch(actions.getProductInventoryList({}))).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('Return Values', () => {
    it('should return response from getProductInventoryList', async () => {
      const mockResponse = { data: [], status: 200 };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getProductInventoryList({}));
      expect(result).toEqual(mockResponse);
    });

    it('should return response from getTotalInventoryValue', async () => {
      const mockResponse = { data: { totalValue: 100000 }, status: 200 };
      authApi.mockResolvedValue(mockResponse);

      const result = await store.dispatch(actions.getTotalInventoryValue());
      expect(result).toEqual(mockResponse);
    });
  });
});
