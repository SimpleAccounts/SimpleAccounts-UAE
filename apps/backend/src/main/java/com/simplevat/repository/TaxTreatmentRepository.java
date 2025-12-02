package com.simplevat.repository;

import com.simplevat.entity.TaxTreatment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaxTreatmentRepository extends JpaRepository<TaxTreatment,Long> {
    TaxTreatment findById(Integer id);
    
    TaxTreatment findByTaxTreatment(String taxTreatmentValue);

}
