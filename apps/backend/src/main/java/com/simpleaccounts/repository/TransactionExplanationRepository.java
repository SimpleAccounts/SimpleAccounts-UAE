package com.simpleaccounts.repository;

import com.simpleaccounts.entity.TransactionExplanation;
import com.simpleaccounts.entity.bankaccount.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionExplanationRepository extends JpaRepository<TransactionExplanation, Integer> {
    public List<TransactionExplanation> getTransactionExplanationsByTransaction(Transaction transaction);

    public TransactionExplanation getByTransactionAndDeleteFlag(Transaction transaction,boolean deleteFlag);
}
