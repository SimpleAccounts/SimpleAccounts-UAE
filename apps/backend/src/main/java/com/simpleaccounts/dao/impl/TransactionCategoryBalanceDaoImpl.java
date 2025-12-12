package com.simpleaccounts.dao.impl;

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.TransactionCategoryBalanceDao;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.rest.PaginationResponseModel;

@Repository
@RequiredArgsConstructor
public class TransactionCategoryBalanceDaoImpl extends AbstractDao<Integer, TransactionCategoryBalance>
		implements TransactionCategoryBalanceDao {
	private final ChartOfAccountService chartOfAccountService;

	private final TransactionCategoryService transactionCategoryService;
	@Override
	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
/**
 * Added for Pagination issue
 */

		Map<String,Object> transactionCategorymap1 = new HashMap<>();
		Map<String,Object> transactionCategorymap2 = new HashMap<>();
		Map<String,Object> transactionCategorymap3 = new HashMap<>();
		Map<String,Object> transactionCategorymap4 = new HashMap<>();
		Map<String,Object> transactionCategorymap5 = new HashMap<>();
		transactionCategorymap1.put(CommonColumnConstants.TRANSACTION_CATEGORY_CODE, TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());
		transactionCategorymap2.put(CommonColumnConstants.TRANSACTION_CATEGORY_CODE, TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode());
		transactionCategorymap3.put(CommonColumnConstants.TRANSACTION_CATEGORY_CODE, TransactionCategoryCodeEnum.PETTY_CASH.getCode());
		transactionCategorymap4.put(CommonColumnConstants.TRANSACTION_CATEGORY_CODE, TransactionCategoryCodeEnum.EMPLOYEE_REIMBURSEMENT.getCode());
		ChartOfAccount chartOfAccount=chartOfAccountService.findByPK(7);
		transactionCategorymap5.put("chartOfAccount", chartOfAccount);
		List<TransactionCategory> transactionCategories1=transactionCategoryService.findByAttributes(transactionCategorymap1);
		List<TransactionCategory> transactionCategories2=transactionCategoryService.findByAttributes(transactionCategorymap2);
		List<TransactionCategory> transactionCategories3=transactionCategoryService.findByAttributes(transactionCategorymap3);
		List<TransactionCategory> transactionCategories4=transactionCategoryService.findByAttributes(transactionCategorymap4);
		List<TransactionCategory> transactionCategories5=transactionCategoryService.findByAttributes(transactionCategorymap5);
		List<TransactionCategory> transactionCategories=new ArrayList<>();
		transactionCategories.addAll(transactionCategories1);
		transactionCategories.addAll(transactionCategories2);
		transactionCategories.addAll(transactionCategories3);
		transactionCategories.addAll(transactionCategories4);
		transactionCategories.addAll(transactionCategories5);

		dbFilters.add(DbFilter.builder().dbCoulmnName("transactionCategory")
										.condition(" NOT IN(:transactionCategory)")
										.value(transactionCategories).build());

		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

}
