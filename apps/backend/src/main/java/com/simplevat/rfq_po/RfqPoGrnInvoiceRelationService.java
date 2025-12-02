package com.simplevat.rfq_po;

import com.simplevat.service.SimpleVatService;

import java.util.List;


public abstract class RfqPoGrnInvoiceRelationService extends SimpleVatService<Integer, RfqPoGrnRelation> {
    public abstract void addRfqPoGrnRelation(PoQuatation parentPoQuatation,PoQuatation childPoQuotation);

    public abstract List<String> getPoGrnListByParentId(Integer parentId);

    public abstract List<PoQuatation> getRPoGrnById(Integer id);
}
