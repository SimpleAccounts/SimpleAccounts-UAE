package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.entity.Receipt;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;

public interface ReceiptDao extends Dao<Integer, Receipt> {

	public PaginationResponseModel getProductList(Map<ReceiptFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public void deleteByIds(List<Integer> ids);

}
