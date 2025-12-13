package com.simpleaccounts.repository;

import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceReceiptRepository extends JpaRepository<CustomerInvoiceReceipt,String> {

    @Query(name = "findByCustomerInvoiceId", nativeQuery = true)
    List<CustomerInvoiceReceipt> findByCustomerInvoiceId(@Param("customerInvoice") Integer customerInvoice);
}
