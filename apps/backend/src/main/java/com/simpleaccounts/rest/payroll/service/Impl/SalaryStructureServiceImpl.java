package com.simpleaccounts.rest.payroll.service.Impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryStructureDao;
import com.simpleaccounts.rest.payroll.service.SalaryStructureService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("salaryStructureService")
@Transactional
@RequiredArgsConstructor
public class SalaryStructureServiceImpl extends SalaryStructureService {

    private final SalaryStructureDao salaryStructureDao;

    @Override
    protected Dao<Integer, SalaryStructure> getDao() {
        return this.salaryStructureDao;
    }

    public PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap,
                                                                   PaginationModel paginationModel)
    {
        return salaryStructureDao.getSalaryStructureList(filterDataMap, paginationModel);
    }

    public List<DropdownObjectModel> getSalaryStructureDropdown()
    {
      return salaryStructureDao.getSalaryStructureDropdown();
    }

}