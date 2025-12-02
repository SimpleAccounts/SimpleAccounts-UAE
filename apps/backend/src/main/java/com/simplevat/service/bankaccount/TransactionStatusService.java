package com.simplevat.service.bankaccount;

import java.util.List;

import com.simplevat.entity.TransactionStatus;
import com.simplevat.service.SimpleVatService;

public abstract class TransactionStatusService extends SimpleVatService<Integer, TransactionStatus> {

	public abstract List<TransactionStatus> findAllTransactionStatues();

	public abstract List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId);

	//public abstract void deleteList(List<TransactionStatus> trnxStatusList);
}
