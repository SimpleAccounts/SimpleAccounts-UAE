package com.simplevat.dao.bankaccount;

import java.util.List;

import com.simplevat.dao.Dao;
import com.simplevat.entity.TransactionStatus;

public interface TransactionStatusDao extends Dao<Integer, TransactionStatus> {

	public List<TransactionStatus> findAllTransactionStatues();

	public List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);
}
