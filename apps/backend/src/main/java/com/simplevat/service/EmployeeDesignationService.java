package com.simplevat.service;

import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.PayRollFilterModel;

import java.util.List;
import java.util.Map;

public abstract class EmployeeDesignationService extends SimpleVatService<Integer, EmployeeDesignation> {

    public abstract List<DropdownObjectModel> getEmployeeDesignationDropdown();

    public abstract List<DropdownObjectModel> getParentEmployeeDesignationForDropdown();


    public abstract PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap,  PaginationModel paginationModel);



}
