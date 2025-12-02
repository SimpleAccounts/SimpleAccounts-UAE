package com.simplevat.rest.payroll;

import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryRole;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface SalaryRoleDao extends Dao<Integer, SalaryRole> {


    List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel();


    PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);
}
