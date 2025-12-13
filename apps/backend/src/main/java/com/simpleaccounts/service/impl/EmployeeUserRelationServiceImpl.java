package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.EmployeeUserRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.EmployeeUserRelationService;
import org.springframework.stereotype.Service;

/**
 * Created By Suraj Rahade
 */
@Service("employeeUserRelationService")
@RequiredArgsConstructor
public class EmployeeUserRelationServiceImpl extends EmployeeUserRelationService {
    private final EmployeeUserRelationDao employeeUserRelationDao;

    @Override
    protected Dao<Integer, EmployeeUserRelation> getDao() {
        return employeeUserRelationDao;
    }

    @Override
    public void addEmployeeUserRelation(Employee employee, User user) {
        EmployeeUserRelation relation = new EmployeeUserRelation();
        relation.setEmployee(employee);
        relation.setUser(user);
        persist(relation);
    }

} 
