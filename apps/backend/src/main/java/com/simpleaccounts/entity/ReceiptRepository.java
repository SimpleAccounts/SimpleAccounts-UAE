package com.simpleaccounts.entity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptRepository extends JpaRepository<Receipt, Integer> {

   List<Receipt> findByInvoiceId(Integer invoiceId);
}