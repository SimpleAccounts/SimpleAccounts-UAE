package com.simpleaccounts.repository;

import com.simpleaccounts.entity.CompanyType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyTypeRepository extends JpaRepository<CompanyType, Long> {
    List<CompanyType> findAll();
}