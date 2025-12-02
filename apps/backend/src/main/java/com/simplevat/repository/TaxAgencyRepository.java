package com.simplevat.repository;

import com.simplevat.entity.VatTaxAgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaxAgencyRepository extends JpaRepository<VatTaxAgency,Integer> {


    Optional<VatTaxAgency> findById(Integer id);
}
