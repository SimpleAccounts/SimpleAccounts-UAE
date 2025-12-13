package com.simpleaccounts.repository;

import com.simpleaccounts.entity.TransactionExplanation;
import com.simpleaccounts.entity.TransactionExplinationLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionExplanationLineItemRepository extends JpaRepository<TransactionExplinationLineItem, Integer> {

    public List<TransactionExplinationLineItem> getTransactionExplinationLineItemsByTransactionExplanation(TransactionExplanation transactionExplanation);

    public TransactionExplinationLineItem getTransactionExplinationLineItemByReferenceId(Integer id);

}
