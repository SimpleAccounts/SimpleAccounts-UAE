package com.simpleaccounts.repository;

import com.simpleaccounts.entity.UnitType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitTypesRepository extends JpaRepository<UnitType,Integer> {

    Optional<UnitType> findById(Integer id);
}
