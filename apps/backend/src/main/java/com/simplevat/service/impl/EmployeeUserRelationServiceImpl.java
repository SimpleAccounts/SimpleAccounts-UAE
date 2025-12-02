package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmployeeUserRelationDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeUserRelation;
import com.simplevat.entity.User;
import com.simplevat.service.EmployeeUserRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


/**
 * Created By Suraj Rahade
 */
@Service("employeeUserRelationService")
public class EmployeeUserRelationServiceImpl extends EmployeeUserRelationService {
    @Autowired
    private EmployeeUserRelationDao employeeUserRelationDao;

    @Override
    protected Dao<Integer, EmployeeUserRelation> getDao() {
        return employeeUserRelationDao;
    }
    public  void addEmployeeUserRelation(Employee employee, User user)
   {

    }

}