package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeParentRelationDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeParentRelation;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;


@Repository(value = "employeeParentRelationDao")
public class EmployeeParentRelationDaoImpl  extends AbstractDao<Integer, EmployeeParentRelation> implements EmployeeParentRelationDao {


    public void addEmployeeParentRelationDao(Employee parentId, Employee childId ,Integer userId){

    }
}
