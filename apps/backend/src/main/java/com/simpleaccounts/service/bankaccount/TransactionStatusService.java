package com.simpleaccounts.service.bankaccount;

import com.simpleaccounts.entity.TransactionStatus;
import com.simpleaccounts.service.SimpleAccountsService;
import java.util.List;

public abstract class TransactionStatusService extends SimpleAccountsService<Integer, TransactionStatus> {

	public abstract List<TransactionStatus> findAllTransactionStatues();

	public abstract List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);

}
