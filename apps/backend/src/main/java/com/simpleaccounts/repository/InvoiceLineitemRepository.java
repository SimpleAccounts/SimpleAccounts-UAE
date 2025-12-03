package com.simpleaccounts.repository;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.InvoiceLineItem;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceLineitemRepository extends JpaRepository<InvoiceLineItem,String> {

    List<InvoiceLineItem> findAllByTrnsactioncCategory(TransactionCategory transactionCategory);
}
