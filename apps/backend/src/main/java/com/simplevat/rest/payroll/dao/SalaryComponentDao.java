package com.simplevat.rest.payroll.dao;


import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryComponent;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface SalaryComponentDao extends Dao<Integer, SalaryComponent> {

    List<DropdownObjectModel> getSalaryComponentsForDropdownObjectModel(Integer id);

    PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    List<SalaryComponent> getDefaultSalaryComponentList();
}
