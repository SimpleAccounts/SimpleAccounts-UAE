package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.QuotationInvoiceRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuotationInvoiceRepository extends JpaRepository <QuotationInvoiceRelation,Integer> {

    QuotationInvoiceRelation findByInvoice(Invoice invoice);
}
