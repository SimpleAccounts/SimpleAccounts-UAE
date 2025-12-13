package com.simpleaccounts.repository;

import com.simpleaccounts.entity.TransactionExplanation;
import com.simpleaccounts.entity.TransactionExplinationLineItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionExplanationLineItemRepository extends JpaRepository<TransactionExplinationLineItem, Integer> {

    public List<TransactionExplinationLineItem> getTransactionExplinationLineItemsByTransactionExplanation(TransactionExplanation transactionExplanation);

    public TransactionExplinationLineItem getTransactionExplinationLineItemByReferenceId(Integer id);

}
