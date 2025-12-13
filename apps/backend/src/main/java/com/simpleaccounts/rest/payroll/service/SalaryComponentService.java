package com.simpleaccounts.rest.payroll.service;

import com.simpleaccounts.entity.SalaryComponent;

import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import com.simpleaccounts.service.SimpleAccountsService;

import java.util.List;
import java.util.Map;

public abstract class SalaryComponentService extends SimpleAccountsService<Integer, SalaryComponent> {

    public abstract List<DropdownObjectModel> getSalaryComponentForDropdownObjectModel(Integer id);

    public abstract PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    public abstract List<SalaryComponent> getDefaultSalaryComponentList();

}
