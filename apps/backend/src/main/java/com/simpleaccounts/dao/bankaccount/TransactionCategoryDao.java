package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;

public interface TransactionCategoryDao extends Dao<Integer, TransactionCategory> {

    public TransactionCategory updateOrCreateTransaction(TransactionCategory transactionCategory);

    public TransactionCategory getDefaultTransactionCategory();

    public List<TransactionCategory> findAllTransactionCategory();
    
    public TransactionCategory findTransactionCategoryByTransactionCategoryCode(String transactionCategoryCode);
    
    public List<TransactionCategory> findAllTransactionCategoryByChartOfAccountIdAndName(Integer chartOfAccountId, String name);

    public List<TransactionCategory> findTransactionCategoryListByParentCategory(Integer parentCategoryId);
    
    public List<TransactionCategory> findAllTransactionCategoryByChartOfAccount(Integer chartOfAccount);

    public TransactionCategory getDefaultTransactionCategoryByTransactionCategoryId(Integer transactionCategoryId);

    public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getTransactionCategoryList(Map<TransactionCategoryFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public String getNxtTransactionCatCodeByChartOfAccount(ChartOfAccount chartOfAccount);

	public List<TransactionCategory> getTransactionCatByChartOfAccountCategoryId(Integer chartOfAccountCategoryId);

	public List<TransactionCategory> findTnxCatForReicpt();

	public List<TransactionCategory> getTransactionCategoryListForSalesProduct();

    public List<TransactionCategory> getTransactionCategoryListForPurchaseProduct();

    public List<TransactionCategory> getTransactionCategoryListForInventory();

    public List<TransactionCategory> getTransactionCategoryListManualJornal();
}
