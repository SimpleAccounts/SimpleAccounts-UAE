package com.simplevat.rest.financialreport;


import com.simplevat.entity.VatTaxAgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VatTaxAgencyRepository  extends JpaRepository<VatTaxAgency,Integer> {

    @Query(name = "findVatTaxAgencyByVatReportFillingId", nativeQuery = true)
    List<VatTaxAgency> findVatTaxAgencyByVatReportFillingId(@Param("vatReportFillingId") Integer vatReportFillingId);
}
