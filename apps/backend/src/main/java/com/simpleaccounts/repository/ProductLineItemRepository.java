package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductLineItemRepository extends JpaRepository<ProductLineItem, Integer> {
    List<ProductLineItem> findAllByTransactioncategory(TransactionCategory transactionCategory);
}
