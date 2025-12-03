package com.simpleaccounts.dao.impl.bankaccount;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.model.TransactionReportRestModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.TemporalType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.bankaccount.TransactionDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionView;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.utils.CommonUtil;
import com.simpleaccounts.utils.DateUtils;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;
import javax.persistence.TypedQuery;

@Repository
public class TransactionDaoImpl extends AbstractDao<Integer, Transaction> implements TransactionDao {

	private static final Logger LOGGER = LoggerFactory.getLogger(TransactionDaoImpl.class);
	@Autowired
	private DateUtils dateUtils;

	@Override
	public Transaction updateOrCreateTransaction(Transaction transaction) {
		return this.update(transaction);
	}

	@Override
	public List<Object[]> getCashInData(Date startDate, Date endDate, Integer bankId) {
		List<Object[]> cashInData = new ArrayList<>(0);
		try {
			String queryString = "select "
					+ "sum(t.transactionAmount) as total, CONCAT(MONTH(t.transactionDate),'-' , Year(t.transactionDate)) as month "
					+ "from Transaction t "
					+ "where t.debitCreditFlag = 'c' and t.deleteFlag = false and t.transactionDate BETWEEN :startDate AND :endDate "
					+ (bankId != null ? " and t.bankAccount.bankAccountId =:bankId " : " ")
					+" and t.transactionExplinationStatusEnum in ('FULL','RECONCILED') "
					+ "group by CONCAT(MONTH(t.transactionDate),'-' , Year(t.transactionDate))";

			Query query = getEntityManager().createQuery(queryString)
					.setParameter(CommonColumnConstants.START_DATE, dateUtils.get(startDate))
					.setParameter(CommonColumnConstants.END_DATE, dateUtils.get(endDate));
			if (bankId != null) {
				query.setParameter("bankId", bankId);
			}
			cashInData = query.getResultList();
		} catch (Exception e) {
			LOGGER.error("Erroe is ", e);
		}
		return cashInData;
	}

	@Override
	public List<Object[]> getCashOutData(Date startDate, Date endDate, Integer bankId) {
		List<Object[]> cashOutData = new ArrayList<>(0);
		try {
			String queryString = "select "
					+ "sum(t.transactionAmount) as total, CONCAT(MONTH(t.transactionDate),'-' , Year(t.transactionDate)) as month "
					+ "from Transaction t "
					+ "where t.debitCreditFlag = 'd' and t.deleteFlag = false and t.transactionDate BETWEEN :startDate AND :endDate "
					+ (bankId != null ? " and t.bankAccount.bankAccountId =:bankId " : " ")
					+" and t.transactionExplinationStatusEnum in ('FULL','RECONCILED') "
					+ "group by CONCAT(MONTH(t.transactionDate),'-' , Year(t.transactionDate))";
			Query query = getEntityManager().createQuery(queryString)
					.setParameter(CommonColumnConstants.START_DATE, dateUtils.get(startDate))
					.setParameter(CommonColumnConstants.END_DATE, dateUtils.get(endDate));
			if (bankId != null) {
				query.setParameter("bankId", bankId);
			}
			cashOutData = query.getResultList();
		} catch (Exception e) {
			LOGGER.error("Erroe is ", e);
		}
		return cashOutData;
	}

	@Override
	public Transaction getBeforeTransaction(Transaction transaction) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.transactionDate <= :transactionDate and t.transactionId < :transactionId and t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate DESC",
				Transaction.class);
		query.setParameter("transactionDate", transaction.getTransactionDate());
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, transaction.getBankAccount().getBankAccountId());
		query.setParameter("transactionId", transaction.getTransactionId());
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList.get(transactionList.size() - 1);
		}
		return null;
	}

	@Override
	public List<Transaction> getAfterTransaction(Transaction transaction) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.transactionDate > :transactionDate and t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate ASC",
				Transaction.class);
		query.setParameter("transactionDate", transaction.getTransactionDate());
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, transaction.getBankAccount().getBankAccountId());
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionReportRestModel> getTransactionsReport(Integer transactionTypeId,
																  Integer transactionCategoryId, Date startDate, Date endDate, Integer bankAccountId, Integer pageNo,
																  Integer pageSize) {
		TypedQuery<Transaction> query = getTransactionTypedQuery(transactionTypeId, transactionCategoryId, startDate, endDate);
		int maxRows = CommonUtil.DEFAULT_ROW_COUNT;
		if (pageSize != null) {
			maxRows = pageSize;
		}
		int start = 0;
		if (pageNo != null) {
			pageNo = pageNo * maxRows;
			start = pageNo;
		}
		query.setFirstResult(start);
		query.setMaxResults(maxRows);
		List<TransactionReportRestModel> transactionReportRestModelList = new ArrayList<>();
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			for (Transaction transaction : transactionList) {
				TransactionReportRestModel transactionReportRestModel = new TransactionReportRestModel();
				if (transaction.getBankAccount() != null) {
					transactionReportRestModel.setBankAccount(transaction.getBankAccount().getBankAccountName());
				}
				transactionReportRestModel.setTransactionAmount(transaction.getTransactionAmount());
				if (transaction.getExplainedTransactionCategory() != null) {
					transactionReportRestModel.setTransactionCategory(
							transaction.getExplainedTransactionCategory().getTransactionCategoryName());
				}
				transactionReportRestModel.setTransactionDate(transaction.getTransactionDate());
				transactionReportRestModel.setTransactionDescription(transaction.getTransactionDescription());
				transactionReportRestModel.setTransactionId(transaction.getTransactionId());
				if (transaction.getChartOfAccount() != null) {
					transactionReportRestModel
							.setTransactionType(transaction.getChartOfAccount().getChartOfAccountName());
				}
				transactionReportRestModelList.add(transactionReportRestModel);
			}
		}
		return transactionReportRestModelList;
	}

	private TypedQuery<Transaction> getTransactionTypedQuery(Integer transactionTypeId, Integer transactionCategoryId, Date startDate, Date endDate) {
		StringBuilder builder = new StringBuilder();
		if (transactionTypeId != null) {
			builder.append("and t.transactionType.transactionTypeCode =:transactionTypeCode ");
		}
		if (transactionCategoryId != null) {
			builder.append("and t.explainedTransactionCategory.transactionCategoryId =:transactionCategoryId ");
		}
		if (startDate != null && endDate != null) {
			builder.append("and t.transactionDate BETWEEN :startDate AND :lastDate ");
		}
		TypedQuery<Transaction> query = getEntityManager()
				.createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.transactionExplinationStatusEnum = 'FULL' " + builder.toString()
						+ "ORDER BY t.transactionDate ASC", Transaction.class);
		if (transactionTypeId != null) {
			query.setParameter("transactionTypeCode", transactionTypeId);
		}
		if (transactionCategoryId != null) {
			query.setParameter("transactionCategoryId", transactionCategoryId);
		}
		if (startDate != null && endDate != null) {
			query.setParameter(CommonColumnConstants.START_DATE, Instant.ofEpochMilli(DateUtils.getStartDate(startDate).getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime());
			query.setParameter("lastDate", Instant.ofEpochMilli(DateUtils.getEndDate(endDate).getTime())
					.atZone(ZoneId.systemDefault()).toLocalDateTime());
		}
		return query;
	}

	@Override
	public List<Transaction> getTransactionsByDateRangeAndBankAccountId(BankAccount bankAccount, Date startDate,
																		Date lastDate) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId and t.transactionDate BETWEEN :startDate AND :lastDate ORDER BY t.transactionDate ASC",
				Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccount.getBankAccountId());
		query.setParameter(CommonColumnConstants.START_DATE,
				Instant.ofEpochMilli(startDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
		query.setParameter("lastDate",
				Instant.ofEpochMilli(lastDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getChildTransactionListByParentId(int parentId) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.parentTransaction.transactionId =:parentId ORDER BY t.transactionDate ASC",
				Transaction.class);
		query.setParameter("parentId", parentId);
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getAllTransactionsByRefId(int transactionRefType, int transactionRefId) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.referenceType = :referenceType and t.referenceId = :referenceId ORDER BY t.transactionDate ASC",
				Transaction.class);
		query.setParameter("referenceType", transactionRefType);
		query.setParameter("referenceId", transactionRefId);
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getAllParentTransactions(BankAccount bankAccount) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.parentTransaction = null and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate DESC",
				Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccount.getBankAccountId());
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getAllTransactionListByBankAccountId(Integer bankAccountId) {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE  t.bankAccount.bankAccountId =:bankAccountId ORDER BY t.transactionDate ASC",
				Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<Transaction> getAllTransactions() {
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.deleteFlag = false ORDER BY t.transactionDate ASC",
				Transaction.class);
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionView> getAllTransactionViewList(Integer bankAccountId) {
		TypedQuery<TransactionView> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId ORDER BY t.transactionDate DESC",
				TransactionView.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		List<TransactionView> transactionViewList = query.getResultList();
		if (transactionViewList != null && !transactionViewList.isEmpty()) {
			return transactionViewList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionView> getChildTransactionViewListByParentId(Integer parentTransaction) {
		TypedQuery<TransactionView> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionView t WHERE t.parentTransaction =:parentTransaction ORDER BY t.transactionDate ASC",
				TransactionView.class);
		query.setParameter("parentTransaction", parentTransaction);
		List<TransactionView> transactionViewList = query.getResultList();
		if (transactionViewList != null && !transactionViewList.isEmpty()) {
			return transactionViewList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionView> getTransactionViewList(int pageSize, Integer bankAccountId, int rowCount,
														Integer transactionStatus, Map<String, Object> filters, String sortField, String sortOrder) {
		StringBuilder builder = new StringBuilder("");
		StringBuilder filterBuilder = new StringBuilder("");
		for (String filedName : filters.keySet()) {
			Object filterValue = filters.get(filedName);
			if (filterValue != null && !((String) filterValue).isEmpty()) {
				filterBuilder.append(" And ").append(filedName).append(" like '%").append((String) filterValue)
						.append("%'");
			}
		}
		if (sortField != null) {
			filterBuilder.append(CommonColumnConstants.ORDER_BY).append(sortField)
					.append(sortOrder.equalsIgnoreCase("ASCENDING") ? " ASC," : " DESC,");
		} else {
			filterBuilder.append(CommonColumnConstants.ORDER_BY);
		}
		if (transactionStatus != null) {
			builder.append(" AND t.explanationStatusCode = ").append(transactionStatus);
		}
		TypedQuery<TransactionView> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId AND t.parentTransaction = null"
						+ builder.toString() + filterBuilder.toString()
						+ "  t.transactionDate DESC, t.transactionId DESC",
				TransactionView.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setFirstResult(pageSize);
		query.setMaxResults(rowCount);
		List<TransactionView> transactionViewList = query.getResultList();
		if (transactionViewList != null && !transactionViewList.isEmpty()) {
			return transactionViewList;
		}
		return new ArrayList<>();
	}

	@Override
	public Integer getTotalTransactionCountByBankAccountIdForLazyModel(Integer bankAccountId,
																	   Integer transactionStatus) {
		StringBuilder builder = new StringBuilder("");
		if (transactionStatus != null) {
			builder.append(" AND t.explanationStatusCode = ").append(transactionStatus);
		}
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM TransactionView t WHERE t.parentTransaction = null AND t.bankAccountId =:bankAccountId"
						+ builder.toString());
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTotalExplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM Transaction t WHERE t.bankAccount.bankAccountId =:bankAccountId AND t.transactionExplinationStatusEnum != :transactionExplinationStatusEnum" );
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setParameter("transactionExplinationStatusEnum", TransactionExplinationStatusEnum.NOT_EXPLAIN);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTotalUnexplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM TransactionView t WHERE t.parentTransaction = null AND t.bankAccountId =:bankAccountId AND t.explanationStatusCode =:explanationStatusCode");
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setParameter(CommonColumnConstants.EXPLANATION_STATUS_CODE, TransactionStatusConstant.UNEXPLAINED);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTotalPartiallyExplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM TransactionView t WHERE t.parentTransaction = null AND t.bankAccountId =:bankAccountId AND t.explanationStatusCode =:explanationStatusCode");
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setParameter(CommonColumnConstants.EXPLANATION_STATUS_CODE, TransactionStatusConstant.PARTIALLYEXPLIANED);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTotalAllTransactionCountByBankAccountId(Integer bankAccountId) {
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM TransactionView t WHERE t.parentTransaction = null AND t.bankAccountId =:bankAccountId");
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTransactionCountByBankAccountId(Integer bankAccountId) {
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM Transaction t WHERE t.bankAccount.bankAccountId =:bankAccountId and t.deleteFlag=false ");
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;
	}

	@Override
	public Integer getTransactionCountByRangeAndBankAccountId(int pageSize, Integer bankAccountId, int rowCount) {
		TypedQuery<TransactionView> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId AND t.parentTransaction = null ORDER BY t.transactionDate DESC",
				TransactionView.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setFirstResult(pageSize);
		query.setMaxResults(rowCount);
		List<TransactionView> transactionViewList = query.getResultList();
		if (transactionViewList != null && !transactionViewList.isEmpty()) {
			return transactionViewList.size();
		}
		return null;
	}

	@Override
	public List<Transaction> getParentTransactionListByRangeAndBankAccountId(int pageSize, Integer bankAccountId,
																			 int rowCount, Integer transactionStatus, Map<String, Object> filters, String sortField, String sortOrder) {
		StringBuilder builder = new StringBuilder("");
		StringBuilder filterBuilder = new StringBuilder("");
		if (transactionStatus != null) {
			builder.append(" AND t.transactionStatus.explainationStatusCode = ").append(transactionStatus);
		}
		for (String filedName : filters.keySet()) {
			Object filterValue = filters.get(filedName);
			if (filterValue != null && !((String) filterValue).isEmpty()) {
				filterBuilder.append(" And ").append(filedName).append(" like '%").append((String) filterValue)
						.append("%'");
			}
		}
		if (sortField != null) {
			filterBuilder.append(CommonColumnConstants.ORDER_BY).append(sortField)
					.append(sortOrder.equalsIgnoreCase("ASCENDING") ? " ASC," : " DESC,");
		} else {
			filterBuilder.append(CommonColumnConstants.ORDER_BY);
		}
		TypedQuery<Transaction> query = getEntityManager().createQuery(
				"SELECT t FROM Transaction t WHERE t.bankAccount.bankAccountId =:bankAccountId AND t.transactionExplinationStatusEnum t.parentTransaction IS NULL"
						+ builder.toString() + filterBuilder.toString() + "  t.transactionDate DESC",
				Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setFirstResult(pageSize);
		query.setMaxResults(rowCount);
		List<Transaction> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionView> getTransactionViewListByDateRang(Integer bankAccountId, Date startDate, Date endDate) {
		TypedQuery<TransactionView> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId AND t.parentTransaction = null AND t.transactionDate >=:startDate AND t.transactionDate <=:endDate ORDER BY t.transactionDate DESC, t.transactionId DESC",
				TransactionView.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankAccountId);
		query.setParameter(CommonColumnConstants.START_DATE, startDate, TemporalType.TIMESTAMP);
		query.setParameter(CommonColumnConstants.END_DATE, endDate, TemporalType.TIMESTAMP);
		List<TransactionView> transactionList = query.getResultList();
		if (transactionList != null && !transactionList.isEmpty()) {
			return transactionList;
		}
		return new ArrayList<>();
	}

	@Override
	public Transaction getCurrentBalanceByBankId(Integer bankId) {
		List<Transaction> transactions = getEntityManager().createNamedQuery("getByBankId").setParameter("id", bankId)
				.setMaxResults(1).getResultList();
		return transactions != null && !transactions.isEmpty() ? transactions.get(0) : null;

	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Transaction trnx = findByPK(id);
				trnx.setDeleteFlag(Boolean.TRUE);
				update(trnx);
			}
		}
	}
	public void updateStatusByIds(ArrayList<Integer> ids, TransactionCreationMode potentialDuplicate)
	{
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Transaction trnx = findByPK(id);
				trnx.setCreationMode(potentialDuplicate);
				update(trnx);
			}
		}
	}

	@Override
	public PaginationResponseModel getAllTransactionList(Map<TransactionFilterEnum, Object> filterMap,
														 PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach((filter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(filter.getDbColumnName())
				.condition(filter.getCondition()).value(value).build()));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	public Integer isTransactionsReadyForReconcile(LocalDateTime startDate, LocalDateTime endDate, Integer bankId){
        String unExplainedFilterString = " in ('NOT_EXPLAIN') ";
        String reconcileAndFullFilterString = " in ('Reconciled') ";

        Integer getUnExplainedCount = getTransactionCountForReconcile(startDate,endDate,bankId,null,unExplainedFilterString);
		if(getUnExplainedCount == 0) {
		String reconcileDateFilterString=" > :startDate and t.transactionDate <= :endDate ";
		Integer reconciledFullCount = getTransactionCountForReconcile(startDate, endDate, bankId,reconcileDateFilterString, reconcileAndFullFilterString);
		if(reconciledFullCount == 0)
		{
			return 0;
		}
		else
		{
			return -1;
		}
		}
		return getUnExplainedCount;
	}

	public Integer getTransactionCountForReconcile(LocalDateTime startDate, LocalDateTime endDate, Integer bankId,
												   String dateFilter,String filterQuery){

		StringBuilder queryBuilder = new StringBuilder("SELECT count(t.transactionId) FROM Transaction t " +
				"WHERE t.bankAccount.bankAccountId = :bankAccountId  and t.deleteFlag=false and t.transactionDate ");
		if(dateFilter==null)
		{
			queryBuilder.append("between :startDate and :endDate ");
		}
		else
		{
			queryBuilder.append(dateFilter);
		}
		queryBuilder.append(" and t.transactionExplinationStatusEnum").append(filterQuery);
		TypedQuery<Long> query = getEntityManager().createQuery(queryBuilder.toString(),
				Long.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankId);
		query.setParameter("endDate", endDate);
		if(startDate != null)
			query.setParameter("startDate", startDate);
		long result = query.getSingleResult();
		return (int)result;
	}


	public  LocalDateTime getTransactionStartDateToReconcile(LocalDateTime reconcileDate, Integer bankId)
	{
		StringBuilder queryBuilder = new StringBuilder("SELECT t FROM Transaction t " +
				"WHERE t.bankAccount.bankAccountId = :bankAccountId and t.transactionDate <=:endDate order by t.transactionDate ASC");
		TypedQuery<Transaction> query = getEntityManager().createQuery(queryBuilder.toString(),	Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankId);
		query.setParameter("endDate", reconcileDate);
		List<Transaction> transactionList = query.getResultList();
		return (transactionList!=null && transactionList.size()>0)?transactionList.get(0).getTransactionDate():null;
	}

	public String updateTransactionStatusReconcile(LocalDateTime startDate, LocalDateTime reconcileDate, Integer bankId,
												   TransactionExplinationStatusEnum transactionExplinationStatusEnum)
	{
		StringBuilder queryBuilder = new StringBuilder("Update Transaction t set t.transactionExplinationStatusEnum = '").append(transactionExplinationStatusEnum)
				.append("' WHERE t.bankAccount.bankAccountId = :bankAccountId and t.transactionDate <= :endDate");
		Query query = getEntityManager().createQuery(queryBuilder.toString());
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankId);
		query.setParameter("endDate", reconcileDate.plusHours(23).plusMinutes(59));
		query.executeUpdate();
		return "update query successful";
	}
	public  Boolean matchClosingBalanceForReconcile(LocalDateTime reconcileDate, BigDecimal closingBalance, Integer bankId){
	  StringBuilder queryBuilder = new StringBuilder("SELECT t FROM Transaction t " +
				"WHERE t.bankAccount.bankAccountId = :bankAccountId and t.transactionDate <=:endDate order by t.transactionDate DESC,t.transactionId DESC");
		TypedQuery<Transaction> query = getEntityManager().createQuery(queryBuilder.toString(),	Transaction.class);
		query.setParameter(BankAccountConstant.BANK_ACCOUNT_ID, bankId);
		query.setParameter("endDate", reconcileDate);
		query.setMaxResults(1);
		List<Transaction> transactionList = query.getResultList();
		return closingBalance.floatValue() == transactionList.get(0).getCurrentBalance().floatValue();
	}

	public boolean isAlreadyExistSimilarTransaction(BigDecimal transactionAmount, LocalDateTime transactionDate, BankAccount bankAccount, String transactionDescription)
	{
		StringBuilder queryBuilder = new StringBuilder("SELECT t FROM Transaction t " +
				"WHERE t.bankAccount = :bankAccount and t.transactionDate =:transactionDate and t.transactionAmount=:transactionAmount and t.transactionDescription=:transactionDescription and t.deleteFlag=false");
		TypedQuery<Transaction> query = getEntityManager().createQuery(queryBuilder.toString(),	Transaction.class);
		query.setParameter("bankAccount",bankAccount);
		query.setParameter("transactionDate", transactionDate);
		query.setParameter("transactionAmount", transactionAmount);
		query.setParameter("transactionDescription",transactionDescription);
		List<Transaction> transactionList = query.getResultList();
		return transactionList!=null && transactionList.size()>0;
	}
    @Override
	public Integer getExplainedTransactionCountByTransactionCategoryId(Integer transactionCategoryId){
		Query query = getEntityManager().createQuery(
				"SELECT COUNT(t) FROM Transaction t WHERE t.explainedTransactionCategory.transactionCategoryId =:transactionCategoryId AND t.deleteFlag=false" );
		query.setParameter("transactionCategoryId",transactionCategoryId);
		List<Object> countList = query.getResultList();
		if (countList != null && !countList.isEmpty()) {
			return ((Long) countList.get(0)).intValue();
		}
		return null;

	}
}