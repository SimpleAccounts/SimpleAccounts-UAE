package com.simpleaccounts.repository;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerInvoiceReceiptRepository extends  JpaRepository<CustomerInvoiceReceipt, Integer>{

    List<CustomerInvoiceReceipt> findByCustomerInvoiceIdAndDeleteFlag(Integer invoiceId, Boolean deleteFlag);
}
