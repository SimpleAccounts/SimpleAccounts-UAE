package com.simplevat.utils;
import com.simplevat.entity.*;
import com.simplevat.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


@Component
public class EmployeeUserRelationHelper {

    @Autowired
    private EmployeeUserRelationService employeeUserRelationService;

    @Transactional(rollbackFor = Exception.class)
    public void createUserForEmployee(Employee employee,User user)
    {
            EmployeeUserRelation employeeUserRelation = new EmployeeUserRelation();
            employeeUserRelation.setEmployee(employee);
            employeeUserRelation.setUser(user);
            employeeUserRelationService.persist(employeeUserRelation);
    }
}
