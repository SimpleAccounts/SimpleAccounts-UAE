package com.simplevat.dao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeParentRelation;


public interface EmployeeParentRelationDao extends Dao<Integer, EmployeeParentRelation>  {


  public void addEmployeeParentRelationDao(Employee parentId, Employee childId ,Integer userId);
  
}
