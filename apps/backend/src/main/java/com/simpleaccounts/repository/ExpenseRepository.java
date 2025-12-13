package com.simpleaccounts.repository;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Integer> {

    List<Expense> findAllByTransactionCategory(TransactionCategory transactionCategory);

    List<Expense> findAllByDeleteFlag(boolean deleteFlag);
}
