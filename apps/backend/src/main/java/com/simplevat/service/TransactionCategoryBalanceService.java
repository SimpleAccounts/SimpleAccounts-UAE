package com.simplevat.service;

import java.math.BigDecimal;
import java.util.Map;

import com.simplevat.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.TransactionCategoryBalance;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public abstract class TransactionCategoryBalanceService extends SimpleVatService<Integer, TransactionCategoryBalance> {

	public abstract PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> dataMap, PaginationModel paginationModel);

	public abstract BigDecimal updateRunningBalance(JournalLineItem lineItems);

	public abstract BigDecimal updateRunningBalanceAndOpeningBalance(JournalLineItem lineItems,Boolean updateOpeningBalance);

}
