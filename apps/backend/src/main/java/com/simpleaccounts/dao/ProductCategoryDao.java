package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public interface ProductCategoryDao extends Dao<Integer, ProductCategory> {

	public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getProductCategoryList(Map<ProductCategoryFilterEnum, Object> filterMap,PaginationModel paginatioModel);
}
