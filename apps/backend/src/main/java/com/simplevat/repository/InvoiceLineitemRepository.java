package com.simplevat.repository;

import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.entity.InvoiceLineItem;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceLineitemRepository extends JpaRepository<InvoiceLineItem,String> {

    List<InvoiceLineItem> findAllByTrnsactioncCategory(TransactionCategory transactionCategory);
}
