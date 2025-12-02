package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.CreditNoteInvoiceRelationDao;
import com.simplevat.entity.CreditNoteInvoiceRelation;
import org.springframework.stereotype.Repository;

@Repository("creditNoteInvoiceRelation")
public class CreditNoteInvoiceRelationDaoImpl extends AbstractDao<Integer, CreditNoteInvoiceRelation> implements CreditNoteInvoiceRelationDao {

}
