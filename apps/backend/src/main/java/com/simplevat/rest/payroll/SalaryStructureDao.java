package com.simplevat.rest.payroll;

import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryStructure;
import com.simplevat.entity.SalaryTemplate;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface SalaryStructureDao extends Dao<Integer, SalaryStructure> {
    PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    List<DropdownObjectModel> getSalaryStructureDropdown();
}
