package com.simplevat.repository;

import com.simplevat.entity.Product;
import com.simplevat.entity.ProductLineItem;
import com.simplevat.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductLineItemRepository extends JpaRepository<ProductLineItem, Integer> {
    List<ProductLineItem> findAllByTransactioncategory(TransactionCategory transactionCategory);
}
