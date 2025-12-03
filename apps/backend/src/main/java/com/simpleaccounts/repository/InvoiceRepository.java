package com.simpleaccounts.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.rest.invoice.dto.InvoiceAmoutResultSet;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    List<Invoice> findAllByStatusAndType(Integer status,Integer Type);

    @Query(name = "InvoiceAmoutDetails", nativeQuery = true)
    List<InvoiceAmoutResultSet> getAmountDetails(@Param("placeOfSupplyId") Integer placeOfSupplyId, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);
    
    @Query(name = "ZeroRatedSupplies", nativeQuery = true)
    List<InvoiceAmoutResultSet> getZeroRatedSupplies(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);
    
    @Query(name = "ExemptSupplies", nativeQuery = true)
    List<InvoiceAmoutResultSet> getExemptSupplies(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);

    @Query(name = "ReverseChargeProvisions", nativeQuery = true)
    List<InvoiceAmoutResultSet> getReverseChargeProvisions(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);
    
    @Query(name = "StanderdRatedInvoice", nativeQuery = true)
   	List<InvoiceAmoutResultSet> geStanderdRatedInvoice(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);

    @Query(name = "StanderdRatedExpense", nativeQuery = true)
	List<InvoiceAmoutResultSet> geStanderdRatedExpense(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);

    @Query(name = "ReverseChargeEnabledExpense", nativeQuery = true)
    List<InvoiceAmoutResultSet> getReverseChargeForExpense(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("editFlag") Boolean editFlag);

    List<Invoice> findAllByDeleteFlag(boolean deleteFlag);

    @Query(value = "SELECT * FROM Invoice i WHERE i.contact_id = :contact AND i.type = :type AND i.cn_created_on_paid_invoice = true " +
            "AND i.delete_flag = false AND i.invoice_date BETWEEN :startDate AND :endDate", nativeQuery = true)
    List<Invoice> getInvoicesForReport(@Param("contact") Integer contactId, @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate, @Param("type") Integer type);
}
