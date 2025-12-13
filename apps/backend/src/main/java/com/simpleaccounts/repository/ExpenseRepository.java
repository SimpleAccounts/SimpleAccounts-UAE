package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Integer> {

    List<Expense> findAllByTransactionCategory(TransactionCategory transactionCategory);

    List<Expense> findAllByDeleteFlag(boolean deleteFlag);
}
