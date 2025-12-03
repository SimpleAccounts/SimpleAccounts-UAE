package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ExciseTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExciseTaxRepository extends JpaRepository<ExciseTax, Long> {

    ExciseTax findById(Integer id);
    void deleteById(Integer id);
    List<ExciseTax> findAll();

}