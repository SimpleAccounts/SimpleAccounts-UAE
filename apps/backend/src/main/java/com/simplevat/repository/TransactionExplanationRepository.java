package com.simplevat.repository;

import com.simplevat.entity.TransactionExplanation;
import com.simplevat.entity.bankaccount.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionExplanationRepository extends JpaRepository<TransactionExplanation, Integer> {
    public List<TransactionExplanation> getTransactionExplanationsByTransaction(Transaction transaction);

    public TransactionExplanation getByTransactionAndDeleteFlag(Transaction transaction,boolean deleteFlag);
}
