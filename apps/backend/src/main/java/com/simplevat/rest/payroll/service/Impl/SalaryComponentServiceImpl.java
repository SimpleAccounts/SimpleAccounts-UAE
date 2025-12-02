package com.simplevat.rest.payroll.service.Impl;


import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryComponent;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.PayRollFilterModel;
import com.simplevat.rest.payroll.dao.SalaryComponentDao;
import com.simplevat.rest.payroll.service.SalaryComponentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("salaryComponentService")
@Transactional
public class SalaryComponentServiceImpl extends SalaryComponentService {

    @Autowired
    SalaryComponentDao salaryComponentDao;

    @Override
    protected Dao<Integer, SalaryComponent> getDao() {
        return this.salaryComponentDao;
    }


    public List<DropdownObjectModel> getSalaryComponentForDropdownObjectModel(Integer id){

        return salaryComponentDao.getSalaryComponentsForDropdownObjectModel(id);
    }

    public PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){

        return salaryComponentDao.getSalaryComponentList(filterDataMap,paginationModel);
    }

    public  List<SalaryComponent> getDefaultSalaryComponentList(){

        return salaryComponentDao.getDefaultSalaryComponentList();
    }
}
