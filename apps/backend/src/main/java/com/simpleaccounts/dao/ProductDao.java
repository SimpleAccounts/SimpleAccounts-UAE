/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 *
 * @author daynil
 */
public interface ProductDao extends Dao<Integer, Product> {

    public PaginationResponseModel getProductList(Map<ProductFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public void deleteByIds(List<Integer> ids);

    public Integer getTotalProductCountByVatId(Integer vatId);

}
