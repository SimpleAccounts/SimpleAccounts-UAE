package com.simplevat.rest.financialreport;
import com.simplevat.entity.VatRecordPaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VatRecordPaymentHistoryRepository extends JpaRepository<VatRecordPaymentHistory,Integer> {

    @Query(value = "select vrph from VatRecordPaymentHistory vrph where vrph.vatPayment.id=:id")
    VatRecordPaymentHistory getByVatPaymentId(@Param("id") Integer id);
}