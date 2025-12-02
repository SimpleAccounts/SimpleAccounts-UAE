package com.simplevat.repository;

import com.simplevat.entity.EmployeeSalaryComponentRelation;
import com.simplevat.entity.Payroll;
import com.simplevat.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;



@Repository
public interface SalaryRepository extends JpaRepository<Salary,Integer> {

    @Query(value = "SELECT * FROM Salary s WHERE  s.PAYROLL_ID =:payrollId and s.EMPLOYEE_ID =:empId", nativeQuery=true)
    List<Salary> findByPayrollEmployeeId(@Param("payrollId") Integer payrollId, @Param("empId") Integer empId);
}