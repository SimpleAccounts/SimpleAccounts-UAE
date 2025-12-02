package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.TransactionCategoryFilterEnum;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.criteria.TransactionCategoryFilterNew;
import com.simplevat.criteria.bankaccount.TransactionCategoryCriteria;
import com.simplevat.entity.Activity;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.TransactionCategoryService;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import com.simplevat.dao.bankaccount.TransactionCategoryDao;

@Service("transactionCategoryService")
@Transactional
public class TransactionCategoryServiceImpl extends TransactionCategoryService {

	private static final String TRANSACTION_CATEGORY = "TRANSACTION_CATEGORY";

	@Autowired
	@Qualifier(value = "transactionCategoryDao")
	private TransactionCategoryDao dao;

	@Override
	public TransactionCategoryDao getDao() {
		return dao;
	}

	@Override
	public List<TransactionCategory> findAllTransactionCategory() {
		return getDao().findAllTransactionCategory();
	}

	@Override
	public TransactionCategory findTransactionCategoryByTransactionCategoryCode(String transactionCategoryCode) {
		return getDao().findTransactionCategoryByTransactionCategoryCode(transactionCategoryCode);
	}

	@Override
	public List<TransactionCategory> findAllTransactionCategoryByUserId(Integer userId) {
		Map<String, Object> parameterDataMap = new HashMap<>();
		parameterDataMap.put("createdBy", userId);
		DbFilter dbFilter = DbFilter.builder().dbCoulmnName("createdBy").condition(" = :createdBy").value(userId)
				.build();
		return getDao().executeQuery(Arrays.asList(dbFilter));
	}

	@Override
	public TransactionCategory getDefaultTransactionCategory() {
		List<TransactionCategory> transactionCategories = findAllTransactionCategory();

		if (CollectionUtils.isNotEmpty(transactionCategories)) {
			return transactionCategories.get(0);
		}
		return null;
	}

	@Override
	public List<TransactionCategory> getCategoriesByComplexCriteria(TransactionCategoryCriteria criteria) {
		TransactionCategoryFilterNew filter = new TransactionCategoryFilterNew(criteria);
		return this.filter(filter);

	}

	@Override
	public List<TransactionCategory> findAllTransactionCategoryByChartOfAccountIdAndName(Integer chartOfAccountId,
			String name) {
		return dao.findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);
	}

	@Override
//	@Cacheable(cacheNames = "transactionCategoryCache", key = "#chartOfAccountId")
	public List<TransactionCategory> findAllTransactionCategoryByChartOfAccount(Integer chartOfAccountId) {
		return dao.findAllTransactionCategoryByChartOfAccount(chartOfAccountId);
	}

	@Override
	public List<TransactionCategory> findTransactionCategoryListByParentCategory(Integer parentCategoryId) {
		return dao.findTransactionCategoryListByParentCategory(parentCategoryId);
	}

	@Override
	public TransactionCategory getDefaultTransactionCategoryByTransactionCategoryId(Integer transactionCategoryId) {
		return dao.getDefaultTransactionCategoryByTransactionCategoryId(transactionCategoryId);
	}
	@Override
	public void persist(TransactionCategory transactionCategory) {
		super.persist(transactionCategory, null, getActivity(transactionCategory, "CREATED"));
	}
	@Override
	public TransactionCategory update(TransactionCategory transactionCategory) {
		return super.update(transactionCategory, null, getActivity(transactionCategory, "UPDATED"));
	}

	private Activity getActivity(TransactionCategory transactionCategory, String activityCode) {
		Activity activity = new Activity();
		activity.setActivityCode(activityCode);
		activity.setModuleCode(TRANSACTION_CATEGORY);
		activity.setField3("Transaction Category " + activityCode.charAt(0)
				+ activityCode.substring(1, activityCode.length()).toLowerCase());
		activity.setField1(transactionCategory.getTransactionCategoryCode());
		activity.setField2(transactionCategory.getTransactionCategoryName());
		activity.setLastUpdateDate(LocalDateTime.now());
		activity.setLoggingRequired(true);
		return activity;
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		dao.deleteByIds(ids);
	}

	@Override
	public PaginationResponseModel getTransactionCategoryList(Map<TransactionCategoryFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		return dao.getTransactionCategoryList(filterMap, paginationModel);
	}

	@Override
	public String getNxtTransactionCatCodeByChartOfAccount(ChartOfAccount chartOfAccount) {
		return dao.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);
	}

	@Override
//	@Cacheable(cacheNames = "transactionCategoryCache", key = "#chartOfAccountCategoryId")
	public List<TransactionCategory> getTransactionCatByChartOfAccountCategoryId(Integer chartOfAccountCategoryId) {
		return dao.getTransactionCatByChartOfAccountCategoryId(chartOfAccountCategoryId);
	}

	@Override
	public List<TransactionCategory> getListForReceipt() {
		return dao.findTnxCatForReicpt();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListForSalesProduct(){
		return dao.getTransactionCategoryListForSalesProduct();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListForPurchaseProduct(){
		return dao.getTransactionCategoryListForPurchaseProduct();
	}
   @Override
	public  List<TransactionCategory> getTransactionCategoryListForInventory(){
		return dao.getTransactionCategoryListForInventory();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListManualJornal(){
		return dao.getTransactionCategoryListManualJornal();
	}
}
