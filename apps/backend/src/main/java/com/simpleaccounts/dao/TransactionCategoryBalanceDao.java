package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.Map;

public interface TransactionCategoryBalanceDao extends Dao<Integer, TransactionCategoryBalance> {

	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel);

}
