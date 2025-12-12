package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface SalaryRoleDao extends Dao<Integer, SalaryRole> {

    List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel();

    PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);
}
