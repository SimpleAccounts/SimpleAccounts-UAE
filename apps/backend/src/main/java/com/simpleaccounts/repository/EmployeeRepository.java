package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.PayrollEmployee;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeResultSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee,Integer> {

    @Query(name = "AllActiveCompleteEmployee", nativeQuery = true)
    List<PayrollEmployeeResultSet> getAllActiveCompleteEmployee();

    Integer countEmployeesByEmployeeDesignationIdAndDeleteFlag(EmployeeDesignation employeeDesignation,Boolean flag);
}
