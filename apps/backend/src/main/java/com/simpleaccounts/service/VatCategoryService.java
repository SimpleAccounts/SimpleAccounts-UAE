package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public abstract class VatCategoryService extends SimpleAccountsService<Integer, VatCategory> {

    public abstract List<VatCategory> getVatCategoryList();

    public abstract List<VatCategory> getVatCategorys(String name);

    public abstract VatCategory getDefaultVatCategory();

    public abstract void deleteByIds(List<Integer> ids);

	public abstract PaginationResponseModel getVatCategoryList(Map<VatCategoryFilterEnum, Object> filterDataMap,PaginationModel paginationModel );
	
	public abstract List<DropdownModel> getVatCategoryForDropDown();
}
