package com.simpleaccounts.service;

import java.math.BigDecimal;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public abstract class TransactionCategoryBalanceService extends SimpleAccountsService<Integer, TransactionCategoryBalance> {

	public abstract PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> dataMap, PaginationModel paginationModel);

	public abstract BigDecimal updateRunningBalance(JournalLineItem lineItems);

	public abstract BigDecimal updateRunningBalanceAndOpeningBalance(JournalLineItem lineItems,Boolean updateOpeningBalance);

}
