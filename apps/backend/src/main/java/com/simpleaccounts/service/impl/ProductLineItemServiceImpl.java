package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.service.ProductLineItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductLineItemServiceImpl extends ProductLineItemService {

	private final ProductLineItemDao productLineItemDao;

	@Override
	protected Dao<Integer, ProductLineItem> getDao() {
		return productLineItemDao;
	}

}
