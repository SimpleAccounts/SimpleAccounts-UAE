package com.simplevat.repository;

import com.simplevat.entity.CustomerInvoiceReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerInvoiceReceiptRepository extends  JpaRepository<CustomerInvoiceReceipt, Integer>{

    List<CustomerInvoiceReceipt> findByCustomerInvoiceIdAndDeleteFlag(Integer invoiceId, Boolean deleteFlag);
}
