package com.simplevat.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.dao.Dao;
import com.simplevat.dao.ProductLineItemDao;
import com.simplevat.entity.ProductLineItem;
import com.simplevat.service.ProductLineItemService;

@Service
public class ProductLineItemServiceImpl extends ProductLineItemService {

	@Autowired
	private ProductLineItemDao productLineItemDao;

	@Override
	protected Dao<Integer, ProductLineItem> getDao() {
		return productLineItemDao;
	}

}
