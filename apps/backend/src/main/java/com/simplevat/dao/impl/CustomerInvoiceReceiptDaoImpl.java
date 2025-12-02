package com.simplevat.dao.impl;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.CustomerInvoiceReceiptDao;
import com.simplevat.entity.CustomerInvoiceReceipt;

@Repository
@Transactional
public class CustomerInvoiceReceiptDaoImpl extends AbstractDao<Integer, CustomerInvoiceReceipt>
		implements CustomerInvoiceReceiptDao {

	@Override
	public List<CustomerInvoiceReceipt> findAllForInvoice(Integer invoiceId) {
		return getEntityManager().createNamedQuery("findForInvoice").setParameter("id", invoiceId).getResultList();
	}
	
	@Override
	public List<CustomerInvoiceReceipt> findForReceipt(Integer receiptId) {
		return getEntityManager().createNamedQuery("findForReceipt").setParameter("id", receiptId).getResultList();
	}

}
