package com.simplevat.service;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.ReceiptFilterEnum;
import com.simplevat.entity.Receipt;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public abstract class ReceiptService extends SimpleVatService<Integer, Receipt> {

	public abstract PaginationResponseModel getReceiptList(Map<ReceiptFilterEnum, Object> map,PaginationModel paginationModel);

	public abstract void deleteByIds(List<Integer> ids);
}
