package com.simplevat.repository;

import com.simplevat.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JournalRepository extends JpaRepository<Journal, Integer> {

    @Query(value = "select * from journal  where journal_reference_no =:id and reference_type in ('INVOICE','RECEIPT','BANK_RECEIPT') and reversal_flag = false and delete_flag = false order by journal_id desc ",nativeQuery = true)
    List<Journal> findForCustomerInvoice(@Param("id")String Id);

    @Query(value = "select * from journal  where journal_reference_no =:id and reference_type in ('INVOICE','PAYMENT','BANK_PAYMENT') and reversal_flag = false and delete_flag = false order by journal_id desc ",nativeQuery = true)
    List<Journal> findForSupplierInvoice(@Param("id")String Id);

    @Query(value = "select * from journal j where j.journal_reference_no =:id and j.reference_type in ('CREDIT_NOTE','REFUND') and j.reversal_flag = false and j.delete_flag = false order by j.journal_id desc LIMIT 1",nativeQuery = true)
    List<Journal> findForCreditNote(@Param("id")String Id);

    @Query(value = "select * from journal j where j.journal_reference_no =:id and j.reference_type in ('DEBIT_NOTE','REFUND') and j.reversal_flag = false and j.delete_flag = false order by j.journal_id desc LIMIT 1 ",nativeQuery = true)
    List<Journal> findForDebitNote(@Param("id")String Id);

    @Query(value = "select * from journal j where j.journal_reference_no =:id and j.reference_type in ('EXPENSE') and j.reversal_flag = false and j.delete_flag = false order by journal_id desc ",nativeQuery = true)
    List<Journal> findForExpense(@Param("id")String Id);


//    @Query(value = "select * from journal  where journal_reference_no =:id and reference_type in ('RECEIPT','BANK_RECEIPT') and reversal_flag = false and delete_flag = false order by journal_id desc ",nativeQuery = true)
//    List<Journal> findForIncomeReceipt(@Param("id")String Id);
//
//    @Query(value = "select * from journal  where journal_reference_no =:id and reference_type in ('PAYMENT','BANK_PAYMENT') and reversal_flag = false and delete_flag = false order by journal_id desc ",nativeQuery = true)
//    List<Journal> findForPurchaseReceipt(@Param("id")String Id);

}