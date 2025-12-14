package com.simpleaccounts.rest.payroll.service;

import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.SimpleAccountsService;
import java.util.List;
import java.util.Map;

public abstract class SalaryStructureService extends SimpleAccountsService<Integer, SalaryStructure> {

    public abstract PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap,
                                                              PaginationModel paginationModel);

    public abstract List<DropdownObjectModel> getSalaryStructureDropdown();
}
