package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmployeeParentRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;
import org.springframework.stereotype.Repository;

@Repository(value = "employeeParentRelationDao")
public class EmployeeParentRelationDaoImpl  extends AbstractDao<Integer, EmployeeParentRelation> implements EmployeeParentRelationDao {

    public void addEmployeeParentRelationDao(Employee parentId, Employee childId ,Integer userId){
        // Method stub - parent-child relationship persistence to be implemented when feature is needed
    }
}
