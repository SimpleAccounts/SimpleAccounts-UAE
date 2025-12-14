package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.TransactionStatus;
import java.util.List;

public interface TransactionStatusDao extends Dao<Integer, TransactionStatus> {

	public List<TransactionStatus> findAllTransactionStatues();

	public List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);
}
