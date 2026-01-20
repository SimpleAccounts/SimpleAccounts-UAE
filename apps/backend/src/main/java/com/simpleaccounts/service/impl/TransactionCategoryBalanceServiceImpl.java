package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.TransactionCategoryBalanceDao;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import jakarta.persistence.LockModeType;
import jakarta.persistence.OptimisticLockException;
import org.hibernate.StaleStateException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

@Service
public class TransactionCategoryBalanceServiceImpl extends TransactionCategoryBalanceService {

	private final TransactionCategoryBalanceDao transactionCategoryBalanceDao;
	private final DateUtils dateUtils;

	private final TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@Autowired
	public TransactionCategoryBalanceServiceImpl(TransactionCategoryBalanceDao transactionCategoryBalanceDao,
												 DateUtils dateUtils,
												 TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService) {
		this.transactionCategoryBalanceDao = transactionCategoryBalanceDao;
		this.dateUtils = dateUtils;
		this.transactionCategoryClosingBalanceService = transactionCategoryClosingBalanceService;
	}

	@Override
	protected Dao<Integer, TransactionCategoryBalance> getDao() {
		return transactionCategoryBalanceDao;
	}

	@Override
	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		return transactionCategoryBalanceDao.getAll(filterMap,paginationModel);
	}

	@Override
	
	public synchronized BigDecimal updateRunningBalance(JournalLineItem lineItem) {
		if (lineItem != null && lineItem.getTransactionCategory() != null) {
			TransactionCategory category = lineItem.getTransactionCategory();

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", category);

			int attempts = 0;
			while (attempts < 8) {
				attempts++;
				TransactionCategoryBalance balance = getFirstElement(findByAttributes(param));

				if (balance == null) {
					balance = new TransactionCategoryBalance();
					balance.setTransactionCategory(category);
					balance.setCreatedBy(lineItem.getCreatedBy());
					balance.setOpeningBalance(lineItem.getCreditAmount()!=null && lineItem.getCreditAmount().compareTo(BigDecimal.ZERO)>0?lineItem.getCreditAmount():lineItem.getDebitAmount());
					balance.setEffectiveDate(dateUtils.get(lineItem.getJournal().getJournalDate().atStartOfDay()));
				} else {
					transactionCategoryBalanceDao.getEntityManager().lock(balance, LockModeType.PESSIMISTIC_WRITE);
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
				try {
					transactionCategoryBalanceDao.update(balance);
					transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
					return balance.getRunningBalance();
				} catch (ObjectOptimisticLockingFailureException | OptimisticLockException | StaleStateException e) {
					transactionCategoryBalanceDao.getEntityManager().clear();
					if (attempts >= 8) {
						if (balance.getId() != null) {
							int updated = transactionCategoryBalanceDao.getEntityManager()
									.createQuery(
											"update TransactionCategoryBalance set runningBalance = :runningBalance, openingBalance = :openingBalance, lastUpdateBy = :lastUpdateBy where id = :id")
									.setParameter("runningBalance", runningBalance)
									.setParameter("openingBalance", balance.getOpeningBalance())
									.setParameter("lastUpdateBy", lineItem.getCreatedBy())
									.setParameter("id", balance.getId())
									.executeUpdate();
							if (updated > 0) {
								transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
								return runningBalance;
							}
						}
						throw e;
					}
					try {
						Thread.sleep(50L * attempts);
					} catch (InterruptedException interruptedException) {
						Thread.currentThread().interrupt();
					}
				}
			}
		}

		return null;
	}

	public synchronized BigDecimal updateRunningBalanceAndOpeningBalance(JournalLineItem lineItem,Boolean updateOpeningBalance) {
		if (lineItem != null && lineItem.getTransactionCategory() != null) {
			TransactionCategory category = lineItem.getTransactionCategory();

			Map<String, Object> param = new HashMap<>();
			param.put("transactionCategory", category);

			int attempts = 0;
			while (attempts < 8) {
				attempts++;
				TransactionCategoryBalance balance = getFirstElement(findByAttributes(param));

				if (balance == null) {
					balance = new TransactionCategoryBalance();
					balance.setTransactionCategory(category);
					balance.setCreatedBy(lineItem.getCreatedBy());
					balance.setOpeningBalance(lineItem.getCreditAmount()!=null?lineItem.getCreditAmount():lineItem.getDebitAmount());
					balance.setRunningBalance(lineItem.getCreditAmount()!=null?lineItem.getCreditAmount():lineItem.getDebitAmount());
					balance.setEffectiveDate(dateUtils.get(lineItem.getJournal().getJournalDate().atStartOfDay()));
				} else {
					transactionCategoryBalanceDao.getEntityManager().lock(balance, LockModeType.PESSIMISTIC_WRITE);
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
				if(Boolean.TRUE.equals(updateOpeningBalance)&& runningBalance!=null && runningBalance.longValue()<0)
					balance.setOpeningBalance(runningBalance.negate());
				else if(Boolean.TRUE.equals(updateOpeningBalance)&& runningBalance!=null)
					balance.setOpeningBalance(runningBalance);
				try {
					transactionCategoryBalanceDao.update(balance);
					transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
					return balance.getRunningBalance();
				} catch (ObjectOptimisticLockingFailureException | OptimisticLockException | StaleStateException e) {
					transactionCategoryBalanceDao.getEntityManager().clear();
					if (attempts >= 8) {
						if (balance.getId() != null) {
							int updated = transactionCategoryBalanceDao.getEntityManager()
									.createQuery(
											"update TransactionCategoryBalance set runningBalance = :runningBalance, openingBalance = :openingBalance, lastUpdateBy = :lastUpdateBy where id = :id")
									.setParameter("runningBalance", runningBalance)
									.setParameter("openingBalance", balance.getOpeningBalance())
									.setParameter("lastUpdateBy", lineItem.getCreatedBy())
									.setParameter("id", balance.getId())
									.executeUpdate();
							if (updated > 0) {
								transactionCategoryClosingBalanceService.updateClosingBalance(lineItem);
								return runningBalance;
							}
						}
						throw e;
					}
					try {
						Thread.sleep(50L * attempts);
					} catch (InterruptedException interruptedException) {
						Thread.currentThread().interrupt();
					}
				}
			}
		}
		return null;
	}
}
