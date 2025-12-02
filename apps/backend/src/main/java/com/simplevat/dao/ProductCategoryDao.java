package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.ProductCategoryFilterEnum;
import com.simplevat.entity.ProductCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public interface ProductCategoryDao extends Dao<Integer, ProductCategory> {

	public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getProductCategoryList(Map<ProductCategoryFilterEnum, Object> filterMap,PaginationModel paginatioModel);
}
