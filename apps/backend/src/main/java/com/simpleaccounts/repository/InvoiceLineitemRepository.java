package com.simpleaccounts.repository;

import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceLineitemRepository extends JpaRepository<InvoiceLineItem,String> {

    List<InvoiceLineItem> findAllByTrnsactioncCategory(TransactionCategory transactionCategory);
}
