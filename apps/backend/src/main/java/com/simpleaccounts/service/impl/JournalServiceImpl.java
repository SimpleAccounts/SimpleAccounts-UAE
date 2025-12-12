package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import java.util.Map;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;

@Service("JournalServiceImpl")
@RequiredArgsConstructor
public class JournalServiceImpl extends JournalService {

	private final JournalDao journalDao;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	@Override
	public PaginationResponseModel getJornalList(Map<JournalFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		return journalDao.getJornalList(filterMap, paginationModel);
	}
	public  Journal getJournalByReferenceId(Integer transactionId)
	{
		return journalDao.getJournalByReferenceId(transactionId);
	}
	public  Journal getJournalByReferenceIdAndType(Integer transactionId, PostingReferenceTypeEnum refType)
	{
		return journalDao.getJournalByReferenceIdAndType(transactionId,refType);
	}
	@Override
	public void deleteByIds(List<Integer> ids) {
		journalDao.deleteByIds(ids);
	}

	@Override
	public void deleteAndUpdateByIds(List<Integer> ids,Boolean updateOpeningBalance) {
		journalDao.deleteAndUpdateByIds(ids,updateOpeningBalance);
	}

	@Override
	protected Dao<Integer, Journal> getDao() {
		return journalDao;
	}

	@Override
	public void persist(Journal journal) {
		for (JournalLineItem lineItem : journal.getJournalLineItems()) {
			lineItem.setCurrentBalance(transactionCategoryBalanceService.updateRunningBalance(lineItem));
		}
		super.persist(journal);

	}
	public void updateOpeningBalance(Journal journal,Boolean updateOpeningBalance)
	{
		for (JournalLineItem lineItem : journal.getJournalLineItems()) {
			lineItem.setCurrentBalance(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem,updateOpeningBalance));
		}
		super.persist(journal);
	}
}
