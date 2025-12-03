package com.simpleaccounts.entity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeBankDetailsRepository extends JpaRepository<EmployeeBankDetails, Integer> {

    EmployeeBankDetails findByEmployeeId(Integer employeeId);
}