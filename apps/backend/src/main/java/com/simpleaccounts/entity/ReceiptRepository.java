package com.simpleaccounts.entity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Integer> {

   List<Receipt> findByInvoiceId(Integer invoiceId);
}