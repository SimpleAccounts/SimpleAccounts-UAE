package com.simplevat.repository;

import com.simplevat.entity.Company;
import com.simplevat.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company,Integer> {

    @Override
    Optional<Company> findById(Integer integer);
}
