package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.constant.dbfilter.TransactionFilterEnum;
import com.simpleaccounts.model.TransactionReportRestModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionView;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.Map;

public interface TransactionDao extends Dao<Integer, Transaction> {

    Transaction updateOrCreateTransaction(Transaction transaction);

    public List<Object[]> getCashInData(Date startDate, Date endDate,Integer bankId);

    public List<Object[]> getCashOutData(Date startDate, Date endDate,Integer bankId);

    public Transaction getBeforeTransaction(Transaction transaction);

    public List<Transaction> getAfterTransaction(Transaction transaction);

    public List<TransactionReportRestModel> getTransactionsReport(Integer transactionTypeId, Integer transactionCategoryId, Date startDate, Date endDate, Integer bankAccountId, Integer pageNo, Integer pageSize);

    public List<Transaction> getChildTransactionListByParentId(int parentId);

    public List<Transaction> getAllParentTransactions(BankAccount bankAccount);

    public List<Transaction> getTransactionsByDateRangeAndBankAccountId(BankAccount bankAccount, Date startDate, Date lastDate);

    public List<Transaction> getAllTransactionListByBankAccountId(Integer bankAccountId);

    public List<Transaction> getAllTransactions();

    public List<TransactionView> getAllTransactionViewList(Integer bankAccountId);
    
    public List<Transaction> getAllTransactionsByRefId(int transactionRefType, int transactionRefId);
    
    public List<TransactionView> getChildTransactionViewListByParentId(Integer parentTransaction);

    public List<TransactionView> getTransactionViewList(int pageSize, Integer bankAccountId, int rowCount, Integer transactionStatus, Map<String, Object> filters,String sortField, String sortOrder);

    public Integer getTotalTransactionCountByBankAccountIdForLazyModel(Integer bankAccountId, Integer transactionStatus);

    public Integer getTotalExplainedTransactionCountByBankAccountId(Integer bankAccountId);
    
    public Integer getTotalUnexplainedTransactionCountByBankAccountId(Integer bankAccountId);
    
    public Integer getTotalPartiallyExplainedTransactionCountByBankAccountId(Integer bankAccountId);
    
    public Integer getTotalAllTransactionCountByBankAccountId(Integer bankAccountId);

    public Integer getTransactionCountByBankAccountId(Integer bankAccountId);

    public Integer getTransactionCountByRangeAndBankAccountId(int pageSize, Integer bankAccountId, int rowCount);

    public List<Transaction> getParentTransactionListByRangeAndBankAccountId(int pageSize, Integer bankAccountId, int rowCount, Integer transactionStatus,Map<String, Object> filters,String sortField, String sortOrder);

    public List<TransactionView> getTransactionViewListByDateRang(Integer bankAccountId, Date startDate, Date endDate);

	public Transaction getCurrentBalanceByBankId(Integer bankId);

	public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getAllTransactionList(Map<TransactionFilterEnum, Object> filterMap,
			PaginationModel paginationModel);

   public Integer isTransactionsReadyForReconcile(LocalDateTime startDate, LocalDateTime endDate, Integer bankId);

   public  LocalDateTime getTransactionStartDateToReconcile(LocalDateTime reconcileDate, Integer bankId);

   public String updateTransactionStatusReconcile(LocalDateTime startDate, LocalDateTime reconcileDate, Integer bankId,
                                                  TransactionExplinationStatusEnum transactionExplinationStatusEnum);

  public  Boolean matchClosingBalanceForReconcile(LocalDateTime reconcileDate, BigDecimal closingBalance, Integer bankId);

   public boolean isAlreadyExistSimilarTransaction(BigDecimal transactionAmount, LocalDateTime transactionDate, BankAccount bankAccount,String transactionDescription);

   public void updateStatusByIds(ArrayList<Integer> ids, TransactionCreationMode potentialDuplicate);

   public Integer getExplainedTransactionCountByTransactionCategoryId(Integer transactionCategoryId);
}
