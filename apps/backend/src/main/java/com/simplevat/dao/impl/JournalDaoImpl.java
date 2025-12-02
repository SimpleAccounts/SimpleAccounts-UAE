package com.simplevat.dao.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.dao.JournalLineItemDao;
import com.simplevat.service.JournalLineItemService;
import com.simplevat.service.JournalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.JournalFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.JournalDao;
import com.simplevat.entity.Journal;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.TransactionCategoryBalanceService;

import javax.persistence.Query;
@Slf4j
@Repository
public class JournalDaoImpl extends AbstractDao<Integer, Journal> implements JournalDao {

	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Autowired
	private TransactionCategoryBalanceService transactionCategoryBalanceService;

	@Autowired
	private JournalLineItemDao journalLineItemDao;

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Journal journal = findByPK(id);
				journal.setDeleteFlag(Boolean.TRUE);
				if (journal.getJournalLineItems() != null && !journal.getJournalLineItems().isEmpty()) {
					for (JournalLineItem journalLineItem : journal.getJournalLineItems()) {
						journalLineItem.setDeleteFlag(true);
						transactionCategoryBalanceService.updateRunningBalance(journalLineItem);
						log.info(" delete Journal lineitems:: update: {} " ,journalLineItem.getReferenceId());
						journalLineItemDao.delete(journalLineItem);
					}
				}
				delete(journal);
			}
		}
	}
	@Override
	@Transactional
	public void deleteAndUpdateByIds(List<Integer> ids,Boolean updateOpeningBalance) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Journal journal = findByPK(id);
				journal.setDeleteFlag(Boolean.TRUE);
				if (journal.getJournalLineItems() != null && !journal.getJournalLineItems().isEmpty()) {
					for (JournalLineItem journalLineItem : journal.getJournalLineItems()) {
						journalLineItem.setDeleteFlag(true);
						transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(journalLineItem ,updateOpeningBalance);
						journalLineItemDao.delete(journalLineItem);
					}
				}
				delete(journal);
			}
		}
	}
	@Override
	public PaginationResponseModel getJornalList(Map<JournalFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {

		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel
				.setSortingCol(dataTableUtil.getColName((paginationModel.getSortingCol()), DatatableSortingFilterConstant.JOURNAL));
		PaginationResponseModel resposne = new PaginationResponseModel();
		Integer count = this.getResultCount(dbFilters);
		if(count<10) paginationModel.setPageNo(0);
		resposne.setCount(count);
		resposne.setData(this.executeQuery(dbFilters, paginationModel));
		return resposne;
	}

	public Journal getJournalByReferenceId(Integer transactionId)
	{
		Query query = getEntityManager().createNamedQuery("getJournalByReferenceId");
		query.setParameter("referenceId", transactionId);

		List<Journal> resultList = query.getResultList();
		return resultList.size()==0?null:resultList.get(0);
	}
	public Journal getJournalByReferenceIdAndType(Integer transactionId, PostingReferenceTypeEnum refType) {
		Query query = getEntityManager().createNamedQuery("getJournalByReferenceIdAndType");
		query.setParameter("referenceId", transactionId);
		query.setParameter("referenceType", refType);

		List<Journal> resultList = query.getResultList();
		return resultList.size() == 0 ? null : resultList.get(0);
	}
}
