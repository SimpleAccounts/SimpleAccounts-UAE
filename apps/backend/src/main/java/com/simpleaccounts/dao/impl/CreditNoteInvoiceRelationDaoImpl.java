package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CreditNoteInvoiceRelationDao;
import com.simpleaccounts.entity.CreditNoteInvoiceRelation;
import org.springframework.stereotype.Repository;

@Repository("creditNoteInvoiceRelation")
public class CreditNoteInvoiceRelationDaoImpl extends AbstractDao<Integer, CreditNoteInvoiceRelation> implements CreditNoteInvoiceRelationDao {

}
