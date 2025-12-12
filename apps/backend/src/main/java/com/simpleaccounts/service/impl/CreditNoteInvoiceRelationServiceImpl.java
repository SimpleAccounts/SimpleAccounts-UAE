package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CreditNoteInvoiceRelationDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.CreditNoteInvoiceRelation;

import com.simpleaccounts.service.CreditNoteInvoiceRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("creditNoteInvoiceRelationService")
@RequiredArgsConstructor
public class CreditNoteInvoiceRelationServiceImpl extends CreditNoteInvoiceRelationService {
    private final CreditNoteInvoiceRelationDao creditNoteInvoiceRelationDao;
    @Override
    protected Dao<Integer, CreditNoteInvoiceRelation> getDao() {
        return this.creditNoteInvoiceRelationDao;
    }
}
