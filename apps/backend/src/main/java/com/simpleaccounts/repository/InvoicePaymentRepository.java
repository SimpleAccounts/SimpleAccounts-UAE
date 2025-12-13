package com.simpleaccounts.repository;

import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoicePaymentRepository extends JpaRepository<SupplierInvoicePayment,String> {

    @Query(name = "findBySupplierInvoiceId", nativeQuery = true)
    List<SupplierInvoicePayment> findBySupplierInvoiceId(@Param("supplierInvoice") Integer supplierInvoice);
}