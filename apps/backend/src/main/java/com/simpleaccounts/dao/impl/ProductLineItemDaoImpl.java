package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ProductLineItemDao;
import com.simpleaccounts.entity.ProductLineItem;
import org.springframework.stereotype.Repository;

@Repository
public class ProductLineItemDaoImpl extends AbstractDao<Integer, ProductLineItem> implements ProductLineItemDao {

}
