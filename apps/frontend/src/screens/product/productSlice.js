import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from 'utils';
import { PRODUCT } from 'constants/types';

// ============ Async Thunks ============

export const getProductList = createAsyncThunk(
  'product/getProductList',
  async (obj, { rejectWithValue }) => {
    try {
      const name = obj.name || '';
      const productCode = obj.productCode || '';
      const vatPercentage = obj.vatPercentage?.value || '';
      const pageNo = obj.pageNo || '';
      const pageSize = obj.pageSize || '';
      const order = obj.order || '';
      const sortingCol = obj.sortingCol || '';
      const paginationDisable = obj.paginationDisable || false;

      const data = {
        method: 'GET',
        url: `/rest/product/getList?name=${name}&productCode=${productCode}&vatPercentage=${vatPercentage}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
      };
      const res = await authApi(data);
      if (!obj.paginationDisable) {
        return res.data;
      }
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createAndSaveProduct = createAsyncThunk(
  'product/createAndSaveProduct',
  async (product, { rejectWithValue }) => {
    try {
      const data = {
        method: 'POST',
        url: '/rest/product/save',
        data: product,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProductWareHouseList = createAsyncThunk(
  'product/getProductWareHouseList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/productwarehouse/getWareHouse',
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProductVatCategoryList = createAsyncThunk(
  'product/getProductVatCategoryList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/datalist/vatCategory',
      };
      const res = await authApi(data);
      const array = [];
      res.data.map(item => {
        if (item.id != 4 && item.id != 10) array.push(item);
      });
      return array;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProductCategoryList = createAsyncThunk(
  'product/getProductCategoryList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: '/rest/datalist/getProductCategoryList',
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getInventoryByProductId = createAsyncThunk(
  'product/getInventoryByProductId',
  async (id, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/inventory/getInventoryByProductId?id=${id}`,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getInventoryHistory = createAsyncThunk(
  'product/getInventoryHistory',
  async (obj, { rejectWithValue }) => {
    try {
      const pid = obj?.p_id;
      const sid = obj?.s_id;
      const data = {
        method: 'GET',
        url: `/rest/inventory/getInventoryHistoryByProductIdAndSupplierId?productId=${pid}&supplierId=${sid}`,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Non-thunk actions (utility functions)
export const createWarehouse = warehouse => {
  const data = {
    method: 'POST',
    url: '/rest/productwarehouse/saveWareHouse',
    data: warehouse,
  };
  return authApi(data);
};

export const getExciseTaxList = () => {
  const data = {
    method: 'GET',
    url: '/rest/datalist/exciseTax',
  };
  return authApi(data);
};

export const getTransactionCategoryListForInventory = id => {
  const data = {
    method: 'get',
    url: '/rest/product/getTransactionCategoryListForInventory',
  };
  return authApi(data);
};

export const getTransactionCategoryListForSalesProduct = id => {
  const data = {
    method: 'get',
    url: '/rest/product/getTransactionCategoryListForSalesProduct',
  };
  return authApi(data);
};

export const getTransactionCategoryListForPurchaseProduct = id => {
  const data = {
    method: 'get',
    url: '/rest/product/getTransactionCategoryListForPurchaseProduct',
  };
  return authApi(data);
};

export const removeBulk = obj => {
  const data = {
    method: 'delete',
    url: '/rest/product/deletes',
    data: obj,
  };
  return authApi(data);
};

export const getInventoryById = id => {
  const data = {
    method: 'GET',
    url: `/rest/inventory/getInventoryById?id=${id}`,
  };
  return authApi(data);
};

export const updateInventory = obj => {
  const data = {
    method: 'POST',
    url: '/rest/inventory/update',
    data: obj,
  };
  return authApi(data);
};

export const getProductCode = () => {
  const data = {
    method: 'GET',
    url: '/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=9',
  };
  return authApi(data);
};

export const getProductCodePrefix = () => {
  const data = {
    method: 'get',
    url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=9',
  };
  return authApi(data);
};

export const getCompanyDetails = () => {
  const data = {
    method: 'GET',
    url: '/rest/company/getCompanyDetails',
  };
  return authApi(data);
};

export const getUnitTypeList = () => {
  const data = {
    method: 'GET',
    url: '/rest/datalist/getUnitTypeList',
  };
  return authApi(data);
};

export const checkValidation = obj => {
  const data = {
    method: 'get',
    url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
  };
  return authApi(data);
};

export const checkProductNameValidation = obj => {
  const data = {
    method: 'get',
    url: `/rest/validation/validate?moduleType=${obj.moduleType}&productCode=${obj.productCode}`,
  };
  return authApi(data);
};

export const getInvoicesCountProduct = id => {
  const data = {
    method: 'get',
    url: `/rest/product/getInvoicesCountForProduct?productId=${id}`,
  };
  return authApi(data);
};

// ============ Slice ============

const initialState = {
  product_list: [],
  vat_list: [],
  product_warehouse_list: [],
  product_category_list: [],
  inventory_account_list: [],
  inventory_list: [],
  inventory_history_list: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProductList: (state, action) => {
      state.product_list = action.payload;
    },
    setVatList: (state, action) => {
      state.vat_list = action.payload;
    },
    setProductWarehouseList: (state, action) => {
      state.product_warehouse_list = action.payload;
    },
    setProductCategoryList: (state, action) => {
      state.product_category_list = action.payload;
    },
    setInventoryAccountList: (state, action) => {
      state.inventory_account_list = action.payload;
    },
    setInventoryList: (state, action) => {
      state.inventory_list = action.payload;
    },
    setInventoryHistoryList: (state, action) => {
      state.inventory_history_list = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // getProductList
      .addCase(getProductList.fulfilled, (state, action) => {
        if (action.payload != null && typeof action.payload === 'object') {
          state.product_list = action.payload;
        }
      })
      // getProductWareHouseList
      .addCase(getProductWareHouseList.fulfilled, (state, action) => {
        state.product_warehouse_list = action.payload;
      })
      // getProductVatCategoryList
      .addCase(getProductVatCategoryList.fulfilled, (state, action) => {
        state.vat_list = action.payload;
      })
      // getProductCategoryList
      .addCase(getProductCategoryList.fulfilled, (state, action) => {
        state.product_category_list = action.payload;
      })
      // getInventoryByProductId
      .addCase(getInventoryByProductId.fulfilled, (state, action) => {
        state.inventory_list = action.payload;
      })
      // getInventoryHistory
      .addCase(getInventoryHistory.fulfilled, (state, action) => {
        state.inventory_history_list = action.payload;
      })
      // Backward compatibility with old action types
      .addCase(PRODUCT.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload || [];
      })
      .addCase(PRODUCT.PRODUCT_VAT_CATEGORY, (state, action) => {
        state.vat_list = action.payload || [];
      })
      .addCase(PRODUCT.PRODUCT_WHARE_HOUSE, (state, action) => {
        state.product_warehouse_list = action.payload || [];
      })
      .addCase(PRODUCT.PRODUCT_CATEGORY, (state, action) => {
        state.product_category_list = action.payload || [];
      })
      .addCase(PRODUCT.INVENTORY_ACCOUNT_LIST, (state, action) => {
        state.inventory_account_list = action.payload || [];
      })
      .addCase(PRODUCT.INVENTORY_LIST, (state, action) => {
        state.inventory_list = action.payload || [];
      })
      .addCase(PRODUCT.INVENTORY_HISTORY_LIST, (state, action) => {
        state.inventory_history_list = action.payload || [];
      });
  },
});

export const {
  setProductList,
  setVatList,
  setProductWarehouseList,
  setProductCategoryList,
  setInventoryAccountList,
  setInventoryList,
  setInventoryHistoryList,
  clearError,
} = productSlice.actions;
export default productSlice.reducer;
