package com.simplevat.rfq_po;


import com.simplevat.dao.Dao;

public interface PoQuatationLineItemDao extends Dao<Integer,PoQuatationLineItem> {

    void deleteByRfqId(Integer id);
}
