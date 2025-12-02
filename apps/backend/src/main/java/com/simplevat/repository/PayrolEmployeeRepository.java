package com.simplevat.repository;

import com.simplevat.entity.Employee;
import com.simplevat.entity.Payroll;
import com.simplevat.entity.PayrollEmployee;
import com.simplevat.rest.payroll.dto.PayrollEmployeeResultSet;

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