package com.simplevat.service;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simplevat.criteria.bankaccount.TransactionCategoryCriteria;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public abstract class TransactionCategoryService extends SimpleVatService<Integer, TransactionCategory> {

    public abstract List<TransactionCategory> findAllTransactionCategory();
    
    public abstract TransactionCategory findTransactionCategoryByTransactionCategoryCode(String transactionCategoryCode);
    
    public abstract List<TransactionCategory> findAllTransactionCategoryByUserId(Integer userId);

    public abstract List<TransactionCategory> findAllTransactionCategoryByChartOfAccountIdAndName(Integer transactionTypeCode, String name);

    public abstract List<TransactionCategory> findAllTransactionCategoryByChartOfAccount(Integer transactionTypeCode);

    public abstract List<TransactionCategory> findTransactionCategoryListByParentCategory(Integer parentCategoryId);

    public abstract List<TransactionCategory> getCategoriesByComplexCriteria(TransactionCategoryCriteria criteria);

    public abstract TransactionCategory getDefaultTransactionCategory();

    public abstract TransactionCategory getDefaultTransactionCategoryByTransactionCategoryId(Integer transactionCategoryId);

    public abstract void deleteByIds(List<Integer> ids);

    public abstract PaginationResponseModel  getTransactionCategoryList(Map<TransactionCategoryFilterEnum, Object> filterMap,PaginationModel paginationModel);
    
    public abstract String getNxtTransactionCatCodeByChartOfAccount(ChartOfAccount chartOfAccount);
    
	public abstract List<TransactionCategory> getTransactionCatByChartOfAccountCategoryId(Integer chartOfAccountCategoryId);
	
	public abstract List<TransactionCategory> getListForReceipt();

	public abstract List<TransactionCategory> getTransactionCategoryListForSalesProduct();

    public abstract List<TransactionCategory> getTransactionCategoryListForPurchaseProduct();

    public abstract List<TransactionCategory> getTransactionCategoryListForInventory();

    public abstract List<TransactionCategory> getTransactionCategoryListManualJornal();
}
