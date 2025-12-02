package com.simplevat.repository;


import com.simplevat.entity.Expense;
import com.simplevat.entity.TransactionExpenses;
import com.simplevat.entity.bankaccount.TransactionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface TransactionExpensesRepository extends JpaRepository<TransactionExpenses,Integer> {

    TransactionExpenses findByExpense(Expense expense);

    @Query("SELECT Pc FROM TransactionCategory Pc WHERE Pc.transactionCategoryDescription In ('Admin Expense','Current Asset','Cost Of Goods Sold','Fixed Asset','Other Current Asset','Other Liability','Other Expense')")
    List<TransactionCategory> getTransactionCategory(@Param("name") String name);
}
