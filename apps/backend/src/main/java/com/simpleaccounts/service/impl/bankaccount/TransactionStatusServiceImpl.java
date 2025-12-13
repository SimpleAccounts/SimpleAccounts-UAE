package com.simpleaccounts.service.impl.bankaccount;

import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.dao.bankaccount.TransactionStatusDao;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionStatus;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestController;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("transactionStatusService")
public class TransactionStatusServiceImpl extends TransactionStatusService {

	private static final Logger LOGGER = LoggerFactory.getLogger(InvoiceRestController.class);

	private final TransactionStatusDao dao;

	private final JournalDao journalDao;

	private final JournalLineItemDao journalLineItemDao;

	public TransactionStatusServiceImpl(
			@Qualifier("transactionStatusDao") TransactionStatusDao dao,
			JournalDao journalDao,
			JournalLineItemDao journalLineItemDao) {
		this.dao = dao;
		this.journalDao = journalDao;
		this.journalLineItemDao = journalLineItemDao;
	}

	@Override
	public TransactionStatusDao getDao() {
		return dao;
	}

	@Override
	public List<TransactionStatus> findAllTransactionStatues() {
		return getDao().findAllTransactionStatues();
	}

	@Override
	public List<TransactionStatus> findAllTransactionStatuesByTrnxId(Integer transactionId) {
		return getDao().findAllTransactionStatuesByTrnxId(transactionId);
	}

//	@Override
	public void deleteList(List<TransactionStatus> trnxStatusList) {
		try {
			for (TransactionStatus status : trnxStatusList) {

				for (JournalLineItem item : status.getReconsileJournal().getJournalLineItems()) {
					journalLineItemDao.delete(item);
				}
				getDao().delete(status);
				journalDao.delete(status.getReconsileJournal());
			}
		} catch (Exception e) {
			LOGGER.error("error = ", e);
		}
	}

	public void deleteForTransation(Integer transactionId) {
		List<TransactionStatus> explinationList = findAllTransactionStatuesByTrnxId(transactionId);

		if (explinationList != null && !explinationList.isEmpty()) {
			 deleteList(explinationList);
		}
	}
}
