package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Company;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company,Integer> {

    @Override
    Optional<Company> findById(Integer integer);
}
