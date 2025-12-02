package com.simplevat.repository;

import com.simplevat.entity.Payroll;
import com.simplevat.entity.PayrollEmployee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayrollEmployeeRepository  extends JpaRepository<PayrollEmployee,Integer> {
    List<PayrollEmployee> findByDeleteFlag(boolean deleteFlag);

    List<PayrollEmployee> findByPayrollId(Payroll payrollId);
}
