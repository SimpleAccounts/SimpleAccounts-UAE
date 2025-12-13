package com.simpleaccounts.entity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

   List<Payment> findByInvoiceId(Integer invoiceId);
}