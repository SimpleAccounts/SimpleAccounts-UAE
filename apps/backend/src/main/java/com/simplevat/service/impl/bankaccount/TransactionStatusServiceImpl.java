package com.simplevat.service.impl.bankaccount;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.simplevat.dao.JournalDao;
import com.simplevat.dao.JournalLineItemDao;
import com.simplevat.dao.bankaccount.TransactionStatusDao;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.TransactionStatus;
import com.simplevat.rest.invoicecontroller.InvoiceRestController;
import com.simplevat.service.bankaccount.TransactionStatusService;

@Service("transactionStatusService")
public class TransactionStatusServiceImpl extends TransactionStatusService {

	private static final Logger LOGGER = LoggerFactory.getLogger(InvoiceRestController.class);

	@Autowired
	@Qualifier(value = "transactionStatusDao")
	private TransactionStatusDao dao;

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

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
