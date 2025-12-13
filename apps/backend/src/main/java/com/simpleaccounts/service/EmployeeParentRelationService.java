package com.simpleaccounts.service;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;

public abstract class EmployeeParentRelationService extends SimpleAccountsService<Integer, EmployeeParentRelation> {

    public abstract void addEmployeeParentRelation(Employee parentId, Employee childId,Integer userId);

}
