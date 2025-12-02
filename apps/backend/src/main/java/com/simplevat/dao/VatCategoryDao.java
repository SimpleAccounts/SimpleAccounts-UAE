/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao;

import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.entity.VatCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

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
