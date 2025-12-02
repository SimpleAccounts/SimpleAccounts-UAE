package com.simplevat.service.impl;

import com.simplevat.dao.CreditNoteInvoiceRelationDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.CreditNoteInvoiceRelation;
import com.simplevat.rfq_po.RfqPoGrnRelation;
import com.simplevat.service.CreditNoteInvoiceRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("creditNoteInvoiceRelationService")
public class CreditNoteInvoiceRelationServiceImpl extends CreditNoteInvoiceRelationService {
    @Autowired
    private CreditNoteInvoiceRelationDao creditNoteInvoiceRelationDao;
    @Override
    protected Dao<Integer, CreditNoteInvoiceRelation> getDao() {
        return this.creditNoteInvoiceRelationDao;
    }
}
