package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.ReceiptFilterEnum;
import com.simplevat.entity.Receipt;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public interface ReceiptDao extends Dao<Integer, Receipt> {

	public PaginationResponseModel getProductList(Map<ReceiptFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public void deleteByIds(List<Integer> ids);

}
