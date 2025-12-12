package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.entity.VatReportFiling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;

public interface VatReportFilingRepository extends JpaRepository<VatReportFiling,Integer> {
    void deleteById(Integer id);
    @Query(value = "select vrf from VatReportFiling vrf where vrf.id=:id",nativeQuery = true)
    VatReportFiling findByPk(Integer id);

    VatReportFiling getVatReportFilingByStartDateAndEndDate(LocalDate startDate,LocalDate endDate);

}
