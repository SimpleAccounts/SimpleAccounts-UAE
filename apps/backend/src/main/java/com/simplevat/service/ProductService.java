package com.simplevat.service;

import com.simplevat.constant.dbfilter.ProductFilterEnum;
import com.simplevat.entity.Product;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public abstract class ProductService extends SimpleVatService<Integer, Product> {

    public abstract PaginationResponseModel getProductList(Map<ProductFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public abstract void deleteByIds(List<Integer> ids);

    public abstract Integer getTotalProductCountByVatId(Integer vatId);

}
