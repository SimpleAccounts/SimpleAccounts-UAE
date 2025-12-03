package com.simpleaccounts.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionCategoryBalanceDao;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryBalanceService;

@Service
public class TransactionCategoryBalanceServiceImpl extends TransactionCategoryBalanceService {

	@Autowired
	private TransactionCategoryBalanceDao transactionCategoryBalanceDao;
	@Autowired
	private DateUtils dateUtils;

	@Autowired
	private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@Override
	protected Dao<Integer, TransactionCategoryBalance> getDao() {
		return transactionCategoryBalanceDao;
	}

	@Override
	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		return transactionCategoryBalanceDao.getAll(filterMap,paginationModel);
	}

	@Override
	// TODO Remain for update completed create and delete
	// TODO Need to split this method as get amount and update TransactionCategoryBalance
	public synchronized BigDecimal updateRunningBalance(JournalLineItem lineItem) {
		List<TransactionCategoryBalance> balanceList = new ArrayList<>();
		if (lineItem != null) {
			TransactionCategory category = lineItem.getTransactionCategory();

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", category);

			TransactionCategoryBalance balance = getFirstElement(findByAttributes(param));

			if (balance == null) {
				balance = new TransactionCategoryBalance();
				balance.setTransactionCategory(category);
				balance.setCreatedBy(lineItem.getCreatedBy());
				balance.setOpeningBalance(lineItem.getCreditAmount()!=null && lineItem.getCreditAmount().compareTo(BigDecimal.ZERO)==1?lineItem.getCreditAmount():lineItem.getDebitAmount());
				balance.setEffectiveDate(dateUtils.get(lineItem.getJournal().getJournalDate().atStartOfDay()));
			}

			boolean isDelated = lineItem.getDeleteFlag();
			boolean isDebit = (lineItem.getDebitAmount() != null && lineItem.getDebitAmount().compareTo(BigDecimal.ZERO) !=0)
					? Boolean.TRUE
					: Boolean.FALSE;
			BigDecimal runningBalance = balance.getRunningBalance() != null ? balance.getRunningBalance()
					: BigDecimal.ZERO;
			if (!isDelated) {
				if (isDebit) {
					runningBalance = runningBalance
							.subtract(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : BigDecimal.ZERO);
				} else {
					runningBalance = runningBalance
							.add(lineItem.getCreditAmount() != null ? lineItem.getCreditAmount() : BigDecimal.ZERO);
				}
			} else {
				if (isDebit) {
					runningBalance = runningBalance
							.add(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : BigDecimal.ZERO);
				} else {
					runningBalance = runningBalance.subtract(
							lineItem.getCreditAmount() != null ? lineItem.getCreditAmount() : BigDecimal.ZERO);
				}
			}
			balance.setRunningBalance(runningBalance);
			balanceList.add(balance);
			transactionCategoryBalanceDao.update(balance);
			transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
			return balance.getRunningBalance();
		}

		return null;
	}

	public synchronized BigDecimal updateRunningBalanceAndOpeningBalance(JournalLineItem lineItem,Boolean updateOpeningBalance) {
		List<TransactionCategoryBalance> balanceList = new ArrayList<>();
		if (lineItem != null) {
			TransactionCategory category = lineItem.getTransactionCategory();

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", category);

			TransactionCategoryBalance balance = getFirstElement(findByAttributes(param));

			if (balance == null) {
				balance = new TransactionCategoryBalance();
				balance.setTransactionCategory(category);
				balance.setCreatedBy(lineItem.getCreatedBy());
				balance.setOpeningBalance(lineItem.getCreditAmount()!=null?lineItem.getCreditAmount():lineItem.getDebitAmount());
				balance.setRunningBalance(lineItem.getCreditAmount()!=null?lineItem.getCreditAmount():lineItem.getDebitAmount());
				balance.setEffectiveDate(dateUtils.get(lineItem.getJournal().getJournalDate().atStartOfDay()));
			}

			boolean isDelated = lineItem.getDeleteFlag();
			boolean isDebit = (lineItem.getDebitAmount() != null && lineItem.getDebitAmount().intValue()!=0)
					? Boolean.TRUE
					: Boolean.FALSE;
			BigDecimal runningBalance = balance.getRunningBalance() != null ? balance.getRunningBalance()
					: BigDecimal.ZERO;
			if (!isDelated) {
				if (isDebit) {
					runningBalance = runningBalance
							.subtract(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : BigDecimal.ZERO);
				} else {
					runningBalance = runningBalance
							.add(lineItem.getCreditAmount() != null ? lineItem.getCreditAmount() : BigDecimal.ZERO);
				}
			} else {
				if (isDebit) {
					runningBalance = runningBalance
							.add(lineItem.getDebitAmount() != null ? lineItem.getDebitAmount() : BigDecimal.ZERO);
				} else {
					runningBalance = runningBalance.subtract(
							lineItem.getCreditAmount() != null ? lineItem.getCreditAmount() : BigDecimal.ZERO);
				}
			}
			balance.setRunningBalance(runningBalance);
			if(updateOpeningBalance&& runningBalance!=null && runningBalance.longValue()<0)
				balance.setOpeningBalance(runningBalance.negate());
			else if(updateOpeningBalance&& runningBalance!=null)
				balance.setOpeningBalance(runningBalance);
			balanceList.add(balance);
			transactionCategoryBalanceDao.update(balance);
			transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
			return balance.getRunningBalance();
		}
		return null;
	}
}
