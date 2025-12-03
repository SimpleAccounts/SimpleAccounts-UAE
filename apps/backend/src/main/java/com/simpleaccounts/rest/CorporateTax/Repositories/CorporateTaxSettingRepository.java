package com.simpleaccounts.rest.CorporateTax.Repositories;

import com.simpleaccounts.rest.CorporateTax.CorporateTaxSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateTaxSettingRepository extends JpaRepository<CorporateTaxSettings,Integer> {
    List<CorporateTaxSettings> findByDeleteFlag(boolean deleteFlag);
}
