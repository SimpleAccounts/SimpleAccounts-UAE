package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public abstract class ProductService extends SimpleAccountsService<Integer, Product> {

    public abstract PaginationResponseModel getProductList(Map<ProductFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public abstract void deleteByIds(List<Integer> ids);

    public abstract Integer getTotalProductCountByVatId(Integer vatId);

}
