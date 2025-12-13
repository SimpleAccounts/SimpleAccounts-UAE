package com.simpleaccounts.rfq_po;

import com.simpleaccounts.service.SimpleAccountsService;
import java.util.List;

public abstract class RfqPoGrnInvoiceRelationService extends SimpleAccountsService<Integer, RfqPoGrnRelation> {
    public abstract void addRfqPoGrnRelation(PoQuatation parentPoQuatation,PoQuatation childPoQuotation);

    public abstract List<String> getPoGrnListByParentId(Integer parentId);

    public abstract List<PoQuatation> getRPoGrnById(Integer id);
}
