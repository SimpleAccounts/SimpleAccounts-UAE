/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;

/**
 *
 * @author daynil
 */
public interface VatCategoryDao extends Dao<Integer, VatCategory> {

    public List<VatCategory> getVatCategoryList();

    public List<VatCategory> getVatCategorys(String name);

    public VatCategory getDefaultVatCategory();

    public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getVatCategoryList(Map<VatCategoryFilterEnum, Object> filterDataMa,PaginationModel paginationModel);
}
