package com.simplevat.rest.payroll.daoimpl;


import com.simplevat.dao.AbstractDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeSalaryComponentRelation;
import com.simplevat.entity.SalaryComponent;
import com.simplevat.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
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
