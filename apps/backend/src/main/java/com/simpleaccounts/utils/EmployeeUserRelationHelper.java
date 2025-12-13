package com.simpleaccounts.utils;
import com.simpleaccounts.entity.*;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class EmployeeUserRelationHelper {

    private final EmployeeUserRelationService employeeUserRelationService;

    @Transactional(rollbackFor = Exception.class)
    public void createUserForEmployee(Employee employee,User user)
    {
            EmployeeUserRelation employeeUserRelation = new EmployeeUserRelation();
            employeeUserRelation.setEmployee(employee);
            employeeUserRelation.setUser(user);
            employeeUserRelationService.persist(employeeUserRelation);
    }
}
