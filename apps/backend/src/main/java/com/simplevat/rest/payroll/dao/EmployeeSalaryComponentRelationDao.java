package com.simplevat.rest.payroll.dao;

import com.simplevat.dao.Dao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeSalaryComponentRelation;

import java.util.List;

public interface EmployeeSalaryComponentRelationDao extends Dao<Integer, EmployeeSalaryComponentRelation> {

    List<EmployeeSalaryComponentRelation> getDefaultSalaryComponentByEmployeeId(Integer id);
}
