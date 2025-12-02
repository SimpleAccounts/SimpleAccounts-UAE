package com.simplevat.rest.payroll.service;

import com.simplevat.constant.dbfilter.BankAccounrFilterEnum;
import com.simplevat.entity.SalaryRole;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.SimpleVatService;

import java.util.List;
import java.util.Map;

public abstract class SalaryRoleService extends SimpleVatService<Integer, SalaryRole> {


    public abstract List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel();

    public abstract PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap,
                                                            PaginationModel paginationModel);

}
