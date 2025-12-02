package com.simplevat.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, Integer> {

    Page<SalaryComponent> findByDeleteFlag (boolean deleteFlag, Pageable paging);
}