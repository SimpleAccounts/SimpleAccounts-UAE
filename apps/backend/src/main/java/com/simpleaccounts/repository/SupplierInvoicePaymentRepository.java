package com.simpleaccounts.repository;

import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierInvoicePaymentRepository extends JpaRepository <SupplierInvoicePayment, Integer> {
    List<SupplierInvoicePayment> findBySupplierInvoiceIdAndDeleteFlag (Integer invoiceId, Boolean deleteFlag);
}
