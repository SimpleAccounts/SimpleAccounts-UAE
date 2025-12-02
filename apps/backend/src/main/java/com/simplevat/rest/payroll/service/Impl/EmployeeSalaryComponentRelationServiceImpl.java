package com.simplevat.rest.payroll.service.Impl;

import com.simplevat.dao.Dao;
import com.simplevat.entity.EmployeeSalaryComponentRelation;
import com.simplevat.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import com.simplevat.rest.payroll.service.EmployeeSalaryComponentRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("employeeSalaryTempRelationService")
@Transactional
public class EmployeeSalaryComponentRelationServiceImpl extends EmployeeSalaryComponentRelationService {


    @Autowired
    EmployeeSalaryComponentRelationDao employeeSalaryComponentRelationDao;

    @Override
    protected Dao<Integer, EmployeeSalaryComponentRelation> getDao() {
        return this.employeeSalaryComponentRelationDao;
    }

}
