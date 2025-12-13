package com.simpleaccounts.repository;

import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductLineItemRepository extends JpaRepository<ProductLineItem, Integer> {
    List<ProductLineItem> findAllByTransactioncategory(TransactionCategory transactionCategory);
}
