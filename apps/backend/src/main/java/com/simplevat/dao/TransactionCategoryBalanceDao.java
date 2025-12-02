package com.simplevat.dao;

import java.util.Map;

import com.simplevat.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simplevat.entity.TransactionCategoryBalance;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public interface TransactionCategoryBalanceDao extends Dao<Integer, TransactionCategoryBalance> {

	public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap, PaginationModel paginationModel);

}
