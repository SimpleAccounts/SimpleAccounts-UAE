package com.simplevat.repository;

import com.simplevat.entity.Invoice;
import com.simplevat.entity.QuotationInvoiceRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuotationInvoiceRepository extends JpaRepository <QuotationInvoiceRelation,Integer> {

    QuotationInvoiceRelation findByInvoice(Invoice invoice);
}
