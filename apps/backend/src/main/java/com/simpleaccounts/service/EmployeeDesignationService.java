package com.simpleaccounts.service;

import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayRollFilterModel;

import java.util.List;
import java.util.Map;

public abstract class EmployeeDesignationService extends SimpleAccountsService<Integer, EmployeeDesignation> {

    public abstract List<DropdownObjectModel> getEmployeeDesignationDropdown();

    public abstract List<DropdownObjectModel> getParentEmployeeDesignationForDropdown();


    public abstract PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap,  PaginationModel paginationModel);



}
