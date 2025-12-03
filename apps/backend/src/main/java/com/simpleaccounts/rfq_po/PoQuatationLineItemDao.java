package com.simpleaccounts.rfq_po;


import com.simpleaccounts.dao.Dao;

public interface PoQuatationLineItemDao extends Dao<Integer,PoQuatationLineItem> {

    void deleteByRfqId(Integer id);
}
