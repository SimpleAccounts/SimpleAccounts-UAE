package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ReceiptDao;
import com.simpleaccounts.entity.Receipt;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.ReceiptService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("ReceiptService")
@RequiredArgsConstructor
public class ReceiptServiceImpl extends ReceiptService {

	private final ReceiptDao receiptDao;

	@Override
	public PaginationResponseModel getReceiptList(Map<ReceiptFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		return receiptDao.getProductList(filterMap, paginationModel);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		receiptDao.deleteByIds(ids);
	}

	@Override
	protected Dao<Integer, Receipt> getDao() {
		return receiptDao;
	}

}
