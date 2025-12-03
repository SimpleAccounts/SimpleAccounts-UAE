package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.entity.VatPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VatPaymentRepository extends JpaRepository<VatPayment,Integer> {

    @Query(value ="SELECT vp FROM VatPayment vp WHERE vp.vatReportFiling.id=:id AND vp.deleteFlag=false")
    VatPayment getPaymentByVatReportFilingId(@Param("id") Integer id);

    @Query(value = "SELECT vp from VatPayment vp where vp.transaction.transactionId=:transactionId")
    VatPayment getVatPaymentByTransactionId(@Param("transactionId")Integer transactionId);
}
