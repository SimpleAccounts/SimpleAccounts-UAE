package com.simpleaccounts.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.SupplierInvoicePaymentDao;
import com.simpleaccounts.entity.SupplierInvoicePayment;

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
