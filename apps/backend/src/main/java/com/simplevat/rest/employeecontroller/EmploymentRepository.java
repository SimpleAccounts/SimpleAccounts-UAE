package com.simplevat.rest.employeecontroller;

import com.simplevat.entity.Employment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentRepository extends JpaRepository<Employment, Integer> {
    Employment findByemployeeId(Integer employeeId);
}