package com.simplevat.rest.payroll.service.Impl;

import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryStructure;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.SalaryStructureDao;
import com.simplevat.rest.payroll.service.SalaryStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("salaryStructureService")
@Transactional
public class SalaryStructureServiceImpl extends SalaryStructureService {

    @Autowired
    private SalaryStructureDao salaryStructureDao;

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