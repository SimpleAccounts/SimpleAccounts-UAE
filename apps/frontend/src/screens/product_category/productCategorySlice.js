import { createSlice } from '@reduxjs/toolkit';
import { PRODUCT_CATEGORY } from 'constants/types';

const initialState = {
  product_category_list: [],
};

const productCategorySlice = createSlice({
  name: 'product_category',
  initialState,
  reducers: {
    setProductCategoryList: (state, action) => {
      state.product_category_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST, (state, action) => {
      state.product_category_list = action.payload || [];
    });
  },
});

export const { setProductCategoryList } = productCategorySlice.actions;
export default productCategorySlice.reducer;

