package com.simpleaccounts.service;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.entity.Receipt;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public abstract class ReceiptService extends SimpleAccountsService<Integer, Receipt> {

	public abstract PaginationResponseModel getReceiptList(Map<ReceiptFilterEnum, Object> map,PaginationModel paginationModel);

	public abstract void deleteByIds(List<Integer> ids);
}
