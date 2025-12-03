package com.simpleaccounts.dao.impl;

import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.ProductLineItem;

@Repository
@Transactional
public class ProductLineItemDaoImpl extends AbstractDao<Integer, ProductLineItem> implements ProductLineItemDao {

}
