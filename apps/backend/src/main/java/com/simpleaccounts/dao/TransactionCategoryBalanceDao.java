package com.simpleaccounts.dao;

import java.util.Map;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public interface TransactionCategoryBalanceDao extends Dao<Integer, TransactionCategoryBalance> {

	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel);

}
