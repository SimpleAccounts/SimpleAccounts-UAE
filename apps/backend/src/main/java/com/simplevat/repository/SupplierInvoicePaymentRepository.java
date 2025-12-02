package com.simplevat.repository;

import com.simplevat.entity.SupplierInvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierInvoicePaymentRepository extends JpaRepository <SupplierInvoicePayment, Integer> {
    List<SupplierInvoicePayment> findBySupplierInvoiceIdAndDeleteFlag (Integer invoiceId, Boolean deleteFlag);
}
