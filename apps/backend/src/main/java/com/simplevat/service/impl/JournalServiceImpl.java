package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.PostingReferenceTypeEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.JournalFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.JournalDao;
import com.simplevat.entity.Journal;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.JournalService;
import com.simplevat.service.TransactionCategoryBalanceService;

@Service("JournalServiceImpl")
public class JournalServiceImpl extends JournalService {

	@Autowired
	private JournalDao journalDao;

	@Autowired
	private TransactionCategoryBalanceService transactionCategoryBalanceService;

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
