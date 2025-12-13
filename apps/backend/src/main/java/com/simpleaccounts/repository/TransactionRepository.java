package com.simpleaccounts.repository;

import com.simpleaccounts.entity.bankaccount.Transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction,Integer> {

    @Query(value = "SELECT * FROM transaction ORDER BY transaction_date ASC LIMIT 1 ", nativeQuery = true)
    Transaction getFirstRecord();

    @Query(value = "SELECT * FROM transaction WHERE bank_account_id = :bankId AND delete_flag = false AND transaction_explination_status IN ('FULL', 'RECONCILED') AND transaction_date BETWEEN :startDate AND :endDate ORDER BY transaction_date ASC", nativeQuery = true)
    List<Transaction> getTransactionForDashboard(Integer bankId, LocalDateTime startDate, LocalDateTime endDate);

}
