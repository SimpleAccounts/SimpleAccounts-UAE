package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;

import java.util.List;

public interface RfqPoGrnInvoiceRelationDao extends Dao<Integer, RfqPoGrnRelation> {

    void addRfqPoGrnRelation(PoQuatation parentPoQuatation, PoQuatation childPoQuotation);

    List<String> getPoGrnListByParentId(Integer parentId);

    List<PoQuatation> getRPoGrnById(Integer id);
}
