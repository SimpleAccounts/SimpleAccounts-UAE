package com.simpleaccounts.rest.payroll.service.Impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;
import com.simpleaccounts.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
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
