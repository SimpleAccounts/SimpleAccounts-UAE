package com.simpleaccounts.rest.payroll.service;

import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.SimpleAccountsService;

import java.util.List;
import java.util.Map;

public abstract class SalaryRoleService extends SimpleAccountsService<Integer, SalaryRole> {

    public abstract List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel();

    public abstract PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap,
                                                            PaginationModel paginationModel);

}
