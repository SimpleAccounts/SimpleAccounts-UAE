package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.SupplierInvoicePaymentDao;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class SupplierInvoicePaymentDaoImpl extends AbstractDao<Integer, SupplierInvoicePayment>
		implements SupplierInvoicePaymentDao {

	@Override
	public List<SupplierInvoicePayment> findAllForInvoice(Integer invoiceId) {
		return getEntityManager().createNamedQuery("findForSupplierInvoice").setParameter("id", invoiceId).getResultList();
	}

	@Override
	public List<SupplierInvoicePayment> findForPayment(Integer paymentId) {
		return getEntityManager().createNamedQuery("findForPayment").setParameter("id", paymentId).getResultList();

	}
}
