package com.simplevat.repository;

import com.simplevat.entity.UnitType;
import com.simplevat.entity.VatTaxAgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitTypesRepository extends JpaRepository<UnitType,Integer> {

    Optional<UnitType> findById(Integer id);
}
