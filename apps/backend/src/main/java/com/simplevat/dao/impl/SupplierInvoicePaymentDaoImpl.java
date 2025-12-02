package com.simplevat.dao.impl;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.SupplierInvoicePaymentDao;
import com.simplevat.entity.SupplierInvoicePayment;

@Transactional
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
