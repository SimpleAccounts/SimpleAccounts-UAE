package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryStructure;

import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface SalaryStructureDao extends Dao<Integer, SalaryStructure> {
    PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    List<DropdownObjectModel> getSalaryStructureDropdown();
}
