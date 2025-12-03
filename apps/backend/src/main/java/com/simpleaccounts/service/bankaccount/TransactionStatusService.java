package com.simpleaccounts.service.bankaccount;

import java.util.List;

import com.simpleaccounts.entity.TransactionStatus;
import com.simpleaccounts.service.SimpleAccountsService;

public abstract class TransactionStatusService extends SimpleAccountsService<Integer, TransactionStatus> {

	public abstract List<TransactionStatus> findAllTransactionStatues();

	public abstract List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);

	//public abstract void deleteList(List<TransactionStatus> trnxStatusList);
}
