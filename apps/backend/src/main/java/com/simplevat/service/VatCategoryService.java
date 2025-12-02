package com.simplevat.service;

import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.entity.VatCategory;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public abstract class VatCategoryService extends SimpleVatService<Integer, VatCategory> {

    public abstract List<VatCategory> getVatCategoryList();

    public abstract List<VatCategory> getVatCategorys(String name);

    public abstract VatCategory getDefaultVatCategory();

    public abstract void deleteByIds(List<Integer> ids);

	public abstract PaginationResponseModel getVatCategoryList(Map<VatCategoryFilterEnum, Object> filterDataMap,PaginationModel paginationModel );
	
	public abstract List<DropdownModel> getVatCategoryForDropDown();
}
