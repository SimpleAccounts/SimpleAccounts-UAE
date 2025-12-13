package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.entity.PayrollEmployee;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeResultSet;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrolEmployeeRepository extends JpaRepository<PayrollEmployee,Integer> {

	 
	 @Query(name = "PayrollEmployee", nativeQuery = true)
     List<PayrollEmployeeResultSet> findPayEmployee(@Param("payrollId") Integer payrollId, @Param("type") Integer type);
	 
	 @Query(name = "PayrollEmployeeDetails", nativeQuery = true)
     List<PayrollEmployeeResultSet> findPayrollEmployeeDetails(@Param("payrollId") Integer payrollId);	
	 
	 List<PayrollEmployee> findByPayrollId(Payroll payrollId);
	 

	@Query(value = "SELECT pe.EMPLOYEE_ID FROM payroll_employee pe WHERE pe.PAYROLL_ID = :payrollId", nativeQuery = true)
	List<Integer> getEmployeeListByPayrollId(@Param("payrollId") Integer payrollId);

	/**
	 * Added for checking child activities of Employee
	 * @param employee
	 * @return
	 */
	List<PayrollEmployee> findByEmployeeID(Employee employee);
}