package com.simpleaccounts.dao.bankaccount;

import java.util.List;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.TransactionStatus;

public interface TransactionStatusDao extends Dao<Integer, TransactionStatus> {

	public List<TransactionStatus> findAllTransactionStatues();

	public List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);
}
