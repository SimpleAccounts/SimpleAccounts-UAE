package com.simpleaccounts.service.impl;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmployeeParentRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;
import com.simpleaccounts.service.EmployeeParentRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service("employeeParentRelationService")
@Transactional
public class EmployeeParentRelationServiceImpl extends EmployeeParentRelationService {

    @Autowired
    EmployeeParentRelationDao employeeParentRelationDao;

    protected Dao<Integer, EmployeeParentRelation> getDao() {
        return this.employeeParentRelationDao;
    }

    public void addEmployeeParentRelation(Employee parentId, Employee childId,Integer userId){

        EmployeeParentRelation employeeParentRelation = new EmployeeParentRelation();
        employeeParentRelation.setParentID(parentId);
        employeeParentRelation.setParentType(employeeParentRelation.getParentType());
        employeeParentRelation.setChildID(childId);
        employeeParentRelation.setChildType(employeeParentRelation.getChildType());
        employeeParentRelation.setCreatedBy(userId);
        employeeParentRelation.setCreatedDate(LocalDateTime.now());
        employeeParentRelation.setLastUpdatedBy(userId);
        employeeParentRelation.setLastUpdateDate(LocalDateTime.now());
        persist(employeeParentRelation);

    }

}
