package com.simplevat.dao.impl;

import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ProductLineItemDao;
import com.simplevat.entity.ProductLineItem;

@Repository
@Transactional
public class ProductLineItemDaoImpl extends AbstractDao<Integer, ProductLineItem> implements ProductLineItemDao {

}
