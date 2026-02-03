package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.entity.VatReportFiling;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VatReportFilingRepository extends JpaRepository<VatReportFiling,Integer> {
    @Query(value = "SELECT EXISTS(SELECT 1 FROM VAT_REPORT_FILING)", nativeQuery = true)
    boolean existsAny();

    void deleteById(Integer id);
    @Query(value = "select vrf from VatReportFiling vrf where vrf.id=:id",nativeQuery = true)
    VatReportFiling findByPk(Integer id);

    VatReportFiling getVatReportFilingByStartDateAndEndDate(LocalDate startDate,LocalDate endDate);

}
