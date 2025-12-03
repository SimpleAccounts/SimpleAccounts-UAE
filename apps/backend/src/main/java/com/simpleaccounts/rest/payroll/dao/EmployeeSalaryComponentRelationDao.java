package com.simpleaccounts.rest.payroll.dao;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;

import java.util.List;

public interface EmployeeSalaryComponentRelationDao extends Dao<Integer, EmployeeSalaryComponentRelation> {

    List<EmployeeSalaryComponentRelation> getDefaultSalaryComponentByEmployeeId(Integer id);
}
