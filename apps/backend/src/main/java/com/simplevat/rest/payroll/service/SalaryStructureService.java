package com.simplevat.rest.payroll.service;

import com.simplevat.entity.SalaryStructure;
import com.simplevat.entity.SalaryTemplate;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.SimpleVatService;

import java.util.List;
import java.util.Map;

public abstract class SalaryStructureService extends SimpleVatService<Integer, SalaryStructure> {

    public abstract PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap,
                                                              PaginationModel paginationModel);

    public abstract List<DropdownObjectModel> getSalaryStructureDropdown();
}
