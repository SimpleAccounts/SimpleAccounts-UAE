package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;
import com.simpleaccounts.rest.payroll.dao.EmployeeSalaryComponentRelationDao;
import java.util.List;
import javax.persistence.Query;
import org.springframework.stereotype.Repository;

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
