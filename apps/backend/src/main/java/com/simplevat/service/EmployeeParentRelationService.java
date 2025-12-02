package com.simplevat.service;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeParentRelation;

public abstract class EmployeeParentRelationService extends SimpleVatService<Integer, EmployeeParentRelation> {

    public abstract void addEmployeeParentRelation(Employee parentId, Employee childId,Integer userId);

}
