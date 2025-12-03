package com.simpleaccounts.entity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

   List<Payment> findByInvoiceId(Integer invoiceId);
}