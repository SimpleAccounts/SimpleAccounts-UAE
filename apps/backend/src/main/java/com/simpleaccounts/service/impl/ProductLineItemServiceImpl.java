package com.simpleaccounts.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.ProductLineItem;
import com.simpleaccounts.service.ProductLineItemService;

@Service
public class ProductLineItemServiceImpl extends ProductLineItemService {

	@Autowired
	private ProductLineItemDao productLineItemDao;

	@Override
	protected Dao<Integer, ProductLineItem> getDao() {
		return productLineItemDao;
	}

}
