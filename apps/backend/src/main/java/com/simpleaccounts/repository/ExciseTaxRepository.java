package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ExciseTax;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExciseTaxRepository extends JpaRepository<ExciseTax, Long> {

    ExciseTax findById(Integer id);
    void deleteById(Integer id);
    List<ExciseTax> findAll();

}