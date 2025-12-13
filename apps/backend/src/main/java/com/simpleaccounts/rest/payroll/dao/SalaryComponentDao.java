package com.simpleaccounts.rest.payroll.dao;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;

public interface SalaryComponentDao extends Dao<Integer, SalaryComponent> {

    List<DropdownObjectModel> getSalaryComponentsForDropdownObjectModel(Integer id);

    PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

    List<SalaryComponent> getDefaultSalaryComponentList();
}
