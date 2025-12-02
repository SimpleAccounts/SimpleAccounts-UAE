package com.simplevat.repository;

import com.simplevat.entity.TransactionExplanation;
import com.simplevat.entity.TransactionExplinationLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionExplanationLineItemRepository extends JpaRepository<TransactionExplinationLineItem, Integer> {

    public List<TransactionExplinationLineItem> getTransactionExplinationLineItemsByTransactionExplanation(TransactionExplanation transactionExplanation);

    public TransactionExplinationLineItem getTransactionExplinationLineItemByReferenceId(Integer id);

}
