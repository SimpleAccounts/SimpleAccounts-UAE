package com.simpleaccounts.repository;

import com.simpleaccounts.entity.CompanyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyTypeRepository extends JpaRepository<CompanyType, Long> {
    List<CompanyType> findAll();
}