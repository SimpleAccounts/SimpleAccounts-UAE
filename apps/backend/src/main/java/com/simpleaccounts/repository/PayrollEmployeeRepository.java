package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.entity.PayrollEmployee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollEmployeeRepository  extends JpaRepository<PayrollEmployee,Integer> {
    List<PayrollEmployee> findByDeleteFlag(boolean deleteFlag);

    List<PayrollEmployee> findByPayrollId(Payroll payrollId);
}
