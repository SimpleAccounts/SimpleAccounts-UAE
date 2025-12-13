package com.simpleaccounts.repository;

import com.simpleaccounts.entity.VatTaxAgency;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxAgencyRepository extends JpaRepository<VatTaxAgency,Integer> {

    Optional<VatTaxAgency> findById(Integer id);
}
