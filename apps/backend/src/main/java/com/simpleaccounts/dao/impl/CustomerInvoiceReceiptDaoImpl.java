package com.simpleaccounts.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CustomerInvoiceReceiptDao;
import com.simpleaccounts.entity.CustomerInvoiceReceipt;

@Repository
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
