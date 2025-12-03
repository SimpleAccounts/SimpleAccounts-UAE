package com.simpleaccounts.repository;

import com.simpleaccounts.entity.UnitType;
import com.simpleaccounts.entity.VatTaxAgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitTypesRepository extends JpaRepository<UnitType,Integer> {

    Optional<UnitType> findById(Integer id);
}
