package com.simpleaccounts.rest.employeecontroller;

import com.simpleaccounts.entity.Employment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentRepository extends JpaRepository<Employment, Integer> {
    Employment findByemployeeId(Integer employeeId);
}