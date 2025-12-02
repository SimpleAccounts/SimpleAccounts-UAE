package com.simplevat.rest.payroll.service;

import com.simplevat.entity.SalaryComponent;
import com.simplevat.entity.SalaryRole;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.PayRollFilterModel;
import com.simplevat.service.SimpleVatService;

import java.util.List;
import java.util.Map;


public abstract class SalaryComponentService extends SimpleVatService<Integer, SalaryComponent> {


    public abstract List<DropdownObjectModel> getSalaryComponentForDropdownObjectModel(Integer id);

    public abstract PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    public abstract List<SalaryComponent> getDefaultSalaryComponentList();

}
