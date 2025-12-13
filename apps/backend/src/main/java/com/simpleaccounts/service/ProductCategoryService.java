package com.simpleaccounts.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public abstract class ProductCategoryService extends SimpleAccountsService<Integer, ProductCategory> {

	public abstract List<ProductCategory> findAllProductCategoryByUserId(Integer userId, boolean isDeleted);

	public abstract void deleteByIds(ArrayList<Integer> ids);

	public abstract PaginationResponseModel getProductCategoryList(Map<ProductCategoryFilterEnum, Object> filterList,PaginationModel paginationModel);

}
