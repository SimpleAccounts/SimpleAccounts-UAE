package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CreditNoteInvoiceRelationDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CreditNoteInvoiceRelation;

import com.simpleaccounts.service.CreditNoteInvoiceRelationService;
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
