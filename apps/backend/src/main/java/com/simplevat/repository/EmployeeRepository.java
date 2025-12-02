package com.simplevat.repository;

import com.simplevat.entity.Employee;
import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.entity.PayrollEmployee;
import com.simplevat.rest.payroll.dto.PayrollEmployeeResultSet;
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
