package com.simplevat.dao.bankaccount;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

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
