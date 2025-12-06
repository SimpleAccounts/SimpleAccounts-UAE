import InventoryReducer from '../reducer';
import { INVENTORY } from 'constants/types';

describe('Inventory Reducer', () => {
  const initialState = {
    summary_list: [],
  };

  it('should return the initial state', () => {
    expect(InventoryReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle INVENTORY.SUMMARY_LIST', () => {
    const summaryData = [
      {
        productId: 1,
        productName: 'Product A',
        stockInHand: 100,
        reOrderLevel: 20,
      },
      {
        productId: 2,
        productName: 'Product B',
        stockInHand: 50,
        reOrderLevel: 10,
      },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: summaryData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list).toEqual(summaryData);
    expect(newState.summary_list.length).toBe(2);
  });

  it('should not mutate the original state', () => {
    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: [{ productId: 1, productName: 'Test Product' }],
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState).not.toBe(initialState);
    expect(initialState.summary_list).toEqual([]);
  });

  it('should handle empty payload', () => {
    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: [],
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list).toEqual([]);
    expect(Array.isArray(newState.summary_list)).toBe(true);
  });

  it('should handle unknown action types', () => {
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: { data: 'test' },
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });

  it('should replace existing summary list data', () => {
    const stateWithData = {
      summary_list: [{ productId: 1, productName: 'Old Product' }],
    };

    const newSummaryData = [
      { productId: 2, productName: 'New Product 1' },
      { productId: 3, productName: 'New Product 2' },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: newSummaryData,
    };

    const newState = InventoryReducer(stateWithData, action);

    expect(newState.summary_list.length).toBe(2);
    expect(newState.summary_list[0].productName).toBe('New Product 1');
  });

  it('should handle complex inventory objects', () => {
    const complexInventoryData = [
      {
        productId: 1,
        productName: 'Complex Product',
        productCode: 'PROD-001',
        stockInHand: 150,
        quantityOrdered: 50,
        quantityIn: 200,
        quantityOut: 50,
        reOrderLevel: 30,
        unitPrice: 99.99,
        category: { categoryId: 1, categoryName: 'Electronics' },
        warehouse: { warehouseId: 1, warehouseName: 'Main Warehouse' },
      },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: complexInventoryData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list[0].category.categoryName).toBe('Electronics');
    expect(newState.summary_list[0].warehouse.warehouseName).toBe('Main Warehouse');
    expect(newState.summary_list[0].stockInHand).toBe(150);
  });

  it('should use Object.assign to create new array reference', () => {
    const summaryData = [{ productId: 1 }];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: summaryData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list).not.toBe(summaryData);
    expect(newState.summary_list).toEqual(summaryData);
  });

  it('should handle large inventory datasets', () => {
    const largeInventoryList = Array.from({ length: 500 }, (_, i) => ({
      productId: i + 1,
      productName: `Product ${i + 1}`,
      stockInHand: Math.floor(Math.random() * 1000),
    }));

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: largeInventoryList,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list.length).toBe(500);
    expect(newState.summary_list[499].productId).toBe(500);
  });

  it('should handle inventory with zero stock', () => {
    const zeroStockData = [
      { productId: 1, productName: 'Out of Stock', stockInHand: 0 },
      { productId: 2, productName: 'Low Stock', stockInHand: 5 },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: zeroStockData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list[0].stockInHand).toBe(0);
    expect(newState.summary_list[1].stockInHand).toBe(5);
  });

  it('should handle inventory with negative values', () => {
    const negativeStockData = [
      { productId: 1, productName: 'Negative Stock', stockInHand: -10 },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: negativeStockData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list[0].stockInHand).toBe(-10);
  });

  it('should preserve state immutability across multiple dispatches', () => {
    let state = initialState;
    const firstPayload = [{ productId: 1 }];
    const secondPayload = [{ productId: 2 }];

    state = InventoryReducer(state, {
      type: INVENTORY.SUMMARY_LIST,
      payload: firstPayload,
    });

    const intermediateState = state;

    state = InventoryReducer(state, {
      type: INVENTORY.SUMMARY_LIST,
      payload: secondPayload,
    });

    expect(intermediateState.summary_list).toEqual([{ productId: 1 }]);
    expect(state.summary_list).toEqual([{ productId: 2 }]);
  });

  it('should handle inventory items with all fields populated', () => {
    const fullInventoryData = [
      {
        productId: 1,
        productName: 'Full Product',
        productCode: 'FULL-001',
        quantityOrdered: 100,
        quantityIn: 150,
        quantityOut: 50,
        stockInHand: 100,
        reOrderLevel: 20,
        unitCost: 50.0,
        unitPrice: 75.0,
        totalValue: 5000.0,
        lastUpdated: '2024-12-01',
      },
    ];

    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: fullInventoryData,
    };

    const newState = InventoryReducer(initialState, action);

    expect(newState.summary_list[0]).toHaveProperty('productCode');
    expect(newState.summary_list[0]).toHaveProperty('quantityOrdered');
    expect(newState.summary_list[0]).toHaveProperty('totalValue');
  });

  it('should handle null or undefined in action payload gracefully', () => {
    const actionWithNull = {
      type: INVENTORY.SUMMARY_LIST,
      payload: null,
    };

    // This should not crash, Object.assign should handle it
    const newState = InventoryReducer(initialState, actionWithNull);
    expect(newState.summary_list).toBeDefined();
  });

  it('should maintain state shape integrity', () => {
    const action = {
      type: INVENTORY.SUMMARY_LIST,
      payload: [{ productId: 1 }],
    };

    const newState = InventoryReducer(initialState, action);

    expect(Object.keys(newState)).toEqual(['summary_list']);
    expect(Array.isArray(newState.summary_list)).toBe(true);
  });
});
