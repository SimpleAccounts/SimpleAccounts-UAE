package com.simplevat.service.impl;
import com.simplevat.dao.Dao;
import com.simplevat.dao.EmployeeParentRelationDao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeParentRelation;
import com.simplevat.service.EmployeeParentRelationService;
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
