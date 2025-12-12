package com.simpleaccounts.service.impl.bankaccount;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.criteria.bankaccount.TransactionCriteria;
import com.simpleaccounts.criteria.bankaccount.TransactionFilter;
import com.simpleaccounts.dao.bankaccount.BankAccountDao;
import com.simpleaccounts.dao.bankaccount.TransactionDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionView;
import com.simpleaccounts.model.TransactionReportRestModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.utils.ChartUtil;

	@Service("transactionService")
	@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
	@SuppressWarnings("java:S3973")
	@RequiredArgsConstructor
public class TransactionServiceImpl extends TransactionService {

	private final Logger logger = LoggerFactory.getLogger(TransactionServiceImpl.class);

	private final ChartUtil util;

	private final TransactionDao transactionDao;

	private final BankAccountDao bankAccountDao;
	private final BankAccountService bankAccountService;

	private final ReconcileStatusService reconcileStatusService;

	private static final String TRANSACTION = "TRANSACTION";

	@Override
	public List<Transaction> getTransactionsByCriteria(TransactionCriteria transactionCriteria) throws Exception {
		TransactionFilter filter = new TransactionFilter(transactionCriteria);
		return transactionDao.filter(filter);
	}

	@Override
	public Transaction updateOrCreateTransaction(Transaction transaction) {
		return transactionDao.updateOrCreateTransaction(transaction);
	}

	@Override
	public Map<Object, Number> getCashOutData(Integer monthNo, Integer bankId) {
		List<Object[]> rows = transactionDao
				.getCashOutData(monthNo != null ? util.getStartDate(Calendar.MONTH, -monthNo).getTime()
						: util.getStartDate(Calendar.YEAR, -1).getTime(), util.getEndDate().getTime(), bankId);
		return util.getCashMap(rows, monthNo);
	}

	@Override
	public Map<Object, Number> getCashInData(Integer monthNo, Integer bankId) {
		List<Object[]> rows = transactionDao
				.getCashInData(monthNo != null ? util.getStartDate(Calendar.MONTH, -monthNo).getTime()
						: util.getStartDate(Calendar.YEAR, -1).getTime(), util.getEndDate().getTime(), bankId);
		return util.getCashMap(rows, monthNo);
	}

	public int getMaxTransactionValue(Map<Object, Number> cashInMap, Map<Object, Number> cashOutMap) {
		int cashInMax = util.getMaxValue(cashInMap);
		int cashOutMax = util.getMaxValue(cashOutMap);
		if (cashInMax >= cashOutMax) {
			return cashInMax;
		} else {
			return cashOutMax;
		}
	}

	@Override
	public TransactionDao getDao() {
		return this.transactionDao;
	}

	@Override
	public void persist(Transaction transaction) {
		List<Transaction> afterTransactionList = transactionDao.getAfterTransaction(transaction);
		if (afterTransactionList == null || afterTransactionList.isEmpty()) {
			if (transaction.getDebitCreditFlag() == 'C') {
				transaction.setCurrentBalance(
						transaction.getBankAccount().getCurrentBalance().add(transaction.getTransactionAmount()));
			} else {
				transaction.setCurrentBalance(
						transaction.getBankAccount().getCurrentBalance().subtract(transaction.getTransactionAmount()));
			}
			super.persist(transaction, null, getActivity(transaction, "Created"));
			BigDecimal balanceAmount = transaction.getCurrentBalance();
			//updateAccountBalance(balanceAmount, transaction);
		} else {
			BigDecimal differenceAmount = transaction.getTransactionAmount();
			if (transaction.getDebitCreditFlag() == 'D') {
				differenceAmount = differenceAmount.negate();
			}
			updateLatestTransaction(differenceAmount, transaction);

			Transaction previousTransaction = transactionDao.getBeforeTransaction(transaction);
			if (previousTransaction == null) {
				Transaction latestTransaction = afterTransactionList.get(0);
				BigDecimal balanceAmount = latestTransaction.getCurrentBalance();
				if (latestTransaction.getDebitCreditFlag() == 'C') {
					balanceAmount = balanceAmount.subtract(latestTransaction.getTransactionAmount());
				} else {
					balanceAmount = balanceAmount.add(latestTransaction.getTransactionAmount());
				}
				transaction.setCurrentBalance(balanceAmount);
			} else {
				BigDecimal balanceAmount = previousTransaction.getCurrentBalance();
				if (transaction.getDebitCreditFlag() == 'D') {
					balanceAmount = balanceAmount.subtract(transaction.getTransactionAmount());
				} else {
					balanceAmount = balanceAmount.add(transaction.getTransactionAmount());
				}
				transaction.setCurrentBalance(balanceAmount);
			}
			super.persist(transaction, null, getActivity(transaction, "Created"));

			BigDecimal balance = transaction.getBankAccount().getCurrentBalance();
			if (transaction.getDebitCreditFlag() == 'D') {
				balance = balance.subtract(transaction.getTransactionAmount());
			} else {
				balance = balance.add(transaction.getTransactionAmount());
			}
			//updateAccountBalance(balance, transaction);
		}
	}

	@Override
	public Transaction update(Transaction transaction) {
		Transaction currentTransaction = transactionDao.findByPK(transaction.getTransactionId());
		BigDecimal differenceAmount = new BigDecimal(0);
		BigDecimal balanceAmount = transaction.getBankAccount().getCurrentBalance();
		if (Objects.equals(currentTransaction.getDebitCreditFlag(), transaction.getDebitCreditFlag())) {
			differenceAmount = transaction.getTransactionAmount().subtract(currentTransaction.getTransactionAmount());
		} else {
			differenceAmount = transaction.getTransactionAmount().add(currentTransaction.getTransactionAmount());
		}
		if (differenceAmount.compareTo(new BigDecimal(0)) != 0) {
			if (transaction.getDebitCreditFlag() == 'D') {
				balanceAmount = balanceAmount.subtract(differenceAmount);
				transaction.setCurrentBalance(transaction.getCurrentBalance().subtract(differenceAmount));
			} else {
				balanceAmount = balanceAmount.add(differenceAmount);
				transaction.setCurrentBalance(transaction.getCurrentBalance().add(differenceAmount));
			}
			updateLatestTransaction(differenceAmount, transaction);
			//updateAccountBalance(balanceAmount, transaction);
		}
		transaction = super.update(transaction, null, getActivity(transaction, "Updated"));
		return transaction;
	}

	private void updateLatestTransaction(final BigDecimal differenceAmount, Transaction transaction) {
		List<Transaction> latestTransactionList = transactionDao.getAfterTransaction(transaction);
		if (latestTransactionList != null && !latestTransactionList.isEmpty()) {
			latestTransactionList.stream().map((transaction1) -> {
				transaction1.setCurrentBalance(transaction1.getCurrentBalance().add(differenceAmount));
				return transaction1;
			}).forEachOrdered((transaction1) -> {
				transactionDao.update(transaction1);
			});
		}
	}

	private void updateAccountBalance(final BigDecimal balanceAmount, Transaction transaction) {
		BankAccount bankAccount = transaction.getBankAccount();
		bankAccount.setCurrentBalance(balanceAmount);
		bankAccountDao.update(bankAccount);
	}

	@Override
	public Transaction deleteTransaction(Transaction transaction) {
		BigDecimal balanceAmount = transaction.getBankAccount().getCurrentBalance();
		BigDecimal diffAmount = transaction.getTransactionAmount();
		if (transaction.getDebitCreditFlag() == 'D') {
			balanceAmount = balanceAmount.add(transaction.getTransactionAmount());
		} else {
			balanceAmount = balanceAmount.subtract(transaction.getTransactionAmount());
			diffAmount = diffAmount.negate();
		}
		updateOrCreateTransaction(transaction);
		updateLatestTransaction(diffAmount, transaction);
		updateAccountBalance(balanceAmount, transaction);

		// Find invoices
		 
		return transaction;
	}

	@Override
	public Transaction deleteChildTransaction(Transaction transaction) {
		transaction.setDeleteFlag(true);
		transactionDao.update(transaction);
		return transaction;
	}

	@Override
	public List<TransactionReportRestModel> getTransactionsReport(Integer transactionTypeId,
			Integer transactionCategoryId, Date startDate, Date endDate, Integer bankAccountId, Integer pageNo,
			Integer pageSize) {
		return transactionDao.getTransactionsReport(transactionTypeId, transactionCategoryId, startDate, endDate,
				bankAccountId, pageNo, pageSize);
	}

	@Override
	public List<Transaction> getChildTransactionListByParentId(int parentId) {
		return transactionDao.getChildTransactionListByParentId(parentId);
	}

	@Override
	public void persistChildTransaction(Transaction transaction) {
		if (transaction.getTransactionId() == null) {
			transactionDao.persist(transaction);
		} else {
			transactionDao.update(transaction);
		}
	}

	@Override
	public List<Transaction> getAllTransactionsByRefId(int transactionRefType, int transactionRefId) {
		return transactionDao.getAllTransactionsByRefId(transactionRefType, transactionRefId);
	}

	@Override
	public List<Transaction> getAllParentTransactions(BankAccount bankAccount) {
		return transactionDao.getAllParentTransactions(bankAccount);
	}

	@Override
	public List<Transaction> getAllTransactionListByBankAccountId(Integer bankAccountId) {
		return transactionDao.getAllTransactionListByBankAccountId(bankAccountId);
	}

	@Override
	public List<Transaction> getAllTransactions() {
		return transactionDao.getAllTransactions();
	}

	@Override
	public List<TransactionView> getAllTransactionViewList(Integer bankAccountId) {
		return transactionDao.getAllTransactionViewList(bankAccountId);
	}

	@Override
	public List<TransactionView> getChildTransactionViewListByParentId(Integer parentTransaction) {
		return transactionDao.getChildTransactionViewListByParentId(parentTransaction);
	}

	@Override
	public List<TransactionView> getTransactionViewList(int pageSize, Integer bankAccountId, int rowCount,
			Integer transactionStatus, Map<String, Object> filters, String sortField, String sortOrder) {
		return transactionDao.getTransactionViewList(pageSize, bankAccountId, rowCount, transactionStatus, filters,
				sortField, sortOrder);
	}

	@Override
	public Integer getTotalTransactionCountByBankAccountIdForLazyModel(Integer bankAccountId,
			Integer transactionStatus) {
		return transactionDao.getTotalTransactionCountByBankAccountIdForLazyModel(bankAccountId, transactionStatus);
	}

	@Override
	public Integer getTransactionCountByRangeAndBankAccountId(int pageSize, Integer bankAccountId, int rowCount) {
		return transactionDao.getTransactionCountByRangeAndBankAccountId(pageSize, bankAccountId, rowCount);
	}

	@Override
	public List<Transaction> getParentTransactionListByRangeAndBankAccountId(int pageSize, Integer bankAccountId,
			int rowCount, Integer transactionStatus, Map<String, Object> filters, String sortField, String sortOrder) {
		return transactionDao.getParentTransactionListByRangeAndBankAccountId(pageSize, bankAccountId, rowCount,
				transactionStatus, filters, sortField, sortOrder);
	}

	@Override
	public Integer getTotalExplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		return transactionDao.getTotalExplainedTransactionCountByBankAccountId(bankAccountId);
	}

	@Override
	public Integer getTotalUnexplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		return transactionDao.getTotalUnexplainedTransactionCountByBankAccountId(bankAccountId);
	}

	@Override
	public Integer getTotalPartiallyExplainedTransactionCountByBankAccountId(Integer bankAccountId) {
		return transactionDao.getTotalPartiallyExplainedTransactionCountByBankAccountId(bankAccountId);
	}

	@Override
	public Integer getTotalAllTransactionCountByBankAccountId(Integer bankAccountId) {
		return transactionDao.getTotalAllTransactionCountByBankAccountId(bankAccountId);
	}

	@Override
	public Integer getTransactionCountByBankAccountId(Integer bankAccountId) {
		return transactionDao.getTransactionCountByBankAccountId(bankAccountId);
	}

	@Override
	public List<TransactionView> getTransactionViewListByDateRang(Integer bankAccountId, Date startDate, Date endDate) {
		return transactionDao.getTransactionViewListByDateRang(bankAccountId, startDate, endDate);
	}

	protected Activity getActivity(Transaction transaction, String activityCode) {
		Activity activity = new Activity();
		activity.setActivityCode(activityCode);
		activity.setModuleCode(TRANSACTION);
		activity.setField3("Transaction " + activityCode);
		activity.setField1(String.valueOf(transaction.getTransactionAmount().doubleValue()));
		activity.setField2(transaction.getDebitCreditFlag() == 'C' ? "Credit" : "Debit");
		activity.setLastUpdateDate(LocalDateTime.now());
		activity.setLoggingRequired(true);
		return activity;
	}

	@Override
	public String saveTransactions(List<Transaction> transactions) {

		try {
			BankAccount bankAccount =null;
			if(transactions!=null && transactions.size()>0)
			bankAccount = bankAccountService.findByPK(transactions.get(0).getBankAccount().getBankAccountId());
			BigDecimal currentBalance = bankAccount.getCurrentBalance();
			List<ReconcileStatus> reconcileStatusList = reconcileStatusService.getAllReconcileStatusListByBankAccountId(bankAccount.getBankAccountId());
			LocalDateTime  lastReconcileDate= null;
			if (reconcileStatusList!=null&&reconcileStatusList.size()>0)
			{
				ReconcileStatus reconcileStatus = reconcileStatusList.get(0);
				lastReconcileDate =	reconcileStatus.getReconciledDate();
			}

			int count = 0;
			int totalCount = transactions.size();
			LocalDateTime currentDate = LocalDateTime.now();
			for (Transaction transaction : transactions) {
				if(isAlreadyExistSimilarTransaction(transaction))
					transaction.setCreationMode(TransactionCreationMode.POTENTIAL_DUPLICATE);
				if(isValidTransaction(transaction,bankAccount,lastReconcileDate,currentDate)){
					if (transaction.getDebitCreditFlag()=='C'){
						currentBalance = currentBalance.add(transaction.getTransactionAmount());
					}
					else{
						currentBalance = currentBalance.subtract(transaction.getTransactionAmount());
					}
					transaction.setCurrentBalance(currentBalance);
					transactionDao.persist(transaction);
				}

				else {
					count++;

				}

			}
			String returnMessage ="Total Transactions To Import "+totalCount + " Transactions Imported " + (totalCount-count);
			bankAccount.setCurrentBalance(currentBalance);
			bankAccountService.update(bankAccount);
			return returnMessage;
		} catch (Exception e) {
			logger.error("Error", e);
			return null;
		}
	}

	private boolean
	isValidTransaction(Transaction transaction, BankAccount bankAccount,LocalDateTime lastReconciledDate,
									   LocalDateTime currentDate) {
		 if (lastReconciledDate!=null&&lastReconciledDate.isBefore(transaction.getTransactionDate())
		 && transaction.getTransactionDate().isBefore(currentDate))
		return true;
		else if (bankAccount.getOpeningDate().isBefore(transaction.getTransactionDate())
				 && transaction.getTransactionDate().isBefore(currentDate))
			return true;
			else
				return false;
	}

	private boolean isAlreadyExistSimilarTransaction(Transaction transaction) {
		return transactionDao.isAlreadyExistSimilarTransaction(transaction.getTransactionAmount(),transaction.getTransactionDate(),
				transaction.getBankAccount(),transaction.getTransactionDescription());
	}

	@Override
	public BigDecimal getCurrentBalanceByBankId(Integer bankId) {
		Transaction trnx = transactionDao.getCurrentBalanceByBankId(bankId);
		if (trnx == null) {
			BankAccount bank = bankAccountDao.findByPK(bankId);
			if (bank != null) {
				return bank.getCurrentBalance() != null ? bank.getCurrentBalance() : new BigDecimal(0);
			}
		} else {
			return trnx.getCurrentBalance();
		}
		return new BigDecimal(0);
	}

	@Override
	public void deleteByIds(ArrayList<Integer> ids) {
		transactionDao.deleteByIds(ids);
	}
	@Override
	public  void updateStatusByIds(ArrayList<Integer> ids, TransactionCreationMode potentialDuplicate)
	{
		transactionDao.updateStatusByIds(ids,potentialDuplicate);
	}
	@Override
	public PaginationResponseModel getAllTransactionList(Map<TransactionFilterEnum, Object> filterModel,
			PaginationModel paginationModel) {
		return transactionDao.getAllTransactionList(filterModel, paginationModel);
	}
	@Override
	public Integer isTransactionsReadyForReconcile(LocalDateTime startDate, LocalDateTime endDate, Integer bankId){
		return transactionDao.isTransactionsReadyForReconcile(startDate,endDate,bankId);
	}
	@Override
	public  LocalDateTime getTransactionStartDateToReconcile(LocalDateTime reconcileDate, Integer bankId)
	{
		return transactionDao.getTransactionStartDateToReconcile(reconcileDate,bankId);
	}
	@Override
	public String updateTransactionStatusReconcile(LocalDateTime startDate, LocalDateTime reconcileDate, Integer bankId,
												   TransactionExplinationStatusEnum transactionExplinationStatusEnum)
	{
		return transactionDao.updateTransactionStatusReconcile(startDate,reconcileDate,bankId,transactionExplinationStatusEnum);
	}
	@Override
	public Boolean matchClosingBalanceForReconcile(LocalDateTime reconcileDate, BigDecimal closingBalance, Integer bankId)
	{
		return transactionDao.matchClosingBalanceForReconcile(reconcileDate,closingBalance,bankId);
	}
    @Override
    public Integer getExplainedTransactionCountByTransactionCategoryId(Integer transactionCategoryId){
	return 	transactionDao.getExplainedTransactionCountByTransactionCategoryId(transactionCategoryId);
}
}
