package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.ReceiptFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ReceiptDao;
import com.simplevat.entity.Receipt;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.ReceiptService;

@Service("ReceiptService")
public class ReceiptServiceImpl extends ReceiptService {

	@Autowired
	private ReceiptDao receiptDao;

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
