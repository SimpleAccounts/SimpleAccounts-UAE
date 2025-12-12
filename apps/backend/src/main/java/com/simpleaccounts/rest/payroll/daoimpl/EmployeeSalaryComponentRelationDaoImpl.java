package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.dao.AbstractDao;

import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;

import com.simpleaccounts.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;

import java.util.List;

@Repository(value = "employeeSalaryTempRelationDao")
public class EmployeeSalaryComponentRelationDaoImpl extends AbstractDao<Integer, EmployeeSalaryComponentRelation> implements EmployeeSalaryComponentRelationDao {

    public List<EmployeeSalaryComponentRelation> getDefaultSalaryComponentByEmployeeId(Integer id){

        String quertStr = "SELECT e FROM EmployeeSalaryComponentRelation e where e.employeeId.id = :employeeId order by e.id asc ";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("employeeId", id);
        List<EmployeeSalaryComponentRelation> employeeSalaryComponentList = query.getResultList();

        return employeeSalaryComponentList;
    }

}
