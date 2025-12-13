package com.simpleaccounts.dao;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;

public interface EmployeeParentRelationDao extends Dao<Integer, EmployeeParentRelation>  {

  public void addEmployeeParentRelationDao(Employee parentId, Employee childId ,Integer userId);
  
}
